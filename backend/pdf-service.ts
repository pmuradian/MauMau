import PDFDocument from 'pdfkit';
import { IPhotobook, IImagePlacement, IPage } from './models/Photobook';

export class PDFService {
    // A4 dimensions in points (72 points per inch)
    private static readonly A4_WIDTH = 595.28;
    private static readonly A4_HEIGHT = 841.89;
    
    // Frontend layout dimensions (matching your CSS exactly)
    private static readonly TAILWIND_P4 = 16; // p-4 = 16px in Tailwind
    private static readonly PADDING_TOP_PERCENT = 0.12; // 12% padding top from HorizontalTriplet
    private static readonly GAP = 10; // 10px gap from CSS
    
    // Convert pixels to points (72 points per inch, 96 pixels per inch)
    private static pxToPoints(px: number): number {
        return px * (72 / 96);
    }
    
    static async generatePhotobookPDF(photobook: IPhotobook): Promise<Buffer> {
        console.log('Generating PDF for photobook:', photobook.title);
        console.log('Number of pages:', photobook.pages.length);

        const doc = new PDFDocument({ size: 'A4', margin: 0 });

        const chunks: Buffer[] = [];
        const streamDone = new Promise<Buffer>((resolve, reject) => {
            doc.on('data', (chunk: Buffer) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);
        });

        try {
            if (photobook.pages.length === 0) {
                console.log('No pages found, creating blank page');
                doc.text('No images uploaded yet', 50, 50);
            } else {
                for (const [pageIndex, page] of photobook.pages.entries()) {
                    console.log(`Processing page ${pageIndex}, images:`, page.images.length);
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
        // Account for all frontend padding layers:
        // 1. A4Portrait has p-4 (16px padding on all sides)
        // 2. HorizontalTriplet has paddingTop: '12%'
        // 3. CSS gaps of 10px between elements
        
        const p4Padding = this.pxToPoints(this.TAILWIND_P4);
        
        // Available area after p-4 padding
        const availableWidth = this.A4_WIDTH - (2 * p4Padding);
        const availableHeight = this.A4_HEIGHT - (2 * p4Padding);
        
        // HorizontalTriplet 12% top padding within the available area
        const tripletTopPadding = availableHeight * this.PADDING_TOP_PERCENT;
        
        // Content area for the triplet layout
        const contentLeft = p4Padding;
        const contentTop = p4Padding + tripletTopPadding;
        const contentWidth = availableWidth;
        const contentHeight = availableHeight - tripletTopPadding;
        
        const gapPoints = this.pxToPoints(this.GAP);
        
        // HorizontalTriplet layout calculation:
        // Top row: two equal dropzones with gap between them
        // Bottom: one dropzone with 1.5 aspect ratio and gap above
        
        // Split content height: top row gets equal space with bottom, minus gaps
        const availableContentHeight = contentHeight - gapPoints; // Account for gap between rows
        const topRowHeight = availableContentHeight * 0.5;
        const bottomHeight = availableContentHeight * 0.5;
        
        // Top row dropzones (side by side with gap)
        const topDropzoneWidth = (contentWidth - gapPoints) / 2;
        const topDropzoneHeight = topRowHeight;
        
        // Bottom dropzone spans full width
        const bottomDropzoneWidth = contentWidth;
        const bottomDropzoneHeight = bottomHeight;
        
        // Define dropzone areas with exact frontend positioning
        const dropzones = [
            // Top left dropzone (index 0)
            {
                x: contentLeft,
                y: contentTop,
                width: topDropzoneWidth,
                height: topDropzoneHeight
            },
            // Top right dropzone (index 1)
            {
                x: contentLeft + topDropzoneWidth + gapPoints,
                y: contentTop,
                width: topDropzoneWidth,
                height: topDropzoneHeight
            },
            // Bottom dropzone (index 2)
            {
                x: contentLeft,
                y: contentTop + topRowHeight + gapPoints,
                width: bottomDropzoneWidth,
                height: bottomDropzoneHeight
            }
        ];
        
        // Debug: Draw dropzone boundaries (optional - remove in production)
        dropzones.forEach((zone) => {
            doc.rect(zone.x, zone.y, zone.width, zone.height)
               .stroke('#cccccc');
        });
        
        // Place images in their respective dropzones
        console.log(`Rendering page with ${page.images.length} images`);
        for (const [index, imagePlacement] of page.images.entries()) {
            console.log(`Placing image ${index} in dropzone ${imagePlacement.dropZoneIndex}`);
            const dropzone = dropzones[imagePlacement.dropZoneIndex];
            if (dropzone) {
                await this.placeImageInDropzone(doc, imagePlacement, dropzone);
            } else {
                console.log(`No dropzone found for index ${imagePlacement.dropZoneIndex}`);
            }
        }
    }

    private static async placeImageInDropzone(
        doc: PDFKit.PDFDocument,
        imagePlacement: IImagePlacement,
        dropzone: { x: number, y: number, width: number, height: number }
    ): Promise<void> {
        try {
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
                valign: 'center'
            });
        } catch (error) {
            console.error('Error placing image in PDF:', error);
        }
    }
}