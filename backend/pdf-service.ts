import PDFDocument from 'pdfkit';
import { IPhotobook, IImagePlacement, IPage } from './models/Photobook';
import { storageProvider } from './storage';
import { calculateDropzones, Rect } from './pdf-layouts';

// 3mm bleed in points (3 * 72 / 25.4)
const BLEED = 3 * 72 / 25.4;

// Standard A4 dimensions in points
const A4_WIDTH = 595.28;
const A4_HEIGHT = 841.89;

// Page with bleed
const PAGE_WIDTH = A4_WIDTH + 2 * BLEED;
const PAGE_HEIGHT = A4_HEIGHT + 2 * BLEED;

// Space reserved at the bottom for page numbers
const PAGE_NUMBER_SPACE = 30;

// Content area mirrors frontend .paper-content CSS: 15% left padding, 5% right padding
const CONTENT_X = BLEED + A4_WIDTH * 0.15;
const CONTENT_Y = BLEED;
const CONTENT_W = A4_WIDTH * 0.80;
const CONTENT_H = A4_HEIGHT - PAGE_NUMBER_SPACE;

export class PDFService {
    static async generatePhotobookPDF(photobook: IPhotobook): Promise<Buffer> {
        const doc = new PDFDocument({
            size: [PAGE_WIDTH, PAGE_HEIGHT],
            margin: 0,
        });

        const chunks: Buffer[] = [];
        const streamDone = new Promise<Buffer>((resolve, reject) => {
            doc.on('data', (chunk: Buffer) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);
        });

        try {
            if (photobook.pages.length === 0) {
                doc.text('No images uploaded yet', 50, 50);
            } else {
                for (const [pageIndex, page] of photobook.pages.entries()) {
                    if (pageIndex > 0) {
                        doc.addPage();
                    }
                    await this.renderPage(doc, page);
                }
            }
        } catch (error) {
            console.error('Error generating PDF:', error);
            doc.end();
            throw error;
        }

        doc.end();
        return streamDone;
    }

    private static async renderPage(doc: PDFKit.PDFDocument, page: IPage): Promise<void> {
        const contentArea: Rect = {
            x: CONTENT_X,
            y: CONTENT_Y,
            width: CONTENT_W,
            height: CONTENT_H,
        };

        const dropzones = calculateDropzones(page.layout, contentArea);

        for (const imagePlacement of page.images) {
            const dropzone = dropzones[imagePlacement.dropZoneIndex];
            if (dropzone) {
                await this.placeImageInDropzone(doc, imagePlacement, dropzone);
            }
        }

        this.renderPageNumber(doc, page.pageNumber);
    }

    private static renderPageNumber(doc: PDFKit.PDFDocument, pageNumber: number): void {
        doc.font('Helvetica')
           .fontSize(10)
           .fillColor('#666666');

        const trimCenterX = BLEED + A4_WIDTH / 2;
        const numberY = BLEED + A4_HEIGHT - 15;

        doc.text(
            String(pageNumber),
            trimCenterX - 50,
            numberY,
            { width: 100, align: 'center' },
        );
    }

    private static async placeImageInDropzone(
        doc: PDFKit.PDFDocument,
        imagePlacement: IImagePlacement,
        dropzone: Rect,
    ): Promise<void> {
        try {
            if (!storageProvider.isValidUrl(imagePlacement.imageUrl)) {
                console.error(`Refused to fetch image from untrusted URL: ${imagePlacement.imageUrl}`);
                return;
            }

            const response = await fetch(imagePlacement.imageUrl);
            if (!response.ok) {
                console.error(`Failed to fetch image from ${imagePlacement.imageUrl}: ${response.status}`);
                return;
            }
            const arrayBuffer = await response.arrayBuffer();
            const imageBuffer = Buffer.from(arrayBuffer);

            doc.image(imageBuffer, dropzone.x, dropzone.y, {
                fit: [dropzone.width, dropzone.height],
                align: 'center',
                valign: 'center',
            });
        } catch (error) {
            console.error('Error placing image in PDF:', error);
        }
    }
}
