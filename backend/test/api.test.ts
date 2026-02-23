import { describe, it } from 'node:test';
import assert from 'node:assert';
import mongoose from 'mongoose';
import { Photobook, MAX_PAGES, MAX_DROP_ZONE_INDEX } from '../models/Photobook';

// Tests for Photobook document methods (setImage, removeImage, addPage, setPageOrder).
// These replace the deleted DemoStorage tests and cover the same business logic.
// No DB connection needed — we test in-memory document state only (no save()).

const TEST_USER_ID = new mongoose.Types.ObjectId().toString();
const IMAGE_URL = 'http://localhost:3000/uploads/550e8400-e29b-41d4-a716-446655440000.jpg';
const IMAGE_URL_2 = 'http://localhost:3000/uploads/6ba7b810-9dad-11d1-80b4-00c04fd430c8.jpg';

function makePhotobook(title = 'Test Book') {
    return new Photobook({
        userId: new mongoose.Types.ObjectId(TEST_USER_ID),
        title,
        pages: [],
        pageOrder: [],
    });
}

describe('Photobook model', () => {
    describe('setImage', () => {
        it('should add an image to a new page', () => {
            const book = makePhotobook();
            book.setImage(1, 'horizontal-triplet', IMAGE_URL, 0);

            assert.strictEqual(book.pages.length, 1);
            assert.strictEqual(book.pages[0].pageNumber, 1);
            assert.strictEqual(book.pages[0].layout, 'horizontal-triplet');
            assert.strictEqual(book.pages[0].images.length, 1);
            assert.strictEqual(book.pages[0].images[0].imageUrl, IMAGE_URL);
            assert.strictEqual(book.pages[0].images[0].dropZoneIndex, 0);
        });

        it('should add the page to pageOrder when creating a new page', () => {
            const book = makePhotobook();
            book.setImage(1, 'horizontal-triplet', IMAGE_URL, 0);

            assert.ok(book.pageOrder.includes(1));
        });

        it('should add multiple images to the same page', () => {
            const book = makePhotobook();
            book.setImage(1, 'horizontal-triplet', IMAGE_URL, 0);
            book.setImage(1, 'horizontal-triplet', IMAGE_URL_2, 1);

            assert.strictEqual(book.pages.length, 1);
            assert.strictEqual(book.pages[0].images.length, 2);
        });

        it('should replace an existing image in the same dropzone', () => {
            const book = makePhotobook();
            book.setImage(1, 'horizontal-triplet', IMAGE_URL, 0);
            book.setImage(1, 'horizontal-triplet', IMAGE_URL_2, 0);

            assert.strictEqual(book.pages[0].images.length, 1);
            assert.strictEqual(book.pages[0].images[0].imageUrl, IMAGE_URL_2);
        });

        it('should support images on multiple pages', () => {
            const book = makePhotobook();
            book.setImage(1, 'horizontal-triplet', IMAGE_URL, 0);
            book.setImage(2, 'single-page', IMAGE_URL_2, 0);

            assert.strictEqual(book.pages.length, 2);
            assert.strictEqual(book.pageOrder.length, 2);
        });

        it('should reuse an existing page without duplicating it', () => {
            const book = makePhotobook();
            book.setImage(1, 'horizontal-triplet', IMAGE_URL, 0);
            book.setImage(1, 'horizontal-triplet', IMAGE_URL_2, 1);

            assert.strictEqual(book.pages.length, 1);
            assert.strictEqual(book.pageOrder.filter((n: number) => n === 1).length, 1);
        });
    });

    describe('removeImage', () => {
        it('should remove an image from a dropzone', () => {
            const book = makePhotobook();
            book.setImage(1, 'horizontal-triplet', IMAGE_URL, 0);
            book.setImage(1, 'horizontal-triplet', IMAGE_URL_2, 1);

            const removed = book.removeImage(1, 0);

            assert.strictEqual(removed, true);
            assert.strictEqual(book.pages[0].images.length, 1);
            assert.strictEqual(book.pages[0].images[0].dropZoneIndex, 1);
        });

        it('should return false when page does not exist', () => {
            const book = makePhotobook();

            const removed = book.removeImage(99, 0);

            assert.strictEqual(removed, false);
        });

        it('should return false when dropzone has no image', () => {
            const book = makePhotobook();
            book.setImage(1, 'horizontal-triplet', IMAGE_URL, 0);

            const removed = book.removeImage(1, 5);

            assert.strictEqual(removed, false);
        });
    });

    describe('addPage', () => {
        it('should add a new page and return its page number', () => {
            const book = makePhotobook();

            const pageNumber = book.addPage('single-page');

            assert.strictEqual(pageNumber, 1);
            assert.strictEqual(book.pages.length, 1);
            assert.strictEqual(book.pages[0].layout, 'single-page');
        });

        it('should increment page numbers sequentially', () => {
            const book = makePhotobook();

            const first = book.addPage();
            const second = book.addPage();

            assert.strictEqual(first, 1);
            assert.strictEqual(second, 2);
        });

        it('should append the new page number to pageOrder', () => {
            const book = makePhotobook();
            book.addPage();
            book.addPage();

            assert.deepStrictEqual(book.pageOrder, [1, 2]);
        });

        it('should default to horizontal-triplet layout', () => {
            const book = makePhotobook();
            book.addPage();

            assert.strictEqual(book.pages[0].layout, 'horizontal-triplet');
        });
    });

    describe('setPageOrder', () => {
        it('should update the page order', () => {
            const book = makePhotobook();
            book.addPage();
            book.addPage();
            book.addPage();

            book.setPageOrder([3, 1, 2]);

            assert.deepStrictEqual(book.pageOrder, [3, 1, 2]);
        });
    });

    describe('validation guards', () => {
        it('should throw when pageNumber is below 1', () => {
            const book = makePhotobook();
            assert.throws(
                () => book.setImage(0, 'horizontal-triplet', IMAGE_URL, 0),
                /pageNumber must be between 1 and/
            );
        });

        it('should throw when pageNumber exceeds MAX_PAGES', () => {
            const book = makePhotobook();
            assert.throws(
                () => book.setImage(MAX_PAGES + 1, 'horizontal-triplet', IMAGE_URL, 0),
                /pageNumber must be between 1 and/
            );
        });

        it('should throw when dropZoneIndex is negative', () => {
            const book = makePhotobook();
            assert.throws(
                () => book.setImage(1, 'horizontal-triplet', IMAGE_URL, -1),
                /dropZoneIndex must be between 0 and/
            );
        });

        it('should throw when dropZoneIndex exceeds MAX_DROP_ZONE_INDEX', () => {
            const book = makePhotobook();
            assert.throws(
                () => book.setImage(1, 'horizontal-triplet', IMAGE_URL, MAX_DROP_ZONE_INDEX + 1),
                /dropZoneIndex must be between 0 and/
            );
        });

        it('should throw when adding a page beyond MAX_PAGES', () => {
            const book = makePhotobook();
            // Fill up to the limit using direct construction to avoid slow loop
            for (let i = 1; i <= MAX_PAGES; i++) {
                book.pages.push({ pageNumber: i, layout: 'horizontal-triplet', images: [] } as any);
            }
            assert.throws(
                () => book.addPage(),
                /cannot have more than/
            );
        });
    });
});
