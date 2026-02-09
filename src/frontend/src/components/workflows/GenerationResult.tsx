import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, Share2, CheckCircle, XCircle, Loader2, Clock } from 'lucide-react';
import { toast } from 'sonner';
import type { WorkflowRun } from '@/backend';
import { getArtifactDirectURL, downloadArtifact, generateArtifactFilename, getMimeTypeFromFilename } from '@/utils/artifacts';
import { shareArtifact } from '@/utils/share';
import { useState } from 'react';

interface GenerationResultProps {
  run: WorkflowRun;
  onReuse?: () => void;
}

export default function GenerationResult({ run, onReuse }: GenerationResultProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const isImage = run.workflowType === 'image-generation';
  const isVideo = run.workflowType === 'video-generation';
  const isPending = run.status.__kind__ === 'pending';
  const isRunning = run.status.__kind__ === 'running';
  const isSuccess = run.status.__kind__ === 'success';
  const isFailed = run.status.__kind__ === 'failed';

  const handleDownload = async () => {
    if (!run.outputBlobId) return;

    setIsDownloading(true);
    try {
      const extension = isImage ? 'png' : isVideo ? 'mp4' : 'bin';
      const filename = generateArtifactFilename(run.workflowType, run.provider, extension);
      const mimeType = getMimeTypeFromFilename(filename);
      
      await downloadArtifact(run.outputBlobId, filename, mimeType);
      toast.success('Download started');
    } catch (error: any) {
      toast.error(error.message || 'Download failed');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    if (!run.outputBlobId) return;

    setIsSharing(true);
    try {
      const url = getArtifactDirectURL(run.outputBlobId);
      const title = `${run.provider} ${run.workflowType}`;
      const result = await shareArtifact(url, title);
      
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error: any) {
      toast.error('Share failed');
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          {isPending && (
            <>
              <Clock className="h-5 w-5 text-muted-foreground" />
              <span>Pending</span>
            </>
          )}
          {isRunning && (
            <>
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span>Generating...</span>
            </>
          )}
          {isSuccess && (
            <>
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>Generation Complete</span>
            </>
          )}
          {isFailed && (
            <>
              <XCircle className="h-5 w-5 text-destructive" />
              <span>Generation Failed</span>
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status message */}
        {isRunning && (
          <Alert>
            <AlertDescription>
              Your {run.workflowType.replace('-', ' ')} is being generated. This may take a moment...
            </AlertDescription>
          </Alert>
        )}

        {isFailed && (
          <Alert variant="destructive">
            <AlertDescription>
              {run.status.__kind__ === 'failed' ? run.status.failed : 'An error occurred during generation.'}
            </AlertDescription>
          </Alert>
        )}

        {/* Preview */}
        {isSuccess && run.outputBlobId && (
          <div className="space-y-4">
            {isImage && (
              <div className="rounded-lg overflow-hidden border bg-muted">
                <img
                  src={getArtifactDirectURL(run.outputBlobId)}
                  alt="Generated image"
                  className="w-full h-auto"
                />
              </div>
            )}

            {isVideo && (
              <div className="rounded-lg overflow-hidden border bg-muted">
                <video
                  src={getArtifactDirectURL(run.outputBlobId)}
                  controls
                  className="w-full h-auto"
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={handleDownload}
                disabled={isDownloading}
                variant="default"
              >
                <Download className="mr-2 h-4 w-4" />
                {isDownloading ? 'Downloading...' : 'Download'}
              </Button>

              <Button
                onClick={handleShare}
                disabled={isSharing}
                variant="outline"
              >
                <Share2 className="mr-2 h-4 w-4" />
                {isSharing ? 'Sharing...' : 'Share'}
              </Button>

              {onReuse && (
                <Button
                  onClick={onReuse}
                  variant="outline"
                >
                  Reuse Parameters
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="text-sm text-muted-foreground space-y-1">
          <p>Run ID: {run.id}</p>
          <p>Created: {new Date(Number(run.timestamp) / 1000000).toLocaleString()}</p>
          {run.durationNanos && (
            <p>Duration: {(Number(run.durationNanos) / 1000000000).toFixed(2)}s</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
