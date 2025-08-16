import {v4 as uuidv4} from 'uuid';

interface Persistance {
    setItem(key: string, value: any): void;
    getItem(key: string): any;
    removeItem(key: string): void;
}
  
 export class Page {
    page: number;
    arrangement: PageArrangement;
    images: ImagePlacement[] = [];
  };

  export class ImagePlacement {
    imageData: string;
    x: number;
    y: number;
    width: number;
    height: number;
    dropZoneIndex: number;

    constructor(imageData: string, x: number, y: number, width: number, height: number, dropZoneIndex: number) {
        this.imageData = imageData;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.dropZoneIndex = dropZoneIndex;
    }
  };
  
 export class PhotoBook {
      title: string;
      pageFormat: PageFormat;
      pageCount: number;
      pages: Page[] = [];
      
      constructor(title: string, pageFormat: PageFormat, pageCount: number) {
          this.title = title;
          this.pageFormat = pageFormat;
          this.pageCount = pageCount;
      }
  }
  
 export enum PageArrangement {
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
  
 export enum PageFormat {
    A4 = "A4",
    A5 = "A5",
    A6 = "A6",
  };

export class DemoStorage {
    private storage = new Map<string, PhotoBook>();
    
    updateItem(key: string, value: PhotoBook): void {
        console.log("Updating item with key:", key);
        this.storage.set(key, value);
    }

    createPhotoBook(input: PhotoBook): string {
        console.log("Creating photo book with title:", input.title);
        let newKey = uuidv4();
        this.storage.set(newKey, input);
        return newKey;
    }

    deletePhotoBook(key: string): void {
        console.log("Deleting photo book with title:", key);
        this.storage.delete(key);
    }

    getPhotoBook(key: string): PhotoBook | null {
        console.log("Getting photo book with title:", key);
        return this.storage.get(key) || null;
    }

    addImageToPhotoBook(key: string, imageData: string, x: number, y: number, width: number, height: number, dropZoneIndex: number): void {
        console.log(`Attempting to add image to photobook ${key}`);
        const photoBook = this.storage.get(key);
        if (photoBook) {
            console.log(`Found photobook: ${photoBook.title}`);
            // Ensure we have at least one page
            if (photoBook.pages.length === 0) {
                console.log('Creating new page');
                const newPage = new Page();
                newPage.page = 1;
                newPage.arrangement = PageArrangement.TRIPLE;
                photoBook.pages.push(newPage);
            }
            
            const currentPage = photoBook.pages[0]; // For now, just use the first page
            
            // Remove any existing image in this dropzone first
            currentPage.images = currentPage.images.filter(img => img.dropZoneIndex !== dropZoneIndex);
            
            const imagePlacement = new ImagePlacement(imageData, x, y, width, height, dropZoneIndex);
            currentPage.images.push(imagePlacement);
            
            console.log(`Added image to photobook ${key}, page ${currentPage.page}, dropzone ${dropZoneIndex}`);
            console.log(`Total images on page: ${currentPage.images.length}`);
        } else {
            console.log(`Photobook not found for key: ${key}`);
        }
    }

    removeImageFromPhotoBook(key: string, dropZoneIndex: number): void {
        console.log(`Attempting to remove image from photobook ${key}, dropzone ${dropZoneIndex}`);
        const photoBook = this.storage.get(key);
        if (photoBook && photoBook.pages.length > 0) {
            const currentPage = photoBook.pages[0];
            const initialCount = currentPage.images.length;
            currentPage.images = currentPage.images.filter(img => img.dropZoneIndex !== dropZoneIndex);
            const finalCount = currentPage.images.length;
            
            console.log(`Removed ${initialCount - finalCount} image(s) from dropzone ${dropZoneIndex}`);
            console.log(`Total images on page: ${finalCount}`);
        } else {
            console.log(`Photobook not found for key: ${key}`);
        }
    }

    updatePhotobookTitle(key: string, newTitle: string): boolean {
        console.log(`Attempting to update photobook ${key} title to: ${newTitle}`);
        const photoBook = this.storage.get(key);
        if (photoBook) {
            photoBook.title = newTitle;
            console.log(`Updated photobook title successfully`);
            return true;
        } else {
            console.log(`Photobook not found for key: ${key}`);
            return false;
        }
    }
}

export const storage = new DemoStorage()