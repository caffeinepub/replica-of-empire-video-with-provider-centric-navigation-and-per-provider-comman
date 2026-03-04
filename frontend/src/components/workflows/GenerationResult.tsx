import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Share2, Loader2, CheckCircle2, XCircle, Clock, X, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { WorkflowRun } from '@/backend';
import type { WorkflowType } from '@/providers/providers';
import { shareArtifact } from '@/utils/share';
import { useCancelWorkflowRun } from '@/hooks/workflows/useCancelWorkflowRun';
import { useWorkflowRunUpdate } from '@/hooks/workflows/useWorkflowExecution';

interface GenerationResultProps {
  run: WorkflowRun;
  provider: string;
  workflowType: WorkflowType;
}

export function GenerationResult({ run, provider, workflowType }: GenerationResultProps) {
  const cancelRun = useCancelWorkflowRun();
  const updateWorkflowRun = useWorkflowRunUpdate();
  const [imageLoadError, setImageLoadError] = useState(false);

  const getStatusBadge = () => {
    switch (run.status.__kind__) {
      case 'pending':
        return (
          <Badge variant="outline" className="gap-1">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        );
      case 'running':
        return (
          <Badge variant="outline" className="gap-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            Generating...
          </Badge>
        );
      case 'success':
        return (
          <Badge variant="default" className="gap-1 bg-green-600">
            <CheckCircle2 className="h-3 w-3" />
            Complete
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            Failed
          </Badge>
        );
    }
  };

  const handleDownload = async () => {
    if (!run.outputBlobId) return;

    try {
      // Create a temporary link to download the image
      const link = document.createElement('a');
      link.href = run.outputBlobId;
      link.download = `${provider}-${workflowType}-${run.id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Download started');
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to download');
    }
  };

  const handleShare = async () => {
    if (!run.outputBlobId) return;

    try {
      await shareArtifact(run.outputBlobId, `${provider} ${workflowType}`);
    } catch (error) {
      console.error('Share failed:', error);
      toast.error('Failed to share');
    }
  };

  const handleCancel = async () => {
    try {
      await cancelRun.mutateAsync({ runId: run.id, provider });
      toast.success('Generation cancelled');
    } catch (error: any) {
      console.error('Cancel failed:', error);
      toast.error(error.message || 'Failed to cancel');
    }
  };

  const handleImageError = async () => {
    console.error('Image failed to load:', run.outputBlobId);
    setImageLoadError(true);
    
    // Mark the run as failed if it's currently marked as success
    if (run.status.__kind__ === 'success') {
      try {
        await updateWorkflowRun.mutateAsync({
          runId: run.id,
          provider,
          status: { __kind__: 'failed', failed: 'Failed to load generated image. The image may be corrupted or unavailable.' },
        });
      } catch (error) {
        console.error('Failed to update run status after image load error:', error);
      }
    }
  };

  const isProcessing = run.status.__kind__ === 'pending' || run.status.__kind__ === 'running';
  const isComplete = run.status.__kind__ === 'success';
  const isFailed = run.status.__kind__ === 'failed';

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusBadge()}
            {run.durationNanos && (
              <span className="text-sm text-muted-foreground">
                {(Number(run.durationNanos) / 1_000_000_000).toFixed(1)}s
              </span>
            )}
          </div>
          {isProcessing && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              disabled={cancelRun.isPending}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Show inputs */}
        {run.inputs && (
          <div className="text-sm space-y-1">
            <p className="font-medium text-muted-foreground">Prompt:</p>
            <p className="text-foreground line-clamp-3">
              {(() => {
                try {
                  const inputs = JSON.parse(run.inputs);
                  return inputs.prompt || inputs.script || 'No prompt provided';
                } catch {
                  return run.inputs;
                }
              })()}
            </p>
          </div>
        )}

        {/* Show preview for completed generations */}
        {isComplete && run.outputBlobId && !imageLoadError && (
          <div className="space-y-3">
            <div className="relative aspect-square w-full overflow-hidden rounded-lg border bg-muted">
              {workflowType === 'video-generation' ? (
                <video
                  src={run.outputBlobId}
                  controls
                  className="h-full w-full object-contain"
                  onError={handleImageError}
                />
              ) : (
                <img
                  src={run.outputBlobId}
                  alt="Generated content"
                  className="h-full w-full object-contain"
                  onError={handleImageError}
                />
              )}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleDownload} className="flex-1">
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
              <Button variant="outline" size="sm" onClick={handleShare} className="flex-1">
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
            </div>
          </div>
        )}

        {/* Show error when image fails to load */}
        {isComplete && imageLoadError && (
          <div className="flex items-start gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <div className="text-sm text-destructive">
              Failed to load generated image. The image may be corrupted or unavailable. Please try generating again.
            </div>
          </div>
        )}

        {/* Show error message for failed generations */}
        {isFailed && run.status.__kind__ === 'failed' && (
          <div className="flex items-start gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <div className="text-sm text-destructive">
              {run.status.failed}
            </div>
          </div>
        )}

        {/* Show loading state */}
        {isProcessing && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
