import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

    const dropzone = screen.getByText('+').closest('div');
    
    // Simulate drag enter
    fireEvent.dragEnter(dropzone!, {
      dataTransfer: {
        files: [new File(['test'], 'test.jpg', { type: 'image/jpeg' })]
      }
    });

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

    const dropzone = screen.getByText('+').closest('div');
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    fireEvent.drop(dropzone!, {
      dataTransfer: {
        files: [file]
      }
    });

    await waitFor(() => {
      expect(mockOnImageDropped).toHaveBeenCalled();
    });
  });

  it('displays image preview after file is selected', async () => {
    render(
      <Dropzone 
        onImageDropped={mockOnImageDropped}
        onImageRemoved={mockOnImageRemoved}
      />
    );

    const input = screen.getByRole('textbox', { hidden: true }) as HTMLInputElement;
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    // Mock the file input change
    Object.defineProperty(input, 'files', {
      value: [file],
      writable: false,
    });

    fireEvent.change(input);

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

    const input = screen.getByRole('textbox', { hidden: true }) as HTMLInputElement;
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    Object.defineProperty(input, 'files', {
      value: [file],
      writable: false,
    });

    fireEvent.change(input);

    await waitFor(() => {
      const removeButton = screen.getByTitle('Remove image');
      expect(removeButton).toBeInTheDocument();
    });

    const removeButton = screen.getByTitle('Remove image');
    fireEvent.click(removeButton);

    expect(mockOnImageRemoved).toHaveBeenCalled();
    
    // Image should be removed
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

    const dropzone = screen.getByText('+').closest('div');
    expect(dropzone).toHaveStyle({ aspectRatio: '16/9' });
  });

  it('only accepts image files', () => {
    render(
      <Dropzone 
        onImageDropped={mockOnImageDropped}
        onImageRemoved={mockOnImageRemoved}
      />
    );

    const input = screen.getByRole('textbox', { hidden: true }) as HTMLInputElement;
    expect(input).toHaveAttribute('accept', 'image/*');
  });
});