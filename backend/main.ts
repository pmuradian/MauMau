import express, { Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import connectDB from './config/database';
import { authenticate, AuthRequest } from './middleware/auth';
import { PhotobookService } from './services/PhotobookService';
import { LayoutType } from './models/Photobook';
import { PDFService } from './pdf-service';
import authRoutes from './routes/auth';
import { storageProvider } from './storage';
import { validatePageParams, contentTypeToExtension } from './utils/validation';

dotenv.config();

const app = express();
const port = 3000;

const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';
const UPLOAD_SIZE_LIMIT = process.env.UPLOAD_SIZE_LIMIT || '50mb';

app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(cookieParser());
app.use(express.json({ limit: UPLOAD_SIZE_LIMIT }));
app.use(express.urlencoded({ limit: UPLOAD_SIZE_LIMIT, extended: true }));

// Serve locally uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Auth routes
app.use('/api/auth', authRoutes);

// Health check endpoint (no auth required)
app.get('/', (_, res) => {
    res.send('Photobook API is running');
});


// Step 1: Request a presigned/local upload URL
app.get('/api/upload-url', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const contentType = (req.query.contentType as string) || 'image/jpeg';
        const ext = contentTypeToExtension(contentType);
        const filename = `${uuidv4()}.${ext}`;

        const result = await storageProvider.getUploadUrl(filename, contentType);
        res.json({ uploadUrl: result.uploadUrl, finalUrl: result.finalUrl });
    } catch (error) {
        console.error('Error generating upload URL:', error);
        res.status(500).json({ error: 'Failed to generate upload URL' });
    }
});

// Step 2 (local dev): Receive raw binary and save to disk
app.put(
    '/api/local-upload/:filename',
    authenticate,
    express.raw({ type: '*/*', limit: UPLOAD_SIZE_LIMIT }),
    async (req: AuthRequest, res: Response) => {
        try {
            // path.basename strips all directory components regardless of encoding,
            // then the regex enforces strictly UUID + allowed image extension.
            const safeName = path.basename(req.params.filename);
            if (!/^[0-9a-f-]{36}\.(jpg|png|webp|gif|heic|heif)$/.test(safeName)) {
                return res.status(400).json({ error: 'Invalid filename' });
            }
            const filename = safeName;

            const uploadsDir = path.join(__dirname, 'uploads');
            await fs.mkdir(uploadsDir, { recursive: true });
            await fs.writeFile(path.join(uploadsDir, filename), req.body);

            res.json({ success: true });
        } catch (error) {
            console.error('Error in local upload:', error);
            res.status(500).json({ error: 'Upload failed' });
        }
    }
);

// Step 3: Confirm the upload and store the URL in MongoDB
app.post('/api/confirm-upload', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!._id.toString();
        const photobookId = req.query.key as string;
        const { imageUrl, dropZoneIndex, pageNumber, layout } = req.body;

        if (!photobookId || !imageUrl || dropZoneIndex === undefined) {
            return res.status(400).json({ error: 'Missing required fields: key, imageUrl, or dropZoneIndex' });
        }

        if (!storageProvider.isValidUrl(imageUrl)) {
            return res.status(400).json({ error: 'Invalid imageUrl: must be a URL issued by this server' });
        }

        const finalPageNumber = pageNumber ?? 1;
        const finalLayout: LayoutType = layout || 'horizontal-triplet';

        const validationError = validatePageParams(finalPageNumber, dropZoneIndex);
        if (validationError) {
            return res.status(400).json({ error: validationError });
        }

        const success = await PhotobookService.addImage(
            userId,
            photobookId,
            imageUrl,
            dropZoneIndex,
            finalPageNumber,
            finalLayout
        );

        if (!success) {
            return res.status(404).json({ error: 'Photobook not found' });
        }

        console.log(`Image confirmed for photobook ${photobookId} at dropzone ${dropZoneIndex}`);
        res.json({ success: true, dropZoneIndex });
    } catch (error) {
        console.error('Error in confirm-upload endpoint:', error);
        res.status(500).json({ error: 'Internal server error during upload confirmation' });
    }
});

app.post('/api/create', authenticate, async (req: AuthRequest, res: Response) => {
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

app.get('/api/photobook', authenticate, async (req: AuthRequest, res: Response) => {
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

app.delete('/api/remove-image', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!._id.toString();
        const photobookId = req.query.key as string;
        const dropZoneIndex = parseInt(req.query.dropZoneIndex as string);
        const pageNumber = parseInt(req.query.pageNumber as string) || 1;

        if (!photobookId || isNaN(dropZoneIndex)) {
            return res.status(400).json({ error: 'Missing required fields: key or dropZoneIndex' });
        }

        const validationError = validatePageParams(pageNumber, dropZoneIndex);
        if (validationError) {
            return res.status(400).json({ error: validationError });
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

app.put('/api/update-title', authenticate, async (req: AuthRequest, res: Response) => {
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
app.get('/api/photobooks', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!._id.toString();
        const photobooks = await PhotobookService.listByUser(userId);
        res.json(photobooks);
    } catch (error) {
        console.error('Error listing photobooks:', error);
        res.status(500).json({ error: 'Failed to list photobooks' });
    }
});

// Delete a photobook and clean up its image files
app.delete('/api/photobook', authenticate, async (req: AuthRequest, res: Response) => {
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
app.post('/api/add-page', authenticate, async (req: AuthRequest, res: Response) => {
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
app.put('/api/page-order', authenticate, async (req: AuthRequest, res: Response) => {
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
app.put('/api/page-layout', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!._id.toString();
        const photobookId = req.query.key as string;
        const { pageNumber, layout } = req.body;

        if (!photobookId || pageNumber === undefined || !layout) {
            return res.status(400).json({ error: 'Missing required fields: key, pageNumber, or layout' });
        }

        const validationError = validatePageParams(pageNumber);
        if (validationError) {
            return res.status(400).json({ error: validationError });
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

app.get('/api/generate-pdf', authenticate, async (req: AuthRequest, res: Response) => {
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

// Error handling middleware
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
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
