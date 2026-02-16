import mongoose, { Schema, Types } from 'mongoose';

// Layout types matching frontend LayoutSelector.tsx
export type LayoutType =
  | 'horizontal-triplet'
  | 'vertical-triplet'
  | 'vertical-tuple'
  | 'full-page'
  | 'single-page';

export interface IImagePlacement {
  imageData: string;
  dropZoneIndex: number;
}

export interface IPage {
  pageNumber: number;
  layout: LayoutType;
  images: IImagePlacement[];
}

export interface IPhotobook extends mongoose.Document {
  userId: Types.ObjectId;
  title: string;
  description: string;
  pages: IPage[];
  pageOrder: number[];
  createdAt: Date;
  updatedAt: Date;
  setImage(pageNumber: number, layout: LayoutType, imageData: string, dropZoneIndex: number): void;
  removeImage(pageNumber: number, dropZoneIndex: number): boolean;
  setPageOrder(newOrder: number[]): void;
  addPage(layout?: LayoutType): number;
}

const imagePlacementSchema = new Schema<IImagePlacement>({
  imageData: {
    type: String,
    required: true
  },
  dropZoneIndex: {
    type: Number,
    required: true
  }
}, { _id: false });

const pageSchema = new Schema<IPage>({
  pageNumber: {
    type: Number,
    required: true
  },
  layout: {
    type: String,
    enum: ['horizontal-triplet', 'vertical-triplet', 'vertical-tuple', 'full-page', 'single-page'],
    default: 'horizontal-triplet'
  },
  images: {
    type: [imagePlacementSchema],
    default: []
  }
}, { _id: false });

const photobookSchema = new Schema<IPhotobook>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  title: {
    type: String,
    default: 'Untitled Photobook',
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    default: '',
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  pages: {
    type: [pageSchema],
    default: []
  },
  pageOrder: {
    type: [Number],
    default: []
  }
}, {
  timestamps: true
});

// Index for efficient user photobook queries
photobookSchema.index({ userId: 1, createdAt: -1 });

// Method to add or update an image on a page
photobookSchema.methods.setImage = function(
  pageNumber: number,
  layout: LayoutType,
  imageData: string,
  dropZoneIndex: number
): void {
  let page = this.pages.find((p: IPage) => p.pageNumber === pageNumber);

  if (!page) {
    page = { pageNumber, layout, images: [] };
    this.pages.push(page);
    if (!this.pageOrder.includes(pageNumber)) {
      this.pageOrder.push(pageNumber);
    }
  }

  // Remove existing image in this dropzone
  page.images = page.images.filter((img: IImagePlacement) => img.dropZoneIndex !== dropZoneIndex);

  // Add new image
  page.images.push({ imageData, dropZoneIndex });
};

// Method to remove an image from a page
photobookSchema.methods.removeImage = function(pageNumber: number, dropZoneIndex: number): boolean {
  const page = this.pages.find((p: IPage) => p.pageNumber === pageNumber);
  if (!page) return false;

  const initialCount = page.images.length;
  page.images = page.images.filter((img: IImagePlacement) => img.dropZoneIndex !== dropZoneIndex);
  return page.images.length < initialCount;
};

// Method to update page order
photobookSchema.methods.setPageOrder = function(newOrder: number[]): void {
  this.pageOrder = newOrder;
};

// Method to add a new page
photobookSchema.methods.addPage = function(layout: LayoutType = 'horizontal-triplet'): number {
  const maxPageNumber = this.pages.reduce((max: number, p: IPage) => Math.max(max, p.pageNumber), 0);
  const newPageNumber = maxPageNumber + 1;

  this.pages.push({
    pageNumber: newPageNumber,
    layout,
    images: []
  });
  this.pageOrder.push(newPageNumber);

  return newPageNumber;
};

export const Photobook = mongoose.model<IPhotobook>('Photobook', photobookSchema);
