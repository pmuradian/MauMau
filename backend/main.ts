import express, { Response } from 'express';
import dotenv from 'dotenv';
import connectDB from './config/database';
import { authenticate, AuthRequest } from './middleware/auth';
import { PhotobookService } from './services/PhotobookService';
import { LayoutType } from './models/Photobook';
import { PDFService } from './pdf-service';

dotenv.config();

const app = express();
const port = 3000;

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

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Health check endpoint (no auth required)
app.get('/', (_, res) => {
    res.send('Photobook API is running');
});

app.post('/upload', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!._id.toString();
        const photobookId = req.query.key as string;
        const { img, dropZoneIndex, pageNumber, layout } = req.body;

        if (!photobookId || !img || dropZoneIndex === undefined) {
            return res.status(400).json({ error: 'Missing required fields: key, img, or dropZoneIndex' });
        }

        const finalPageNumber = pageNumber ?? 1;
        const finalLayout: LayoutType = layout || 'horizontal-triplet';

        const success = await PhotobookService.addImage(
            userId,
            photobookId,
            img,
            dropZoneIndex,
            finalPageNumber,
            finalLayout
        );

        if (!success) {
            return res.status(404).json({ error: 'Photobook not found' });
        }

        console.log(`Image uploaded to photobook ${photobookId} at dropzone ${dropZoneIndex}`);
        res.json({ success: true, dropZoneIndex });
    } catch (error) {
        console.error('Error in upload endpoint:', error);
        res.status(500).json({ error: 'Internal server error during upload' });
    }
});

app.post('/create', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!._id.toString();
        const { title } = req.body;

        const photobookId = await PhotobookService.create(userId, title);
        console.log("Created new photobook with id:", photobookId);

        res.json({ key: photobookId });
    } catch (error) {
        console.error('Error creating photobook:', error);
        res.status(500).json({ error: 'Failed to create photobook' });
    }
});

app.get('/photobook', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!._id.toString();
        const photobookId = req.query.key as string;

        if (!photobookId) {
            return res.status(400).json({ error: 'Missing photobook key' });
        }

        const photobook = await PhotobookService.get(userId, photobookId);
        if (!photobook) {
            return res.status(404).json({ error: 'Photobook not found' });
        }

        res.json(photobook);
    } catch (error) {
        console.error('Error fetching photobook:', error);
        res.status(500).json({ error: 'Failed to fetch photobook' });
    }
});

app.delete('/remove-image', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!._id.toString();
        const photobookId = req.query.key as string;
        const dropZoneIndex = parseInt(req.query.dropZoneIndex as string);
        const pageNumber = parseInt(req.query.pageNumber as string) || 1;

        if (!photobookId || isNaN(dropZoneIndex)) {
            return res.status(400).json({ error: 'Missing required fields: key or dropZoneIndex' });
        }

        const success = await PhotobookService.removeImage(userId, photobookId, pageNumber, dropZoneIndex);

        if (!success) {
            return res.status(404).json({ error: 'Image not found' });
        }

        console.log(`Image removed from photobook ${photobookId}, page ${pageNumber}, dropzone ${dropZoneIndex}`);
        res.json({ success: true });
    } catch (error) {
        console.error('Error in remove image endpoint:', error);
        res.status(500).json({ error: 'Internal server error during image removal' });
    }
});

app.put('/update-title', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!._id.toString();
        const photobookId = req.query.key as string;
        const { title } = req.body;

        if (!photobookId || !title) {
            return res.status(400).json({ error: 'Missing required fields: key or title' });
        }

        const success = await PhotobookService.updateTitle(userId, photobookId, title);

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

// List all photobooks for the authenticated user
app.get('/photobooks', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!._id.toString();
        const photobooks = await PhotobookService.listByUser(userId);
        res.json(photobooks);
    } catch (error) {
        console.error('Error listing photobooks:', error);
        res.status(500).json({ error: 'Failed to list photobooks' });
    }
});

// Delete a photobook
app.delete('/photobook', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!._id.toString();
        const photobookId = req.query.key as string;

        if (!photobookId) {
            return res.status(400).json({ error: 'Missing photobook key' });
        }

        const success = await PhotobookService.delete(userId, photobookId);

        if (!success) {
            return res.status(404).json({ error: 'Photobook not found' });
        }

        console.log(`Photobook ${photobookId} deleted`);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting photobook:', error);
        res.status(500).json({ error: 'Failed to delete photobook' });
    }
});

// Add a new page to a photobook
app.post('/add-page', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!._id.toString();
        const photobookId = req.query.key as string;
        const { layout } = req.body;

        if (!photobookId) {
            return res.status(400).json({ error: 'Missing photobook key' });
        }

        const pageNumber = await PhotobookService.addPage(userId, photobookId, layout || 'horizontal-triplet');

        if (pageNumber === null) {
            return res.status(404).json({ error: 'Photobook not found' });
        }

        console.log(`Added page ${pageNumber} to photobook ${photobookId}`);
        res.json({ success: true, pageNumber });
    } catch (error) {
        console.error('Error adding page:', error);
        res.status(500).json({ error: 'Failed to add page' });
    }
});

// Update page order
app.put('/page-order', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!._id.toString();
        const photobookId = req.query.key as string;
        const { order } = req.body;

        if (!photobookId || !order || !Array.isArray(order)) {
            return res.status(400).json({ error: 'Missing required fields: key or order array' });
        }

        const success = await PhotobookService.updatePageOrder(userId, photobookId, order);

        if (!success) {
            return res.status(404).json({ error: 'Photobook not found' });
        }

        console.log(`Page order updated for photobook ${photobookId}`);
        res.json({ success: true });
    } catch (error) {
        console.error('Error updating page order:', error);
        res.status(500).json({ error: 'Failed to update page order' });
    }
});

// Update page layout
app.put('/page-layout', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!._id.toString();
        const photobookId = req.query.key as string;
        const { pageNumber, layout } = req.body;

        if (!photobookId || pageNumber === undefined || !layout) {
            return res.status(400).json({ error: 'Missing required fields: key, pageNumber, or layout' });
        }

        const success = await PhotobookService.updatePageLayout(userId, photobookId, pageNumber, layout);

        if (!success) {
            return res.status(404).json({ error: 'Photobook or page not found' });
        }

        console.log(`Layout updated for page ${pageNumber} in photobook ${photobookId}`);
        res.json({ success: true });
    } catch (error) {
        console.error('Error updating page layout:', error);
        res.status(500).json({ error: 'Failed to update page layout' });
    }
});

app.get('/generate-pdf', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!._id.toString();
        const photobookId = req.query.key as string;

        if (!photobookId) {
            return res.status(400).json({ error: 'Missing photobook key' });
        }

        const photobook = await PhotobookService.get(userId, photobookId);
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

