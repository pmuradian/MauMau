import mongoose, { Schema, Types } from 'mongoose';

// Layout types matching frontend LayoutSelector.tsx
export type LayoutType =
  | 'horizontal-triplet'
  | 'vertical-triplet'
  | 'vertical-tuple'
  | 'full-page'
  | 'single-page';

export interface IImagePlacement {
  imageUrl: string;
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
  setImage(pageNumber: number, layout: LayoutType, imageUrl: string, dropZoneIndex: number): void;
  removeImage(pageNumber: number, dropZoneIndex: number): boolean;
  setPageOrder(newOrder: number[]): void;
  addPage(layout?: LayoutType): number;
}

export const MAX_PAGES = 200;
export const MAX_IMAGES_PER_PAGE = 10;
export const MAX_DROP_ZONE_INDEX = 9;

const imagePlacementSchema = new Schema<IImagePlacement>({
  imageUrl: {
    type: String,
    required: true
  },
  dropZoneIndex: {
    type: Number,
    required: true,
    min: [0, 'dropZoneIndex must be >= 0'],
    max: [MAX_DROP_ZONE_INDEX, `dropZoneIndex must be <= ${MAX_DROP_ZONE_INDEX}`]
  }
}, { _id: false });

const pageSchema = new Schema<IPage>({
  pageNumber: {
    type: Number,
    required: true,
    min: [1, 'pageNumber must be >= 1'],
    max: [MAX_PAGES, `pageNumber must be <= ${MAX_PAGES}`]
  },
  layout: {
    type: String,
    enum: ['horizontal-triplet', 'vertical-triplet', 'vertical-tuple', 'full-page', 'single-page'],
    default: 'horizontal-triplet'
  },
  images: {
    type: [imagePlacementSchema],
    default: [],
    validate: {
      validator: (images: IImagePlacement[]) => images.length <= MAX_IMAGES_PER_PAGE,
      message: `A page cannot have more than ${MAX_IMAGES_PER_PAGE} images`
    }
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
    default: [],
    validate: {
      validator: (pages: IPage[]) => pages.length <= MAX_PAGES,
      message: `A photobook cannot have more than ${MAX_PAGES} pages`
    }
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
  imageUrl: string,
  dropZoneIndex: number
): void {
  if (pageNumber < 1 || pageNumber > MAX_PAGES) {
    throw new Error(`pageNumber must be between 1 and ${MAX_PAGES}`);
  }
  if (dropZoneIndex < 0 || dropZoneIndex > MAX_DROP_ZONE_INDEX) {
    throw new Error(`dropZoneIndex must be between 0 and ${MAX_DROP_ZONE_INDEX}`);
  }

  let page = this.pages.find((p: IPage) => p.pageNumber === pageNumber);

  if (!page) {
    this.pages.push({ pageNumber, layout, images: [] });
    if (!this.pageOrder.includes(pageNumber)) {
      this.pageOrder.push(pageNumber);
    }
    // Re-fetch the subdocument: Mongoose casts the pushed object into a new
    // subdocument instance, so the original reference is stale.
    page = this.pages[this.pages.length - 1];
  }

  // Remove existing image in this dropzone
  page.images = page.images.filter((img: IImagePlacement) => img.dropZoneIndex !== dropZoneIndex);

  // Add new image
  page.images.push({ imageUrl, dropZoneIndex });
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
  if (this.pages.length >= MAX_PAGES) {
    throw new Error(`A photobook cannot have more than ${MAX_PAGES} pages`);
  }

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
