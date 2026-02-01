import { Types } from 'mongoose';
import { Photobook, IPhotobook, LayoutType, IPage } from '../models/Photobook';

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

    const result = await Photobook.deleteOne({
      _id: new Types.ObjectId(photobookId),
      userId: new Types.ObjectId(userId)
    });

    return result.deletedCount > 0;
  }

  /**
   * Add or update an image on a page
   */
  static async addImage(
    userId: string,
    photobookId: string,
    imageData: string,
    dropZoneIndex: number,
    pageNumber: number,
    layout: LayoutType
  ): Promise<boolean> {
    const photobook = await this.get(userId, photobookId);
    if (!photobook) {
      return false;
    }

    photobook.setImage(
      pageNumber,
      layout,
      imageData,
      dropZoneIndex
    );

    await photobook.save();
    return true;
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
    const photobook = await this.get(userId, photobookId);
    if (!photobook) {
      return false;
    }

    const removed = photobook.removeImage(pageNumber, dropZoneIndex);
    if (removed) {
      await photobook.save();
    }
    return removed;
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
    const photobook = await this.get(userId, photobookId);
    if (!photobook) {
      return null;
    }

    const pageNumber = photobook.addPage(layout);
    await photobook.save();
    return pageNumber;
  }

  /**
   * Update page order
   */
  static async updatePageOrder(
    userId: string,
    photobookId: string,
    order: number[]
  ): Promise<boolean> {
    const photobook = await this.get(userId, photobookId);
    if (!photobook) {
      return false;
    }

    photobook.setPageOrder(order);
    await photobook.save();
    return true;
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
    const photobook = await this.get(userId, photobookId);
    if (!photobook) {
      return false;
    }

    const page = photobook.pages.find((p: IPage) => p.pageNumber === pageNumber);
    if (!page) {
      return false;
    }

    page.layout = layout;
    await photobook.save();
    return true;
  }
}
