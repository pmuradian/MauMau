import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PhotobookPage from '../../app/photobook/PhotobookPage';
import * as NetworkService from '../../app/networking/NetworkService';

const mockShowError = vi.fn();
vi.mock('../../app/contexts/ToastContext', () => ({
  useToast: () => ({ showError: mockShowError }),
}));

vi.mock('../../app/networking/NetworkService', () => ({
  getUploadUrl: vi.fn(),
  putFileToBucket: vi.fn(),
  confirmUpload: vi.fn(),
  removeImage: vi.fn(),
}));

describe('PhotobookPage error handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders dropzones for the layout', () => {
    render(
      <MemoryRouter>
        <PhotobookPage
          photobookKey="test-key"
          selectedPage={1}
          images={{}}
          onImageUpdated={vi.fn()}
          onImageRemovedLocal={vi.fn()}
          onImageRestored={vi.fn()}
          layout="horizontal-triplet"
        />
      </MemoryRouter>
    );

    const dropzones = screen.getAllByText('+');
    expect(dropzones).toHaveLength(3);
  });

  it('restores image and shows toast on removal failure', async () => {
    const mockOnImageRemovedLocal = vi.fn();
    const mockOnImageRestored = vi.fn();
    const removalError = new Error('Server error');
    vi.mocked(NetworkService.removeImage).mockRejectedValueOnce(removalError);

    render(
      <MemoryRouter>
        <PhotobookPage
          photobookKey="test-key"
          selectedPage={1}
          images={{ 0: 'http://localhost:3000/uploads/test.jpg' }}
          onImageUpdated={vi.fn()}
          onImageRemovedLocal={mockOnImageRemovedLocal}
          onImageRestored={mockOnImageRestored}
          layout="horizontal-triplet"
        />
      </MemoryRouter>
    );

    // Find and click the remove button on the first dropzone
    const removeButton = screen.getByTitle('Remove image');
    removeButton.click();

    expect(mockOnImageRemovedLocal).toHaveBeenCalledWith(0);

    // Wait for the rejection to be handled
    await vi.waitFor(() => {
      expect(mockShowError).toHaveBeenCalledWith('Failed to remove image. Restoring it.');
    });
    expect(mockOnImageRestored).toHaveBeenCalledWith(0, 'http://localhost:3000/uploads/test.jpg');
  });
});
