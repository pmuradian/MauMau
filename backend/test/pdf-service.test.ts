import { describe, it } from 'node:test';
import assert from 'node:assert';
import { PDFService } from '../pdf-service.ts';
import { PhotoBook, PageFormat, Page, PageArrangement, ImagePlacement } from '../storage.ts';

describe('PDFService', () => {
    describe('generatePhotobookPDF', () => {
        it('should generate PDF for empty photobook', async () => {
            const photobook = new PhotoBook('Test Book', PageFormat.A4, 1);
            
            const pdfBuffer = await PDFService.generatePhotobookPDF(photobook);
            
            assert.ok(pdfBuffer instanceof Buffer);
            assert.ok(pdfBuffer.length > 0);
            
            // Check PDF header
            const pdfHeader = pdfBuffer.subarray(0, 4).toString();
            assert.strictEqual(pdfHeader, '%PDF');
        });

        it('should generate PDF with images', async () => {
            const photobook = new PhotoBook('Test Book with Images', PageFormat.A4, 1);
            
            // Create a page with images
            const page = new Page();
            page.page = 1;
            page.arrangement = PageArrangement.TRIPLE;
            
            // Add test images (minimal base64 encoded 1x1 pixel images)
            const testImageData = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';
            
            page.images.push(new ImagePlacement(testImageData, 100, 100, 200, 200, 0));
            page.images.push(new ImagePlacement(testImageData, 300, 100, 200, 200, 1));
            page.images.push(new ImagePlacement(testImageData, 100, 400, 400, 200, 2));
            
            photobook.pages.push(page);
            
            const pdfBuffer = await PDFService.generatePhotobookPDF(photobook);
            
            assert.ok(pdfBuffer instanceof Buffer);
            assert.ok(pdfBuffer.length > 0);
            
            // PDF with images should be larger than empty PDF
            assert.ok(pdfBuffer.length > 1000);
        });

        it('should handle photobook with multiple pages', async () => {
            const photobook = new PhotoBook('Multi-page Book', PageFormat.A4, 2);
            
            // Add two pages
            for (let i = 0; i < 2; i++) {
                const page = new Page();
                page.page = i + 1;
                page.arrangement = PageArrangement.TRIPLE;
                photobook.pages.push(page);
            }
            
            const pdfBuffer = await PDFService.generatePhotobookPDF(photobook);
            
            assert.ok(pdfBuffer instanceof Buffer);
            assert.ok(pdfBuffer.length > 0);
        });

        it('should handle invalid image data gracefully', async () => {
            const photobook = new PhotoBook('Test Book', PageFormat.A4, 1);
            
            const page = new Page();
            page.page = 1;
            page.arrangement = PageArrangement.TRIPLE;
            
            // Add invalid image data
            page.images.push(new ImagePlacement('invalid-image-data', 100, 100, 200, 200, 0));
            
            photobook.pages.push(page);
            
            // Should not throw an error, but handle gracefully
            const pdfBuffer = await PDFService.generatePhotobookPDF(photobook);
            
            assert.ok(pdfBuffer instanceof Buffer);
            assert.ok(pdfBuffer.length > 0);
        });
    });

    describe('pxToPoints', () => {
        it('should convert pixels to points correctly', () => {
            // Access private method through any for testing
            const pxToPoints = (PDFService as any).pxToPoints;
            
            // 96 pixels = 72 points (standard conversion)
            assert.strictEqual(pxToPoints(96), 72);
            assert.strictEqual(pxToPoints(48), 36);
            assert.strictEqual(pxToPoints(0), 0);
        });
    });
});