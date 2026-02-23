import { describe, it } from 'node:test';
import assert from 'node:assert';
import mongoose from 'mongoose';
import { PDFService } from '../pdf-service';
import { Photobook } from '../models/Photobook';

// Pages with no images still produce a valid PDF (layout boxes drawn, no fetches needed)
function makeBook(title: string, pageLayouts: string[] = []) {
    const pages = pageLayouts.map((layout, i) => ({
        pageNumber: i + 1,
        layout,
        images: [],
    }));
    return new Photobook({
        userId: new mongoose.Types.ObjectId(),
        title,
        pages,
        pageOrder: pages.map(p => p.pageNumber),
    });
}

describe('PDFService', () => {
    describe('generatePhotobookPDF', () => {
        it('should generate a valid PDF for an empty photobook (no pages)', async () => {
            const book = makeBook('Empty Book');
            const buf = await PDFService.generatePhotobookPDF(book);

            assert.ok(buf instanceof Buffer);
            assert.ok(buf.length > 0);
            assert.strictEqual(buf.subarray(0, 4).toString(), '%PDF');
        });

        it('should generate a valid PDF for a single-page photobook', async () => {
            const book = makeBook('One Page', ['horizontal-triplet']);
            const buf = await PDFService.generatePhotobookPDF(book);

            assert.ok(buf instanceof Buffer);
            assert.strictEqual(buf.subarray(0, 4).toString(), '%PDF');
        });

        it('should generate a valid PDF for a multi-page photobook', async () => {
            const book = makeBook('Multi Page', [
                'horizontal-triplet',
                'vertical-triplet',
                'single-page',
            ]);
            const buf = await PDFService.generatePhotobookPDF(book);

            assert.ok(buf instanceof Buffer);
            assert.strictEqual(buf.subarray(0, 4).toString(), '%PDF');
            // Multi-page PDF is larger than single-page
            const singleBuf = await PDFService.generatePhotobookPDF(makeBook('One Page', ['single-page']));
            assert.ok(buf.length > singleBuf.length);
        });

        it('should not throw when an image URL is untrusted (SSRF guard)', async () => {
            // Construct a page with an untrusted imageUrl directly in the document
            const book = new Photobook({
                userId: new mongoose.Types.ObjectId(),
                title: 'Malicious Book',
                pages: [{
                    pageNumber: 1,
                    layout: 'horizontal-triplet',
                    images: [{ imageUrl: 'http://169.254.169.254/latest/meta-data/', dropZoneIndex: 0 }],
                }],
                pageOrder: [1],
            });

            // Should complete without throwing — isValidUrl rejects the fetch silently
            const buf = await PDFService.generatePhotobookPDF(book);
            assert.ok(buf instanceof Buffer);
            assert.strictEqual(buf.subarray(0, 4).toString(), '%PDF');
        });
    });

    describe('pxToPoints', () => {
        it('should convert pixels to points correctly', () => {
            const pxToPoints = (PDFService as any).pxToPoints.bind(PDFService);
            assert.strictEqual(pxToPoints(96), 72);
            assert.strictEqual(pxToPoints(48), 36);
            assert.strictEqual(pxToPoints(0), 0);
        });
    });
});
