/**
 * Share an artifact using the Web Share API or fallback to clipboard
 */
export async function shareArtifact(
  url: string,
  title: string,
  text?: string
): Promise<{ success: boolean; message: string }> {
  // Check if Web Share API is available
  if (navigator.share) {
    try {
      await navigator.share({
        title,
        text: text || title,
        url,
      });
      return { success: true, message: 'Shared successfully' };
    } catch (error: any) {
      // User cancelled the share
      if (error.name === 'AbortError') {
        return { success: false, message: 'Share cancelled' };
      }
      console.error('Share failed:', error);
      // Fall through to clipboard fallback
    }
  }

  // Fallback: Copy link to clipboard
  try {
    await navigator.clipboard.writeText(url);
    return { 
      success: true, 
      message: 'Link copied to clipboard. You can now paste it anywhere to share.' 
    };
  } catch (error) {
    console.error('Clipboard copy failed:', error);
    return { 
      success: false, 
      message: 'Unable to share. Please copy the link manually: ' + url 
    };
  }
}

/**
 * Check if the Web Share API is available
 */
export function isWebShareSupported(): boolean {
  return typeof navigator !== 'undefined' && 'share' in navigator;
}
