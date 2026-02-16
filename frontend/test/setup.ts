import '@testing-library/jest-dom';

// Mock fetch for tests
global.fetch = vi.fn();

// Mock URL.createObjectURL and revokeObjectURL
global.URL.createObjectURL = vi.fn(() => 'mock-url');
global.URL.revokeObjectURL = vi.fn();

// Mock window.Image to auto-fire onload (jsdom doesn't load images)
class MockImage {
  width = 800;
  height = 600;
  onload: (() => void) | null = null;
  _src = '';

  set src(value: string) {
    this._src = value;
    if (this.onload) {
      setTimeout(() => this.onload?.(), 0);
    }
  }
  get src() {
    return this._src;
  }
}
(global as any).Image = MockImage;
(window as any).Image = MockImage;

// Mock FileReader
global.FileReader = class {
  result: string | ArrayBuffer | null = null;
  onload: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
  onerror: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
  
  readAsDataURL(file: Blob) {
    setTimeout(() => {
      this.result = 'data:image/jpeg;base64,mock-image-data';
      if (this.onload) {
        this.onload({} as ProgressEvent<FileReader>);
      }
    }, 0);
  }
} as any;