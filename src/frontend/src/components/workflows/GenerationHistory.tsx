import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Download, Share2, Eye, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import type { WorkflowRun } from '@/backend';
import { getArtifactDirectURL, downloadArtifact, generateArtifactFilename, getMimeTypeFromFilename } from '@/utils/artifacts';
import { shareArtifact } from '@/utils/share';
import { useState } from 'react';

interface GenerationHistoryProps {
  runs: WorkflowRun[];
  onReuseRun?: (run: WorkflowRun) => void;
  isLoading?: boolean;
}

export default function GenerationHistory({ runs, onReuseRun, isLoading }: GenerationHistoryProps) {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [sharingId, setSharingId] = useState<string | null>(null);

  const handleDownload = async (run: WorkflowRun) => {
    if (!run.outputBlobId) return;

    setDownloadingId(run.id);
    try {
      const isImage = run.workflowType === 'image-generation';
      const isVideo = run.workflowType === 'video-generation';
      const extension = isImage ? 'png' : isVideo ? 'mp4' : 'bin';
      const filename = generateArtifactFilename(run.workflowType, run.provider, extension);
      const mimeType = getMimeTypeFromFilename(filename);
      
      await downloadArtifact(run.outputBlobId, filename, mimeType);
      toast.success('Download started');
    } catch (error: any) {
      toast.error(error.message || 'Download failed');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleShare = async (run: WorkflowRun) => {
    if (!run.outputBlobId) return;

    setSharingId(run.id);
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
      setSharingId(null);
    }
  };

  const getStatusBadge = (status: WorkflowRun['status']) => {
    switch (status.__kind__) {
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      case 'running':
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">Running</Badge>;
      case 'success':
        return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">Success</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return null;
    }
  };

  const getSummary = (run: WorkflowRun): string => {
    try {
      const inputs = JSON.parse(run.inputs);
      if (inputs.prompt) {
        return inputs.prompt.length > 60 ? inputs.prompt.substring(0, 60) + '...' : inputs.prompt;
      }
      if (inputs.model) {
        return `Model: ${inputs.model}`;
      }
      return 'No description';
    } catch (e) {
      return 'No description';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 animate-spin" />
            Loading History...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (runs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Generation History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No generation history yet. Create your first generation above.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generation History</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {runs.map((run) => (
              <div
                key={run.id}
                className="rounded-lg border p-4 space-y-3 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getStatusBadge(run.status)}
                      <span className="text-xs text-muted-foreground">
                        {new Date(Number(run.timestamp) / 1000000).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {getSummary(run)}
                    </p>
                  </div>
                </div>

                {/* Preview thumbnail for successful runs */}
                {run.status.__kind__ === 'success' && run.outputBlobId && (
                  <div className="rounded overflow-hidden border bg-muted">
                    {run.workflowType === 'image-generation' && (
                      <img
                        src={getArtifactDirectURL(run.outputBlobId)}
                        alt="Generated"
                        className="w-full h-32 object-cover"
                      />
                    )}
                    {run.workflowType === 'video-generation' && (
                      <video
                        src={getArtifactDirectURL(run.outputBlobId)}
                        className="w-full h-32 object-cover"
                      />
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  {run.status.__kind__ === 'success' && run.outputBlobId && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownload(run)}
                        disabled={downloadingId === run.id}
                      >
                        <Download className="mr-1 h-3 w-3" />
                        {downloadingId === run.id ? 'Downloading...' : 'Download'}
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleShare(run)}
                        disabled={sharingId === run.id}
                      >
                        <Share2 className="mr-1 h-3 w-3" />
                        {sharingId === run.id ? 'Sharing...' : 'Share'}
                      </Button>
                    </>
                  )}

                  {onReuseRun && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onReuseRun(run)}
                    >
                      <RefreshCw className="mr-1 h-3 w-3" />
                      Reuse
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
