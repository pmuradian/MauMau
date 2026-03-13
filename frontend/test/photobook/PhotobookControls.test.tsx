import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PhotobookControls from '../../app/photobook/PhotobookControls';
import * as NetworkService from '../../app/networking/NetworkService';

const mockShowError = vi.fn();
vi.mock('../../app/contexts/ToastContext', () => ({
  useToast: () => ({ showError: mockShowError }),
}));

vi.mock('../../app/networking/NetworkService', () => ({
  generatePDF: vi.fn(),
}));

describe('PhotobookControls', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows toast instead of alert on PDF generation failure', async () => {
    vi.mocked(NetworkService.generatePDF).mockRejectedValue(new Error('PDF failed'));
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    render(
      <MemoryRouter>
        <PhotobookControls title="Test" photobookKey="key-1" />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('Order print'));

    await waitFor(() => {
      expect(mockShowError).toHaveBeenCalledWith('Failed to generate PDF. Please try again.');
    });

    expect(alertSpy).not.toHaveBeenCalled();
    alertSpy.mockRestore();
  });

  it('downloads PDF on success', async () => {
    const mockBlob = new Blob(['pdf'], { type: 'application/pdf' });
    vi.mocked(NetworkService.generatePDF).mockResolvedValue(mockBlob);

    render(
      <MemoryRouter>
        <PhotobookControls title="My Book" photobookKey="key-1" />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('Order print'));

    await waitFor(() => {
      expect(NetworkService.generatePDF).toHaveBeenCalledWith('key-1');
    });

    expect(mockShowError).not.toHaveBeenCalled();
  });
});
