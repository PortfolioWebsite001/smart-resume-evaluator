
// This is a basic utility for file operations
// In a real application, this would handle file uploads to a server

/**
 * Validates if a file is of an allowed type
 */
export const validateFileType = (file: File, allowedTypes: string[]) => {
  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  return fileExtension ? allowedTypes.includes(fileExtension) : false;
};

/**
 * Validates if a file is within the allowed size limit
 */
export const validateFileSize = (file: File, maxSizeInBytes: number) => {
  return file.size <= maxSizeInBytes;
};

/**
 * Formats a file size from bytes to a human-readable format
 */
export const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Creates a mock upload promise that resolves after a delay
 * In a real application, this would send the file to your server
 */
export const mockFileUpload = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`${file.name} uploaded successfully`);
    }, 2000);
  });
};
