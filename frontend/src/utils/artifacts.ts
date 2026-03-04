/**
 * Get a direct URL for an artifact that can be used for preview/share
 */
export function getArtifactDirectURL(blobId: string): string {
  // For now, return the blobId as-is since we don't have blob storage integration yet
  // In a real implementation, this would use ExternalBlob.fromURL(blobId).getDirectURL()
  return blobId;
}

/**
 * Download an artifact with a reasonable filename
 */
export async function downloadArtifact(
  blobId: string,
  filename: string,
  mimeType: string = 'application/octet-stream'
): Promise<void> {
  try {
    // For now, this is a placeholder
    // In a real implementation, this would:
    // 1. Use ExternalBlob.fromURL(blobId).getBytes()
    // 2. Create a Blob and trigger download
    throw new Error('Artifact download not yet implemented. Blob storage integration required.');
  } catch (error) {
    console.error('Download failed:', error);
    throw new Error('Failed to download artifact. Please try again.');
  }
}

/**
 * Get the appropriate MIME type based on file extension
 */
export function getMimeTypeFromFilename(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  
  const mimeTypes: Record<string, string> = {
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'mp4': 'video/mp4',
    'webm': 'video/webm',
    'mov': 'video/quicktime',
    'avi': 'video/x-msvideo',
  };
  
  return mimeTypes[ext || ''] || 'application/octet-stream';
}

/**
 * Generate a filename for a workflow artifact
 */
export function generateArtifactFilename(
  workflowType: string,
  provider: string,
  extension: string
): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  return `${provider}-${workflowType}-${timestamp}.${extension}`;
}
