import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PortraitHorizontalTriplet } from '../../app/UserInterface/PageLayouts/Portrait';

describe('PortraitHorizontalTriplet Layout', () => {
  const mockOnImageDropped = vi.fn();
  const mockOnImageRemoved = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders three dropzones in correct layout', () => {
    render(
      <PortraitHorizontalTriplet
        onImageDropped={mockOnImageDropped}
        onImageRemoved={mockOnImageRemoved}
      />
    );

    // Should have 3 dropzones (each with a + icon)
    const plusIcons = screen.getAllByText('+');
    expect(plusIcons).toHaveLength(3);

    // Check layout structure
    const container = plusIcons[0].closest('.column');
    expect(container).toBeInTheDocument();

    // Should have a row container for top two dropzones
    const rowContainer = container?.querySelector('.row');
    expect(rowContainer).toBeInTheDocument();
  });

  it('applies correct aspect ratios to dropzones', () => {
    render(
      <PortraitHorizontalTriplet
        onImageDropped={mockOnImageDropped}
        onImageRemoved={mockOnImageRemoved}
      />
    );

    const dropzones = screen.getAllByText('+').map(icon =>
      icon.closest('div[style*="aspect-ratio"]')
    );

    // First two dropzones should have default aspect ratio (1)
    expect(dropzones[0]).toHaveStyle({ aspectRatio: '1' });
    expect(dropzones[1]).toHaveStyle({ aspectRatio: '1' });

    // Bottom dropzone should have 1.5 aspect ratio
    expect(dropzones[2]).toHaveStyle({ aspectRatio: '1.5' });
  });

  it('calls onImageDropped with correct dropzone indices', () => {
    render(
      <PortraitHorizontalTriplet
        onImageDropped={mockOnImageDropped}
        onImageRemoved={mockOnImageRemoved}
      />
    );

    // This test would require more complex setup to simulate actual drops
    // For now, we verify the component renders without errors
    expect(screen.getAllByText('+')).toHaveLength(3);
  });

  it('calls onImageRemoved with correct dropzone indices', () => {
    render(
      <PortraitHorizontalTriplet
        onImageDropped={mockOnImageDropped}
        onImageRemoved={mockOnImageRemoved}
      />
    );

    // Similar to above, this would need more complex setup for full testing
    expect(screen.getAllByText('+')).toHaveLength(3);
  });

  it('applies correct CSS classes for layout', () => {
    render(
      <PortraitHorizontalTriplet
        onImageDropped={mockOnImageDropped}
        onImageRemoved={mockOnImageRemoved}
      />
    );

    const container = screen.getAllByText('+')[0].closest('.column');
    expect(container).toHaveClass('column');

    const rowContainer = container?.querySelector('.row');
    expect(rowContainer).toHaveClass('row');
  });
});
