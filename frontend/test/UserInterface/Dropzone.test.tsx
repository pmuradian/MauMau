import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Dropzone, File } from '../../app/UserInterface/Dropzone';

describe('Dropzone Component', () => {
  const mockOnImageDropped = vi.fn();
  const mockOnImageRemoved = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders empty dropzone with plus icon and text', () => {
    render(
      <Dropzone
        onImageDropped={mockOnImageDropped}
        onImageRemoved={mockOnImageRemoved}
      />
    );

    expect(screen.getByText('+')).toBeInTheDocument();
    expect(screen.getByText('Drop image or click to select')).toBeInTheDocument();
  });

  it('shows drag active state when dragging over', async () => {
    render(
      <Dropzone
        onImageDropped={mockOnImageDropped}
        onImageRemoved={mockOnImageRemoved}
      />
    );

    const dropzone = screen.getByText('+').closest('[role="presentation"]')!;

    const dataTransfer = {
      files: [new window.File(['test'], 'test.jpg', { type: 'image/jpeg' })],
      items: [{ kind: 'file', type: 'image/jpeg' }],
      types: ['Files'],
    };

    fireEvent.dragEnter(dropzone, { dataTransfer });

    await waitFor(() => {
      expect(screen.getByText('Drop image here')).toBeInTheDocument();
    });
  });

  it('calls onImageDropped when file is dropped', async () => {
    render(
      <Dropzone
        onImageDropped={mockOnImageDropped}
        onImageRemoved={mockOnImageRemoved}
      />
    );

    const dropzone = screen.getByText('+').closest('[role="presentation"]')!;
    const file = new window.File(['test'], 'test.jpg', { type: 'image/jpeg' });

    const dataTransfer = {
      files: [file],
      items: [{ kind: 'file', type: 'image/jpeg', getAsFile: () => file }],
      types: ['Files'],
    };

    fireEvent.drop(dropzone, { dataTransfer });

    await waitFor(() => {
      expect(mockOnImageDropped).toHaveBeenCalled();
    });
  });

  it('displays image preview after drop', async () => {
    render(
      <Dropzone
        onImageDropped={mockOnImageDropped}
        onImageRemoved={mockOnImageRemoved}
      />
    );

    const dropzone = screen.getByText('+').closest('[role="presentation"]')!;
    const file = new window.File(['test'], 'test.jpg', { type: 'image/jpeg' });

    const dataTransfer = {
      files: [file],
      items: [{ kind: 'file', type: 'image/jpeg', getAsFile: () => file }],
      types: ['Files'],
    };

    fireEvent.drop(dropzone, { dataTransfer });

    await waitFor(() => {
      const img = screen.getByRole('img');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', 'mock-url');
    });
  });

  it('shows remove button when image is present and calls onImageRemoved', async () => {
    render(
      <Dropzone
        onImageDropped={mockOnImageDropped}
        onImageRemoved={mockOnImageRemoved}
      />
    );

    const dropzone = screen.getByText('+').closest('[role="presentation"]')!;
    const file = new window.File(['test'], 'test.jpg', { type: 'image/jpeg' });

    const dataTransfer = {
      files: [file],
      items: [{ kind: 'file', type: 'image/jpeg', getAsFile: () => file }],
      types: ['Files'],
    };

    fireEvent.drop(dropzone, { dataTransfer });

    await waitFor(() => {
      expect(screen.getByTitle('Remove image')).toBeInTheDocument();
    });

    const removeButton = screen.getByTitle('Remove image');
    fireEvent.click(removeButton);

    expect(mockOnImageRemoved).toHaveBeenCalled();

    await waitFor(() => {
      expect(screen.queryByRole('img')).not.toBeInTheDocument();
      expect(screen.getByText('+')).toBeInTheDocument();
    });
  });

  it('applies custom aspect ratio', () => {
    render(
      <Dropzone
        aspectRatio="16/9"
        onImageDropped={mockOnImageDropped}
        onImageRemoved={mockOnImageRemoved}
      />
    );

    const dropzone = screen.getByText('+').closest('[role="presentation"]');
    expect(dropzone).toHaveStyle({ aspectRatio: '16/9' });
  });

  it('only accepts image files', () => {
    render(
      <Dropzone
        onImageDropped={mockOnImageDropped}
        onImageRemoved={mockOnImageRemoved}
      />
    );

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input).toHaveAttribute('accept', 'image/*,.jpeg,.png,.gif,.webp,.svg');
  });
});
