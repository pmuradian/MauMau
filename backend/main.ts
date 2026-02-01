import { DemoStorage, storage, PhotoBook, PageFormat } from "./storage";
import { PDFService } from "./pdf-service";
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database';
import { authenticate, AuthRequest } from './middleware/auth';

dotenv.config();

const app = express()
const port = 3000

app.use((_, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

// Handle preflight requests
app.options('*', (_, res) => {
  res.sendStatus(200);
});

app.use(express.json({ limit: '500mb' }))
app.use(express.urlencoded({ limit: '500mb', extended: true }))

type UploadInput = {
  file: File;
  fileType: string;
  fileSize: number;
};

type PageInput = {
  page: number;
  arrangement: PageArrangementInput;
};

type PhotoBookInput = {
    title: string;
    pageFormat: PageFormatInput;
    pageCount: number;
}

enum PageArrangementInput {
    GRID,
    COLLAGE,
    SINGLE,
    DOUBLE,
    TRIPLE,
    QUAD,
    PANORAMA,
    FULL_PAGE,
    SPLIT, 
};

enum PageFormatInput {
  A4 = "A4",
  A5 = "A5",
  A6 = "A6",
};

function createPhotoBook(input: PhotoBookInput): string {
    const newBook = new PhotoBook(
        input.title,
        PageFormat.A5,
        input.pageCount
    )

  return storage.createPhotoBook(
    newBook
  );
};

function addPage(input: PageInput): void {
  console.log("Adding page number:", input.page);
};

function upload(uploadInput: UploadInput): void {
  console.log("Uploading file:", uploadInput.file);
  console.log("File type:", uploadInput.fileType);
  console.log("File size:", uploadInput.fileSize);
}

app.get('/', (req, res) => {
    res.send('Hello World!')
});

app.post('/upload', authenticate, (req: AuthRequest, res) => {
    try {
        console.log("Upload endpoint hit");
        const photobookId = req.query.key as string;
        const { img, coords } = req.body;
        
        console.log("Photobook ID:", photobookId);
        console.log("Has image data:", !!img);
        console.log("Coords:", coords);
        
        if (!photobookId || !img || !coords) {
            console.log("Missing required fields");
            return res.status(400).json({ error: 'Missing required fields: key, img, or coords' });
        }
        
        // Extract coordinates and dimensions
        const { x, y, width, height, dropZoneIndex, pageNumber } = coords;
        
        // Use the dropzone index from the frontend, fallback to coordinate-based detection
        let finalDropZoneIndex = dropZoneIndex ?? 0;
        if (dropZoneIndex === undefined) {
            // Fallback: determine dropzone index based on coordinates
            if (x > 300) finalDropZoneIndex = 1; // Right side of top row
            if (y > 400) finalDropZoneIndex = 2; // Bottom dropzone
        }
        
        const finalPageNumber = pageNumber ?? 1;
        
        // Store the image with its placement data
        storage.addImageToPhotoBook(photobookId, img, x, y, width, height, finalDropZoneIndex, finalPageNumber);
        
        console.log(`Image uploaded to photobook ${photobookId} at dropzone ${finalDropZoneIndex}`);
        res.json({ success: true, dropZoneIndex: finalDropZoneIndex });
    } catch (error) {
        console.error('Error in upload endpoint:', error);
        res.status(500).json({ error: 'Internal server error during upload' });
    }
});

app.post('/create', authenticate, (req: AuthRequest, res) => {
    const input: PhotoBookInput = {
        title: "My Photo Book",
        pageFormat: PageFormatInput.A4,
        pageCount: 10
    };
    let newKey = createPhotoBook(input);
    console.log("Created new photo book with key:", newKey);
    res.send(JSON.stringify({
      key: newKey,
    }));
});

app.get('/photobook', authenticate, (req: AuthRequest, res) => {
    const photobookId = req.query.key;
    res.send(
      JSON.stringify(
        storage.getPhotoBook(photobookId)
      )
    )
});

app.get('/add_page', authenticate, (req: AuthRequest, res) => {
    res.send('Hello World! upload')
});

app.delete('/remove-image', authenticate, (req: AuthRequest, res) => {
    try {
        console.log("Remove image endpoint hit");
        const photobookId = req.query.key as string;
        const dropZoneIndex = parseInt(req.query.dropZoneIndex as string);
        
        if (!photobookId || isNaN(dropZoneIndex)) {
            return res.status(400).json({ error: 'Missing required fields: key or dropZoneIndex' });
        }
        
        storage.removeImageFromPhotoBook(photobookId, dropZoneIndex);
        
        console.log(`Image removed from photobook ${photobookId}, dropzone ${dropZoneIndex}`);
        res.json({ success: true });
    } catch (error) {
        console.error('Error in remove image endpoint:', error);
        res.status(500).json({ error: 'Internal server error during image removal' });
    }
});

app.put('/update-title', authenticate, (req: AuthRequest, res) => {
    try {
        console.log("Update title endpoint hit");
        const photobookId = req.query.key as string;
        const { title } = req.body;
        
        if (!photobookId || !title) {
            return res.status(400).json({ error: 'Missing required fields: key or title' });
        }
        
        const success = storage.updatePhotobookTitle(photobookId, title);
        
        if (success) {
            console.log(`Title updated for photobook ${photobookId}: ${title}`);
            res.json({ success: true, title });
        } else {
            res.status(404).json({ error: 'Photobook not found' });
        }
    } catch (error) {
        console.error('Error in update title endpoint:', error);
        res.status(500).json({ error: 'Internal server error during title update' });
    }
});

app.get('/generate-pdf', authenticate, async (req: AuthRequest, res) => {
    try {
        const photobookId = req.query.key as string;
        
        if (!photobookId) {
            return res.status(400).json({ error: 'Missing photobook key' });
        }
        
        const photobook = storage.getPhotoBook(photobookId);
        if (!photobook) {
            return res.status(404).json({ error: 'Photobook not found' });
        }
        
        console.log(`Generating PDF for photobook ${photobookId}`);
        const pdfBuffer = await PDFService.generatePhotobookPDF(photobook);
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${photobook.title || 'photobook'}.pdf"`);
        res.send(pdfBuffer);
        
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).json({ error: 'Failed to generate PDF' });
    }
});

// Connect to MongoDB then start server
connectDB().then(() => {
    app.listen(port, () => {
        console.log(`Photobook API server listening on port ${port}`)
    })
}).catch((error) => {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
});

