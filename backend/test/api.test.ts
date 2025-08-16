import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import express from 'express';
import { DemoStorage, PhotoBook, PageFormat } from '../storage.ts';

// Create a test app similar to main.ts but without starting the server
function createTestApp() {
    const app = express();
    const storage = new DemoStorage();

    app.use(express.json({ limit: '500mb' }));
    app.use(express.urlencoded({ limit: '500mb', extended: true }));

    app.use((_, res, next) => {
        res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
        res.setHeader("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type");
        next();
    });

    // Simplified endpoints for testing
    app.post('/create', (req, res) => {
        try {
            const newBook = new PhotoBook("Test Photobook", PageFormat.A4, 10);
            const key = storage.createPhotoBook(newBook);
            res.json({ key });
        } catch (error) {
            res.status(500).json({ error: 'Failed to create photobook' });
        }
    });

    app.get('/photobook', (req, res) => {
        try {
            const photobookId = req.query.key as string;
            const photobook = storage.getPhotoBook(photobookId);
            if (photobook) {
                res.json(photobook);
            } else {
                res.status(404).json({ error: 'Photobook not found' });
            }
        } catch (error) {
            res.status(500).json({ error: 'Failed to get photobook' });
        }
    });

    app.post('/upload', (req, res) => {
        try {
            const photobookId = req.query.key as string;
            const { img, coords } = req.body;
            
            if (!photobookId || !img || !coords) {
                return res.status(400).json({ error: 'Missing required fields' });
            }
            
            const { x, y, width, height, dropZoneIndex } = coords;
            storage.addImageToPhotoBook(photobookId, img, x, y, width, height, dropZoneIndex || 0);
            
            res.json({ success: true, dropZoneIndex: dropZoneIndex || 0 });
        } catch (error) {
            res.status(500).json({ error: 'Upload failed' });
        }
    });

    app.put('/update-title', (req, res) => {
        try {
            const photobookId = req.query.key as string;
            const { title } = req.body;
            
            if (!photobookId || !title) {
                return res.status(400).json({ error: 'Missing required fields' });
            }
            
            const success = storage.updatePhotobookTitle(photobookId, title);
            
            if (success) {
                res.json({ success: true, title });
            } else {
                res.status(404).json({ error: 'Photobook not found' });
            }
        } catch (error) {
            res.status(500).json({ error: 'Title update failed' });
        }
    });

    app.delete('/remove-image', (req, res) => {
        try {
            const photobookId = req.query.key as string;
            const dropZoneIndex = parseInt(req.query.dropZoneIndex as string);
            
            if (!photobookId || isNaN(dropZoneIndex)) {
                return res.status(400).json({ error: 'Missing required fields' });
            }
            
            storage.removeImageFromPhotoBook(photobookId, dropZoneIndex);
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: 'Image removal failed' });
        }
    });

    return app;
}

describe('API Endpoints', () => {
    let app: express.Application;

    beforeEach(() => {
        app = createTestApp();
    });

    describe('POST /create', () => {
        it('should create a new photobook and return a key', async () => {
            const response = await request(app)
                .post('/create')
                .expect(200);

            assert.strictEqual(typeof response.body.key, 'string');
            assert.strictEqual(response.body.key.length, 36); // UUID length
        });
    });

    describe('GET /photobook', () => {
        it('should return 404 for non-existent photobook', async () => {
            await request(app)
                .get('/photobook?key=non-existent')
                .expect(404);
        });

        it('should return photobook data for valid key', async () => {
            // First create a photobook
            const createResponse = await request(app)
                .post('/create')
                .expect(200);

            const key = createResponse.body.key;

            // Then retrieve it
            const getResponse = await request(app)
                .get(`/photobook?key=${key}`)
                .expect(200);

            assert.strictEqual(getResponse.body.title, 'Test Photobook');
            assert.strictEqual(getResponse.body.pageCount, 10);
        });
    });

    describe('POST /upload', () => {
        it('should upload image successfully', async () => {
            // Create photobook first
            const createResponse = await request(app)
                .post('/create')
                .expect(200);

            const key = createResponse.body.key;
            const imageData = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';

            const uploadResponse = await request(app)
                .post(`/upload?key=${key}`)
                .send({
                    img: imageData,
                    coords: { x: 100, y: 200, width: 300, height: 400, dropZoneIndex: 0 }
                })
                .expect(200);

            assert.strictEqual(uploadResponse.body.success, true);
            assert.strictEqual(uploadResponse.body.dropZoneIndex, 0);
        });

        it('should return 400 for missing fields', async () => {
            await request(app)
                .post('/upload?key=test')
                .send({ img: 'test' }) // Missing coords
                .expect(400);
        });
    });

    describe('PUT /update-title', () => {
        it('should update photobook title successfully', async () => {
            // Create photobook first
            const createResponse = await request(app)
                .post('/create')
                .expect(200);

            const key = createResponse.body.key;
            const newTitle = 'Updated Title';

            const updateResponse = await request(app)
                .put(`/update-title?key=${key}`)
                .send({ title: newTitle })
                .expect(200);

            assert.strictEqual(updateResponse.body.success, true);
            assert.strictEqual(updateResponse.body.title, newTitle);

            // Verify the title was actually updated
            const getResponse = await request(app)
                .get(`/photobook?key=${key}`)
                .expect(200);

            assert.strictEqual(getResponse.body.title, newTitle);
        });

        it('should return 404 for non-existent photobook', async () => {
            await request(app)
                .put('/update-title?key=non-existent')
                .send({ title: 'New Title' })
                .expect(404);
        });
    });

    describe('DELETE /remove-image', () => {
        it('should remove image successfully', async () => {
            // Create photobook and add image first
            const createResponse = await request(app)
                .post('/create')
                .expect(200);

            const key = createResponse.body.key;
            const imageData = 'data:image/jpeg;base64,test';

            await request(app)
                .post(`/upload?key=${key}`)
                .send({
                    img: imageData,
                    coords: { x: 100, y: 200, width: 300, height: 400, dropZoneIndex: 0 }
                })
                .expect(200);

            // Remove the image
            const removeResponse = await request(app)
                .delete(`/remove-image?key=${key}&dropZoneIndex=0`)
                .expect(200);

            assert.strictEqual(removeResponse.body.success, true);
        });

        it('should return 400 for invalid dropZoneIndex', async () => {
            await request(app)
                .delete('/remove-image?key=test&dropZoneIndex=invalid')
                .expect(400);
        });
    });
});