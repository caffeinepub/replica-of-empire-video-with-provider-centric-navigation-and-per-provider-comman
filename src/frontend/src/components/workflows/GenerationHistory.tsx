import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Share2, RotateCcw, Loader2, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import type { WorkflowRun } from '@/backend';
import type { WorkflowType } from '@/providers/providers';
import { shareArtifact } from '@/utils/share';

interface GenerationHistoryProps {
  runs: WorkflowRun[];
  provider: string;
  workflowType: WorkflowType;
}

export function GenerationHistory({ runs, provider, workflowType }: GenerationHistoryProps) {
  const handleDownload = async (run: WorkflowRun) => {
    if (!run.outputBlobId) return;

    try {
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

  const handleShare = async (run: WorkflowRun) => {
    if (!run.outputBlobId) return;

    try {
      await shareArtifact(run.outputBlobId, `${provider} ${workflowType}`);
    } catch (error) {
      console.error('Share failed:', error);
      toast.error('Failed to share');
    }
  };

  const handleReuse = (run: WorkflowRun) => {
    try {
      const inputs = JSON.parse(run.inputs);
      // This would ideally populate the form, but for now just show a toast
      toast.info('Copy the prompt from this generation to reuse it');
    } catch (error) {
      console.error('Failed to parse inputs:', error);
    }
  };

  const getStatusIcon = (status: WorkflowRun['status']) => {
    switch (status.__kind__) {
      case 'pending':
        return <Clock className="h-3 w-3" />;
      case 'running':
        return <Loader2 className="h-3 w-3 animate-spin" />;
      case 'success':
        return <CheckCircle2 className="h-3 w-3" />;
      case 'failed':
        return <XCircle className="h-3 w-3" />;
    }
  };

  if (runs.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {runs.map((run) => {
        const isComplete = run.status.__kind__ === 'success';
        const isFailed = run.status.__kind__ === 'failed';

        return (
          <Card key={run.id} className="overflow-hidden">
            <CardContent className="p-3 space-y-2">
              <div className="flex items-center justify-between">
                <Badge variant={isComplete ? 'default' : isFailed ? 'destructive' : 'outline'} className="gap-1">
                  {getStatusIcon(run.status)}
                  {run.status.__kind__}
                </Badge>
                {run.durationNanos && (
                  <span className="text-xs text-muted-foreground">
                    {(Number(run.durationNanos) / 1_000_000_000).toFixed(1)}s
                  </span>
                )}
              </div>

              {isComplete && run.outputBlobId && (
                <div className="relative aspect-square w-full overflow-hidden rounded border bg-muted">
                  {workflowType === 'video-generation' ? (
                    <video
                      src={run.outputBlobId}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <img
                      src={run.outputBlobId}
                      alt="Generated content"
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
              )}

              {isFailed && run.status.__kind__ === 'failed' && (
                <div className="text-xs text-destructive line-clamp-2">
                  {run.status.failed}
                </div>
              )}

              {run.inputs && (
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {(() => {
                    try {
                      const inputs = JSON.parse(run.inputs);
                      return inputs.prompt || inputs.script || 'No prompt';
                    } catch {
                      return run.inputs;
                    }
                  })()}
                </p>
              )}

              {isComplete && run.outputBlobId && (
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleReuse(run)}
                    className="flex-1 h-8 text-xs"
                  >
                    <RotateCcw className="mr-1 h-3 w-3" />
                    Reuse
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(run)}
                    className="h-8 px-2"
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleShare(run)}
                    className="h-8 px-2"
                  >
                    <Share2 className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
