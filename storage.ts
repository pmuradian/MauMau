import {v4 as uuidv4} from 'uuid';

interface Persistance {
    setItem(key: string, value: any): void;
    getItem(key: string): any;
    removeItem(key: string): void;
}
  
 export class Page {
    page: number;
    arrangement: PageArrangement;
  };
  
 export class PhotoBook {
      title: string;
      pageFormat: PageFormat;
      pageCount: number;
      
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
        this.storage[key] = value;
    }

    createPhotoBook(input: PhotoBook): string {
        console.log("Creating photo book with title:", input.title);
        let newKey = uuidv4();
        this.storage[newKey] = input;
        return newKey;
    }

    deletePhotoBook(key: string): void {
        console.log("Deleting photo book with title:", key);
        delete this.storage[key];
    }

    getPhotoBook(key: string): PhotoBook | null {
        console.log("Getting photo book with title:", key);
        return this.storage[key] || null;
    }
}

export const storage = new DemoStorage()