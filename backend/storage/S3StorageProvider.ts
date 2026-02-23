import { IStorageProvider, UploadUrlResult } from './IStorageProvider';

export class S3StorageProvider implements IStorageProvider {
  // TODO: Install @aws-sdk/client-s3 and @aws-sdk/s3-request-presigner
  // TODO: Configure AWS_BUCKET, AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY env vars
  // TODO: Use PutObjectCommand + getSignedUrl() to generate presigned PUT URLs
  // TODO: Use DeleteObjectCommand to delete files

  async getUploadUrl(_filename: string, _contentType: string): Promise<UploadUrlResult> {
    throw new Error('S3StorageProvider not yet implemented');
  }

  async deleteFile(_fileUrl: string): Promise<void> {
    throw new Error('S3StorageProvider not yet implemented');
  }
}
