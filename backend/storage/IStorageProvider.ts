export interface UploadUrlResult {
  uploadUrl: string; // client PUTs binary here
  finalUrl: string;  // permanent URL stored in MongoDB and used in <img src>
}

export interface IStorageProvider {
  /**
   * Generate an upload URL and the permanent URL for the stored file.
   * @param filename Pre-generated filename (e.g. "uuid.jpg")
   * @param contentType MIME type (e.g. "image/jpeg")
   */
  getUploadUrl(filename: string, contentType: string): Promise<UploadUrlResult>;

  /**
   * Delete a stored file by its finalUrl.
   * Must not throw if the file does not exist.
   */
  deleteFile(fileUrl: string): Promise<void>;
}
