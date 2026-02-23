import { describe, it } from 'node:test';
import assert from 'node:assert';
import { LocalStorageProvider } from '../storage/LocalStorageProvider';

describe('LocalStorageProvider', () => {
  const provider = new LocalStorageProvider();

  describe('isValidUrl', () => {
    it('should accept a valid local uploads URL', () => {
      assert.strictEqual(provider.isValidUrl('http://localhost:3000/uploads/abc.jpg'), true);
    });

    it('should accept URLs with UUID filenames', () => {
      assert.strictEqual(
        provider.isValidUrl('http://localhost:3000/uploads/550e8400-e29b-41d4-a716-446655440000.jpg'),
        true
      );
    });

    it('should reject URLs from a different host', () => {
      assert.strictEqual(provider.isValidUrl('http://evil.com/uploads/abc.jpg'), false);
    });

    it('should reject URLs from a different port', () => {
      assert.strictEqual(provider.isValidUrl('http://localhost:9999/uploads/abc.jpg'), false);
    });

    it('should reject URLs not under /uploads/', () => {
      assert.strictEqual(provider.isValidUrl('http://localhost:3000/etc/passwd'), false);
      assert.strictEqual(provider.isValidUrl('http://localhost:3000/api/local-upload/abc.jpg'), false);
    });

    it('should reject AWS metadata service URLs (SSRF)', () => {
      assert.strictEqual(provider.isValidUrl('http://169.254.169.254/latest/meta-data/'), false);
    });

    it('should reject file:// URIs (SSRF)', () => {
      assert.strictEqual(provider.isValidUrl('file:///etc/passwd'), false);
    });

    it('should reject path traversal in URL', () => {
      assert.strictEqual(provider.isValidUrl('http://localhost:3000/uploads/../etc/passwd'), false);
    });

    it('should reject empty string', () => {
      assert.strictEqual(provider.isValidUrl(''), false);
    });

    it('should reject non-URL strings', () => {
      assert.strictEqual(provider.isValidUrl('not-a-url'), false);
    });
  });
});

describe('local-upload filename validation', () => {
  // The regex used in the PUT /api/local-upload/:filename endpoint
  const isValidFilename = (name: string) =>
    /^[0-9a-f-]{36}\.(jpg|png|webp|gif|heic|heif)$/.test(name);

  it('should accept valid UUID filenames with image extensions', () => {
    assert.strictEqual(isValidFilename('550e8400-e29b-41d4-a716-446655440000.jpg'), true);
    assert.strictEqual(isValidFilename('550e8400-e29b-41d4-a716-446655440000.png'), true);
    assert.strictEqual(isValidFilename('550e8400-e29b-41d4-a716-446655440000.webp'), true);
    assert.strictEqual(isValidFilename('550e8400-e29b-41d4-a716-446655440000.gif'), true);
    assert.strictEqual(isValidFilename('550e8400-e29b-41d4-a716-446655440000.heic'), true);
    assert.strictEqual(isValidFilename('550e8400-e29b-41d4-a716-446655440000.heif'), true);
  });

  it('should reject path traversal attempts', () => {
    assert.strictEqual(isValidFilename('../etc/passwd'), false);
    assert.strictEqual(isValidFilename('../../etc/passwd'), false);
    assert.strictEqual(isValidFilename('foo/../bar.jpg'), false);
  });

  it('should reject executable and dangerous extensions', () => {
    assert.strictEqual(isValidFilename('550e8400-e29b-41d4-a716-446655440000.php'), false);
    assert.strictEqual(isValidFilename('550e8400-e29b-41d4-a716-446655440000.sh'), false);
    assert.strictEqual(isValidFilename('550e8400-e29b-41d4-a716-446655440000.html'), false);
    assert.strictEqual(isValidFilename('550e8400-e29b-41d4-a716-446655440000.svg'), false);
    assert.strictEqual(isValidFilename('550e8400-e29b-41d4-a716-446655440000.exe'), false);
  });

  it('should reject non-UUID filenames', () => {
    assert.strictEqual(isValidFilename('arbitrary-name.jpg'), false);
    assert.strictEqual(isValidFilename('image.jpg'), false);
  });

  it('should reject empty string', () => {
    assert.strictEqual(isValidFilename(''), false);
  });
});
