import { MAX_PAGES, MAX_DROP_ZONE_INDEX } from '../models/Photobook';

export function validatePageParams(
  pageNumber: unknown,
  dropZoneIndex?: unknown
): string | null {
  const page = Number(pageNumber);
  if (!Number.isInteger(page) || page < 1 || page > MAX_PAGES) {
    return `pageNumber must be an integer between 1 and ${MAX_PAGES}`;
  }
  if (dropZoneIndex !== undefined) {
    const dz = Number(dropZoneIndex);
    if (!Number.isInteger(dz) || dz < 0 || dz > MAX_DROP_ZONE_INDEX) {
      return `dropZoneIndex must be an integer between 0 and ${MAX_DROP_ZONE_INDEX}`;
    }
  }
  return null;
}

export function contentTypeToExtension(ct: string): string {
  const map: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg':  'jpg',
    'image/png':  'png',
    'image/webp': 'webp',
    'image/gif':  'gif',
    'image/heic': 'heic',
    'image/heif': 'heif',
  };
  return map[ct.toLowerCase()] ?? 'jpg';
}
