import fs from 'fs/promises';
import path from 'path';
import { IStorageProvider, UploadUrlResult } from './IStorageProvider';

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

export class LocalStorageProvider implements IStorageProvider {
  async getUploadUrl(filename: string, _contentType: string): Promise<UploadUrlResult> {
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
    return {
      uploadUrl: `${BASE_URL}/api/local-upload/${filename}`,
      finalUrl: `${BASE_URL}/uploads/${filename}`,
    };
  }

  async deleteFile(fileUrl: string): Promise<void> {
    const filename = fileUrl.split('/uploads/').pop();
    if (!filename) return;
    const filePath = path.join(UPLOADS_DIR, filename);
    try {
      await fs.unlink(filePath);
    } catch (err: unknown) {
      if ((err as NodeJS.ErrnoException).code !== 'ENOENT') throw err;
    }
  }

  isValidUrl(url: string): boolean {
    try {
      const parsed = new URL(url);
      const base = new URL(BASE_URL);
      return parsed.hostname === base.hostname &&
             parsed.port === base.port &&
             parsed.pathname.startsWith('/uploads/');
    } catch {
      return false;
    }
  }
}
