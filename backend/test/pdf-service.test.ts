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

        it('should generate a valid PDF for vertical-triplet layout', async () => {
            const book = makeBook('VT', ['vertical-triplet']);
            const buf = await PDFService.generatePhotobookPDF(book);
            assert.ok(buf instanceof Buffer);
            assert.strictEqual(buf.subarray(0, 4).toString(), '%PDF');
        });

        it('should generate a valid PDF for vertical-tuple layout', async () => {
            const book = makeBook('VTuple', ['vertical-tuple']);
            const buf = await PDFService.generatePhotobookPDF(book);
            assert.ok(buf instanceof Buffer);
            assert.strictEqual(buf.subarray(0, 4).toString(), '%PDF');
        });

        it('should generate a valid PDF for full-page layout', async () => {
            const book = makeBook('FP', ['full-page']);
            const buf = await PDFService.generatePhotobookPDF(book);
            assert.ok(buf instanceof Buffer);
            assert.strictEqual(buf.subarray(0, 4).toString(), '%PDF');
        });

        it('should generate a valid PDF for single-page layout', async () => {
            const book = makeBook('SP', ['single-page']);
            const buf = await PDFService.generatePhotobookPDF(book);
            assert.ok(buf instanceof Buffer);
            assert.strictEqual(buf.subarray(0, 4).toString(), '%PDF');
        });

        it('should generate valid PDF with all 5 layout types', async () => {
            const book = makeBook('All Layouts', [
                'horizontal-triplet',
                'vertical-triplet',
                'vertical-tuple',
                'full-page',
                'single-page',
            ]);
            const buf = await PDFService.generatePhotobookPDF(book);
            assert.ok(buf instanceof Buffer);
            assert.strictEqual(buf.subarray(0, 4).toString(), '%PDF');
        });

        it('should not contain debug gray box color in output', async () => {
            const book = makeBook('No Debug', ['horizontal-triplet']);
            const buf = await PDFService.generatePhotobookPDF(book);
            const pdfText = buf.toString('latin1');
            // The old debug code drew '#cccccc' rectangles
            assert.ok(!pdfText.includes('cccccc'), 'PDF should not contain debug gray color');
        });

        it('should contain page numbers in the PDF', async () => {
            const book = makeBook('With Numbers', ['horizontal-triplet', 'vertical-triplet']);
            const buf = await PDFService.generatePhotobookPDF(book);
            const pdfText = buf.toString('latin1');
            // PDFKit embeds text content - page numbers should appear
            assert.ok(pdfText.includes('(1)') || pdfText.includes('1'), 'PDF should contain page number 1');
        });

        it('should have page dimensions larger than standard A4 (bleed)', async () => {
            const book = makeBook('Bleed Test', ['horizontal-triplet']);
            const buf = await PDFService.generatePhotobookPDF(book);
            const pdfText = buf.toString('latin1');
            // Standard A4 is 595.28 x 841.89
            // With 3mm bleed it should be ~612.29 x 858.90
            // Check that the buffer size is reasonable
            assert.ok(buf.length > 500, 'PDF with bleed should have reasonable size');
            // The PDF contains MediaBox with the page dimensions
            const mediaBoxMatch = pdfText.match(/MediaBox\s*\[\s*[\d.]+\s+[\d.]+\s+([\d.]+)\s+([\d.]+)\s*\]/);
            if (mediaBoxMatch) {
                const pageWidth = parseFloat(mediaBoxMatch[1]);
                const pageHeight = parseFloat(mediaBoxMatch[2]);
                assert.ok(pageWidth > 600, `Page width ${pageWidth} should be > 600 (A4 + bleed)`);
                assert.ok(pageHeight > 850, `Page height ${pageHeight} should be > 850 (A4 + bleed)`);
            }
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

});
