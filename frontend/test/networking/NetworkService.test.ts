import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createPhotobook,
  viewPhotobook,
  listPhotobooks,
  deletePhotobook,
  uploadImage,
  removeImage,
  addPage,
  updatePageOrder,
  updatePageLayout,
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

      expect(mockFetch).toHaveBeenCalledWith('/api/create', {
        method: 'POST',
        headers: expectedAuthHeaders,
        credentials: 'include',
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
        '/api/photobook?key=test-key',
        {
          method: 'GET',
          headers: expectedAuthHeaders,
          credentials: 'include',
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
        '/api/upload?key=test-key',
        {
          method: 'POST',
          headers: expectedAuthHeaders,
          credentials: 'include',
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
        '/api/remove-image?key=test-key&dropZoneIndex=0&pageNumber=1',
        {
          method: 'DELETE',
          headers: expectedAuthHeaders,
          credentials: 'include',
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
        '/api/update-title?key=test-key',
        {
          method: 'PUT',
          headers: expectedAuthHeaders,
          credentials: 'include',
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
        '/api/generate-pdf?key=test-key',
        {
          method: 'GET',
          headers: expectedAuthHeaders,
          credentials: 'include',
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

  describe('silent refresh on 401', () => {
    it('should refresh token and retry on 401', async () => {
      // First call returns 401
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });
      // Refresh call succeeds
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ token: 'new-token', user: { id: '1', name: 'Test', email: 'test@test.com' } })
      });
      // Retry call succeeds
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ title: 'My Photobook', pages: [] })
      });

      const result = await viewPhotobook('test-key');

      // Should have made 3 calls: original, refresh, retry
      expect(mockFetch).toHaveBeenCalledTimes(3);

      // Second call should be the refresh endpoint
      expect(mockFetch).toHaveBeenNthCalledWith(2, '/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });

      // Third call should be the retry with new token
      expect(mockFetch).toHaveBeenNthCalledWith(3,
        '/api/photobook?key=test-key',
        expect.objectContaining({
          method: 'GET',
          credentials: 'include',
        })
      );

      // Should store the new token
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('token', 'new-token');

      expect(result).toEqual({ title: 'My Photobook', pages: [] });
    });

    it('should redirect to login when refresh fails', async () => {
      // Mock window.location
      const locationMock = { href: '' };
      Object.defineProperty(window, 'location', { value: locationMock, writable: true });

      // First call returns 401
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });
      // Refresh call also fails
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      await expect(viewPhotobook('test-key')).rejects.toThrow('Session expired');

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('token');
      expect(locationMock.href).toBe('/');
    });

    it('should not retry refresh when already retrying', async () => {
      // Mock window.location
      const locationMock = { href: '' };
      Object.defineProperty(window, 'location', { value: locationMock, writable: true });

      // First call returns 401
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });
      // Refresh succeeds
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ token: 'new-token', user: { id: '1', name: 'Test', email: 'test@test.com' } })
      });
      // Retry also returns 401 (e.g. new token is also bad)
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      await expect(viewPhotobook('test-key')).rejects.toThrow('Session expired');

      // Should have made 3 calls: original, refresh, retry — but NOT another refresh
      expect(mockFetch).toHaveBeenCalledTimes(3);
      expect(locationMock.href).toBe('/');
    });
  });

  describe('listPhotobooks', () => {
    it('should list photobooks successfully', async () => {
      const mockList = [{ _id: '1', title: 'Book 1' }, { _id: '2', title: 'Book 2' }];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockList)
      });

      const result = await listPhotobooks();

      expect(mockFetch).toHaveBeenCalledWith('/api/photobooks', {
        method: 'GET',
        headers: expectedAuthHeaders,
        credentials: 'include',
      });
      expect(result).toEqual(mockList);
    });
  });

  describe('deletePhotobook', () => {
    it('should delete photobook successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ success: true })
      });

      const result = await deletePhotobook('test-key');

      expect(mockFetch).toHaveBeenCalledWith('/api/photobook?key=test-key', {
        method: 'DELETE',
        headers: expectedAuthHeaders,
        credentials: 'include',
      });
      expect(result).toEqual({ success: true });
    });
  });

  describe('addPage', () => {
    it('should add page successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ success: true, pageNumber: 2 })
      });

      const result = await addPage('test-key', 'vertical-triplet');

      expect(mockFetch).toHaveBeenCalledWith('/api/add-page?key=test-key', {
        method: 'POST',
        headers: expectedAuthHeaders,
        credentials: 'include',
        body: JSON.stringify({ layout: 'vertical-triplet' })
      });
      expect(result).toEqual({ success: true, pageNumber: 2 });
    });
  });

  describe('updatePageOrder', () => {
    it('should update page order successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ success: true })
      });

      const result = await updatePageOrder('test-key', [2, 1, 3]);

      expect(mockFetch).toHaveBeenCalledWith('/api/page-order?key=test-key', {
        method: 'PUT',
        headers: expectedAuthHeaders,
        credentials: 'include',
        body: JSON.stringify({ order: [2, 1, 3] })
      });
      expect(result).toEqual({ success: true });
    });
  });

  describe('updatePageLayout', () => {
    it('should update page layout successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ success: true })
      });

      const result = await updatePageLayout('test-key', 1, 'single-page');

      expect(mockFetch).toHaveBeenCalledWith('/api/page-layout?key=test-key', {
        method: 'PUT',
        headers: expectedAuthHeaders,
        credentials: 'include',
        body: JSON.stringify({ pageNumber: 1, layout: 'single-page' })
      });
      expect(result).toEqual({ success: true });
    });
  });

  describe('auth headers', () => {
    it('should not include Authorization header when no token', async () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ key: 'test-key' })
      });

      await createPhotobook('Test');

      expect(mockFetch).toHaveBeenCalledWith('/api/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title: 'Test' })
      });
    });
  });
});
