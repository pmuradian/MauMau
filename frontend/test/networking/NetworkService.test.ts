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

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};
Object.defineProperty(global, 'localStorage', { value: mockLocalStorage });

describe('NetworkService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue('test-token');
  });

  const expectedAuthHeaders = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer test-token',
  };

  describe('createPhotobook', () => {
    it('should create photobook successfully', async () => {
      const mockResponse = { key: 'test-key-123' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await createPhotobook('My Photobook');

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3000/create', {
        method: 'POST',
        headers: expectedAuthHeaders,
        body: JSON.stringify({ title: 'My Photobook' })
      });

      expect(result).toEqual(mockResponse);
    });
  });

  describe('viewPhotobook', () => {
    it('should fetch photobook data successfully', async () => {
      const mockPhotobook = {
        title: 'Test Photobook',
        description: 'Test Description',
        pages: []
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockPhotobook)
      });

      const result = await viewPhotobook('test-key');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/photobook?key=test-key',
        {
          method: 'GET',
          headers: expectedAuthHeaders
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
        status: 200,
        json: () => Promise.resolve(mockResponse)
      });

      const imageData = 'data:image/jpeg;base64,test-data';

      const result = await uploadImage('test-key', imageData, 0, 1, 'horizontal-triplet');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/upload?key=test-key',
        {
          method: 'POST',
          headers: expectedAuthHeaders,
          body: JSON.stringify({
            img: imageData,
            dropZoneIndex: 0,
            pageNumber: 1,
            layout: 'horizontal-triplet'
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

      await expect(uploadImage('test-key', 'image-data', 0)).rejects.toThrow(
        'Request failed: 400 Bad Request'
      );
    });
  });

  describe('removeImage', () => {
    it('should remove image successfully', async () => {
      const mockResponse = { success: true };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await removeImage('test-key', 0, 1);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/remove-image?key=test-key&dropZoneIndex=0&pageNumber=1',
        {
          method: 'DELETE',
          headers: expectedAuthHeaders
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
        status: 200,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await updatePhotobookTitle('test-key', 'New Title');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/update-title?key=test-key',
        {
          method: 'PUT',
          headers: expectedAuthHeaders,
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
        status: 200,
        blob: () => Promise.resolve(mockBlob)
      });

      const result = await generatePDF('test-key');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/generate-pdf?key=test-key',
        {
          method: 'GET',
          headers: expectedAuthHeaders
        }
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
        'Request failed: 500 Internal Server Error'
      );
    });
  });
});
