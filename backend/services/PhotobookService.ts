import { Types } from 'mongoose';
import { Photobook, IPhotobook, LayoutType, IPage, IImagePlacement } from '../models/Photobook';
import { storageProvider } from '../storage';


export class PhotobookService {
  /**
   * Create a new photobook for a user
   */
  static async create(userId: string, title?: string): Promise<string> {
    const photobook = new Photobook({
      userId: new Types.ObjectId(userId),
      title: title || 'Untitled Photobook',
      pages: [],
      pageOrder: []
    });

    await photobook.save();
    return photobook._id.toString();
  }

  /**
   * Fetch a photobook and run a callback with it, returning `notFound` if it doesn't exist.
   */
  private static async withPhotobook<T>(
    userId: string,
    photobookId: string,
    notFound: T,
    fn: (photobook: IPhotobook) => Promise<T>
  ): Promise<T> {
    const photobook = await this.get(userId, photobookId);
    if (!photobook) return notFound;
    return fn(photobook);
  }

  /**
   * Get a photobook by ID, ensuring it belongs to the user
   */
  static async get(userId: string, photobookId: string): Promise<IPhotobook | null> {
    if (!Types.ObjectId.isValid(photobookId)) {
      return null;
    }

    return Photobook.findOne({
      _id: new Types.ObjectId(photobookId),
      userId: new Types.ObjectId(userId)
    });
  }

  /**
   * Get all photobooks for a user
   */
  static async listByUser(userId: string): Promise<IPhotobook[]> {
    return Photobook.find({
      userId: new Types.ObjectId(userId)
    }).sort({ createdAt: -1 });
  }

  /**
   * Delete a photobook
   */
  static async delete(userId: string, photobookId: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(photobookId)) {
      return false;
    }

    const photobook = await this.get(userId, photobookId);
    const imageUrls: string[] = [];
    if (photobook) {
      for (const page of photobook.pages) {
        for (const img of page.images) {
          if (img.imageUrl) imageUrls.push(img.imageUrl);
        }
      }
    }

    const result = await Photobook.deleteOne({
      _id: new Types.ObjectId(photobookId),
      userId: new Types.ObjectId(userId)
    });

    if (result.deletedCount > 0) {
      await Promise.allSettled(imageUrls.map((url) => storageProvider.deleteFile(url)));
      return true;
    }

    return false;
  }

  /**
   * Add or update an image on a page
   */
  static async addImage(
    userId: string,
    photobookId: string,
    imageUrl: string,
    dropZoneIndex: number,
    pageNumber: number,
    layout: LayoutType
  ): Promise<boolean> {
    return this.withPhotobook(userId, photobookId, false, async (photobook) => {
      photobook.setImage(pageNumber, layout, imageUrl, dropZoneIndex);
      await photobook.save();
      return true;
    });
  }

  /**
   * Remove an image from a page
   */
  static async removeImage(
    userId: string,
    photobookId: string,
    pageNumber: number,
    dropZoneIndex: number
  ): Promise<boolean> {
    return this.withPhotobook(userId, photobookId, false, async (photobook) => {
      const page = photobook.pages.find((p: IPage) => p.pageNumber === pageNumber);
      const image = page?.images.find((img: IImagePlacement) => img.dropZoneIndex === dropZoneIndex);
      const imageUrl = image?.imageUrl;

      const removed = photobook.removeImage(pageNumber, dropZoneIndex);
      if (removed) {
        await photobook.save();
        if (imageUrl) {
          storageProvider.deleteFile(imageUrl).catch((err) =>
            console.error('Failed to delete image file from storage:', err)
          );
        }
      }
      return removed;
    });
  }

  /**
   * Update photobook title
   */
  static async updateTitle(
    userId: string,
    photobookId: string,
    title: string
  ): Promise<boolean> {
    if (!Types.ObjectId.isValid(photobookId)) {
      return false;
    }

    const result = await Photobook.updateOne(
      {
        _id: new Types.ObjectId(photobookId),
        userId: new Types.ObjectId(userId)
      },
      { $set: { title } }
    );

    return result.matchedCount > 0;
  }

  /**
   * Add a new page to the photobook
   */
  static async addPage(
    userId: string,
    photobookId: string,
    layout: LayoutType = 'horizontal-triplet'
  ): Promise<number | null> {
    return this.withPhotobook(userId, photobookId, null, async (photobook) => {
      const pageNumber = photobook.addPage(layout);
      await photobook.save();
      return pageNumber;
    });
  }

  /**
   * Update page order
   */
  static async updatePageOrder(
    userId: string,
    photobookId: string,
    order: number[]
  ): Promise<boolean> {
    return this.withPhotobook(userId, photobookId, false, async (photobook) => {
      photobook.setPageOrder(order);
      await photobook.save();
      return true;
    });
  }

  /**
   * Update page layout
   */
  static async updatePageLayout(
    userId: string,
    photobookId: string,
    pageNumber: number,
    layout: LayoutType
  ): Promise<boolean> {
    return this.withPhotobook(userId, photobookId, false, async (photobook) => {
      const page = photobook.pages.find((p: IPage) => p.pageNumber === pageNumber);
      if (!page) return false;

      page.layout = layout;
      await photobook.save();
      return true;
    });
  }
}
