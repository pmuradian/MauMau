import PDFDocument from 'pdfkit';
import { PhotoBook, ImagePlacement } from './storage.ts';

export class PDFService {
    // A4 dimensions in points (72 points per inch)
    private static readonly A4_WIDTH = 595.28;
    private static readonly A4_HEIGHT = 841.89;
    
    // Frontend layout dimensions (matching your CSS exactly)
    private static readonly TAILWIND_P4 = 16; // p-4 = 16px in Tailwind
    private static readonly PADDING_TOP_PERCENT = 0.12; // 12% padding top from HorizontalTripplet
    private static readonly GAP = 10; // 10px gap from CSS
    
    // Convert pixels to points (72 points per inch, 96 pixels per inch)
    private static pxToPoints(px: number): number {
        return px * (72 / 96);
    }
    
    static async generatePhotobookPDF(photoBook: PhotoBook): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            try {
                console.log('Generating PDF for photobook:', photoBook.title);
                console.log('Number of pages:', photoBook.pages.length);
                
                const doc = new PDFDocument({
                    size: 'A4',
                    margin: 0
                });
                
                const chunks: Buffer[] = [];
                doc.on('data', chunk => chunks.push(chunk));
                doc.on('end', () => resolve(Buffer.concat(chunks)));
                doc.on('error', reject);
                
                // If no pages, create a blank page
                if (photoBook.pages.length === 0) {
                    console.log('No pages found, creating blank page');
                    doc.text('No images uploaded yet', 50, 50);
                } else {
                    // Process each page
                    photoBook.pages.forEach((page, pageIndex) => {
                        console.log(`Processing page ${pageIndex}, images:`, page.images.length);
                        if (pageIndex > 0) {
                            doc.addPage();
                        }
                        
                        this.renderPage(doc, page);
                    });
                }
                
                doc.end();
            } catch (error) {
                console.error('Error generating PDF:', error);
                reject(error);
            }
        });
    }
    
    private static renderPage(doc: PDFKit.PDFDocument, page: any) {
        // Account for all frontend padding layers:
        // 1. A4Portrait has p-4 (16px padding on all sides)
        // 2. HorizontalTripplet has paddingTop: '12%'
        // 3. CSS gaps of 10px between elements
        
        const p4Padding = this.pxToPoints(this.TAILWIND_P4);
        
        // Available area after p-4 padding
        const availableWidth = this.A4_WIDTH - (2 * p4Padding);
        const availableHeight = this.A4_HEIGHT - (2 * p4Padding);
        
        // HorizontalTripplet 12% top padding within the available area
        const tripletTopPadding = availableHeight * this.PADDING_TOP_PERCENT;
        
        // Content area for the triplet layout
        const contentLeft = p4Padding;
        const contentTop = p4Padding + tripletTopPadding;
        const contentWidth = availableWidth;
        const contentHeight = availableHeight - tripletTopPadding;
        
        const gapPoints = this.pxToPoints(this.GAP);
        
        // HorizontalTripplet layout calculation:
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
        dropzones.forEach((zone, index) => {
            doc.rect(zone.x, zone.y, zone.width, zone.height)
               .stroke('#cccccc');
        });
        
        // Place images in their respective dropzones
        console.log(`Rendering page with ${page.images.length} images`);
        page.images.forEach((imagePlacement: ImagePlacement, index: number) => {
            console.log(`Placing image ${index} in dropzone ${imagePlacement.dropZoneIndex}`);
            const dropzone = dropzones[imagePlacement.dropZoneIndex];
            if (dropzone) {
                this.placeImageInDropzone(doc, imagePlacement, dropzone);
            } else {
                console.log(`No dropzone found for index ${imagePlacement.dropZoneIndex}`);
            }
        });
    }
    
    private static placeImageInDropzone(
        doc: PDFKit.PDFDocument, 
        imagePlacement: ImagePlacement, 
        dropzone: { x: number, y: number, width: number, height: number }
    ) {
        try {
            // Convert base64 to buffer
            const base64Data = imagePlacement.imageData.replace(/^data:image\/[a-z]+;base64,/, '');
            const imageBuffer = Buffer.from(base64Data, 'base64');
            
            // Calculate image dimensions to fit within dropzone while maintaining aspect ratio
            const imageAspectRatio = imagePlacement.width / imagePlacement.height;
            const dropzoneAspectRatio = dropzone.width / dropzone.height;
            
            let imageWidth, imageHeight, imageX, imageY;
            
            if (imageAspectRatio > dropzoneAspectRatio) {
                // Image is wider than dropzone - fit to width
                imageWidth = dropzone.width;
                imageHeight = dropzone.width / imageAspectRatio;
                imageX = dropzone.x;
                imageY = dropzone.y + (dropzone.height - imageHeight) / 2;
            } else {
                // Image is taller than dropzone - fit to height
                imageHeight = dropzone.height;
                imageWidth = dropzone.height * imageAspectRatio;
                imageX = dropzone.x + (dropzone.width - imageWidth) / 2;
                imageY = dropzone.y;
            }
            
            // Place the image
            doc.image(imageBuffer, imageX, imageY, {
                width: imageWidth,
                height: imageHeight
            });
            
        } catch (error) {
            console.error('Error placing image in PDF:', error);
        }
    }
}