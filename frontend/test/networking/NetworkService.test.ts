import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  createPhotobook, 
  viewPhotobook, 
  uploadImage, 
  removeImage, 
  updatePhotobookTitle, 
  generatePDF 
} from '../../app/networking/NetworkService';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('NetworkService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createPhotobook', () => {
    it('should create photobook successfully', async () => {
      const mockResponse = { key: 'test-key-123' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await createPhotobook('My Photobook', 'A4', 10);

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3000/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'My Photobook',
          pageFormat: 'A4',
          pageCount: 10
        })
      });

      expect(result).toEqual(mockResponse);
    });
  });

  describe('viewPhotobook', () => {
    it('should fetch photobook data successfully', async () => {
      const mockPhotobook = {
        title: 'Test Photobook',
        description: 'Test Description',
        images: []
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockPhotobook)
      });

      const result = await viewPhotobook('test-key');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/photobook?key=test-key',
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        }
      );

      expect(result).toEqual(mockPhotobook);
    });
  });

  describe('uploadImage', () => {
    it('should upload image successfully', async () => {
      const mockResponse = { success: true, dropZoneIndex: 0 };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const imageData = 'data:image/jpeg;base64,test-data';
      const coords = { x: 100, y: 200, width: 300, height: 400, dropZoneIndex: 0 };

      const result = await uploadImage('test-key', imageData, coords);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/upload?key=test-key',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            img: imageData,
            coords: coords
          })
        }
      );

      expect(result).toEqual(mockResponse);
    });

    it('should handle upload failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: () => Promise.resolve('Bad Request')
      });

      await expect(uploadImage('test-key', 'image-data')).rejects.toThrow(
        'Upload failed: 400 Bad Request'
      );
    });
  });

  describe('removeImage', () => {
    it('should remove image successfully', async () => {
      const mockResponse = { success: true };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await removeImage('test-key', 0);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/remove-image?key=test-key&dropZoneIndex=0',
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' }
        }
      );

      expect(result).toEqual(mockResponse);
    });
  });

  describe('updatePhotobookTitle', () => {
    it('should update title successfully', async () => {
      const mockResponse = { success: true, title: 'New Title' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await updatePhotobookTitle('test-key', 'New Title');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/update-title?key=test-key',
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: 'New Title' })
        }
      );

      expect(result).toEqual(mockResponse);
    });
  });

  describe('generatePDF', () => {
    it('should generate PDF successfully', async () => {
      const mockBlob = new Blob(['pdf-data'], { type: 'application/pdf' });
      mockFetch.mockResolvedValueOnce({
        ok: true,
        blob: () => Promise.resolve(mockBlob)
      });

      const result = await generatePDF('test-key');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/generate-pdf?key=test-key',
        { method: 'GET' }
      );

      expect(result).toEqual(mockBlob);
    });

    it('should handle PDF generation failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: () => Promise.resolve('Internal Server Error')
      });

      await expect(generatePDF('test-key')).rejects.toThrow(
        'PDF generation failed: 500 Internal Server Error'
      );
    });
  });
});