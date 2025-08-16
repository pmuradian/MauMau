import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { DemoStorage, PhotoBook, PageFormat, PageArrangement } from '../storage.ts';

describe('DemoStorage', () => {
    let storage: DemoStorage;
    let testPhotoBook: PhotoBook;

    beforeEach(() => {
        storage = new DemoStorage();
        testPhotoBook = new PhotoBook('Test Book', PageFormat.A4, 10);
    });

    describe('createPhotoBook', () => {
        it('should create a new photobook and return a UUID key', () => {
            const key = storage.createPhotoBook(testPhotoBook);
            
            assert.strictEqual(typeof key, 'string');
            assert.strictEqual(key.length, 36); // UUID length
            
            const retrieved = storage.getPhotoBook(key);
            assert.strictEqual(retrieved?.title, 'Test Book');
            assert.strictEqual(retrieved?.pageFormat, PageFormat.A4);
            assert.strictEqual(retrieved?.pageCount, 10);
        });
    });

    describe('getPhotoBook', () => {
        it('should return null for non-existent key', () => {
            const result = storage.getPhotoBook('non-existent-key');
            assert.strictEqual(result, null);
        });

        it('should return the correct photobook for valid key', () => {
            const key = storage.createPhotoBook(testPhotoBook);
            const retrieved = storage.getPhotoBook(key);
            
            assert.strictEqual(retrieved?.title, testPhotoBook.title);
            assert.strictEqual(retrieved?.pageFormat, testPhotoBook.pageFormat);
        });
    });

    describe('updatePhotobookTitle', () => {
        it('should update the title of an existing photobook', () => {
            const key = storage.createPhotoBook(testPhotoBook);
            const newTitle = 'Updated Title';
            
            const success = storage.updatePhotobookTitle(key, newTitle);
            
            assert.strictEqual(success, true);
            const retrieved = storage.getPhotoBook(key);
            assert.strictEqual(retrieved?.title, newTitle);
        });

        it('should return false for non-existent photobook', () => {
            const success = storage.updatePhotobookTitle('non-existent', 'New Title');
            assert.strictEqual(success, false);
        });
    });

    describe('addImageToPhotoBook', () => {
        it('should add image to photobook and create page if needed', () => {
            const key = storage.createPhotoBook(testPhotoBook);
            const imageData = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';
            
            storage.addImageToPhotoBook(key, imageData, 100, 200, 300, 400, 0);
            
            const retrieved = storage.getPhotoBook(key);
            assert.strictEqual(retrieved?.pages.length, 1);
            assert.strictEqual(retrieved?.pages[0].images.length, 1);
            
            const image = retrieved?.pages[0].images[0];
            assert.strictEqual(image?.x, 100);
            assert.strictEqual(image?.y, 200);
            assert.strictEqual(image?.dropZoneIndex, 0);
        });

        it('should replace existing image in same dropzone', () => {
            const key = storage.createPhotoBook(testPhotoBook);
            const imageData1 = 'data:image/jpeg;base64,image1';
            const imageData2 = 'data:image/jpeg;base64,image2';
            
            storage.addImageToPhotoBook(key, imageData1, 100, 200, 300, 400, 0);
            storage.addImageToPhotoBook(key, imageData2, 150, 250, 350, 450, 0);
            
            const retrieved = storage.getPhotoBook(key);
            assert.strictEqual(retrieved?.pages[0].images.length, 1);
            assert.strictEqual(retrieved?.pages[0].images[0].imageData, imageData2);
        });
    });

    describe('removeImageFromPhotoBook', () => {
        it('should remove image from specified dropzone', () => {
            const key = storage.createPhotoBook(testPhotoBook);
            const imageData = 'data:image/jpeg;base64,test';
            
            storage.addImageToPhotoBook(key, imageData, 100, 200, 300, 400, 0);
            storage.addImageToPhotoBook(key, imageData, 100, 200, 300, 400, 1);
            
            let retrieved = storage.getPhotoBook(key);
            assert.strictEqual(retrieved?.pages[0].images.length, 2);
            
            storage.removeImageFromPhotoBook(key, 0);
            
            retrieved = storage.getPhotoBook(key);
            assert.strictEqual(retrieved?.pages[0].images.length, 1);
            assert.strictEqual(retrieved?.pages[0].images[0].dropZoneIndex, 1);
        });
    });

    describe('deletePhotoBook', () => {
        it('should delete photobook and make it inaccessible', () => {
            const key = storage.createPhotoBook(testPhotoBook);
            
            let retrieved = storage.getPhotoBook(key);
            assert.notStrictEqual(retrieved, null);
            
            storage.deletePhotoBook(key);
            
            retrieved = storage.getPhotoBook(key);
            assert.strictEqual(retrieved, null);
        });
    });
});