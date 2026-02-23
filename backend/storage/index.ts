import { IStorageProvider } from './IStorageProvider';
import { LocalStorageProvider } from './LocalStorageProvider';
import { S3StorageProvider } from './S3StorageProvider';

function createStorageProvider(): IStorageProvider {
  const provider = process.env.STORAGE_PROVIDER || 'local';
  if (provider === 's3') {
    return new S3StorageProvider();
  }
  return new LocalStorageProvider();
}

export const storageProvider: IStorageProvider = createStorageProvider();
