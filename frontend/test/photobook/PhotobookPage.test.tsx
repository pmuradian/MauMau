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
          layout="horizontal-triplet"
        />
      </MemoryRouter>
    );

    const dropzones = screen.getAllByText('+');
    expect(dropzones).toHaveLength(3);
  });
});
