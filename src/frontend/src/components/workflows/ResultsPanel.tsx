import type { WorkflowRun } from "@/backend";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCancelWorkflowRun } from "@/hooks/workflows/useCancelWorkflowRun";
import { useWorkflowRunUpdate } from "@/hooks/workflows/useWorkflowExecution";
import type { WorkflowType } from "@/providers/providers";
import { shareArtifact } from "@/utils/share";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Download,
  ImageIcon,
  Loader2,
  Share2,
  X,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ResultsPanelProps {
  run?: WorkflowRun | null;
  provider: string;
  workflowType: WorkflowType;
  isGenerating?: boolean;
}

export function ResultsPanel({
  run,
  provider,
  workflowType,
  isGenerating,
}: ResultsPanelProps) {
  const cancelRun = useCancelWorkflowRun();
  const updateWorkflowRun = useWorkflowRunUpdate();
  const [imageLoadError, setImageLoadError] = useState(false);

  const isProcessing =
    isGenerating ||
    run?.status.__kind__ === "pending" ||
    run?.status.__kind__ === "running";
  const isComplete = run?.status.__kind__ === "success";
  const isFailed = run?.status.__kind__ === "failed";
  const isArtifact =
    workflowType === "image-generation" || workflowType === "video-generation";

  const handleDownload = async () => {
    if (!run?.outputBlobId) return;
    try {
      const link = document.createElement("a");
      link.href = run.outputBlobId;
      link.download = `${provider}-${workflowType}-${run.id}.${workflowType === "video-generation" ? "mp4" : "png"}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Download started");
    } catch {
      toast.error("Failed to download");
    }
  };

  const handleShare = async () => {
    if (!run?.outputBlobId) return;
    try {
      await shareArtifact(run.outputBlobId, `${provider} ${workflowType}`);
    } catch {
      toast.error("Failed to share");
    }
  };

  const handleCancel = async () => {
    if (!run) return;
    try {
      await cancelRun.mutateAsync({ runId: run.id, provider });
      toast.success("Generation cancelled");
    } catch (error: any) {
      toast.error(error.message || "Failed to cancel");
    }
  };

  const handleImageError = async () => {
    setImageLoadError(true);
    if (run && run.status.__kind__ === "success") {
      try {
        await updateWorkflowRun.mutateAsync({
          runId: run.id,
          provider,
          status: {
            __kind__: "failed",
            failed: "Failed to load generated image.",
          },
        });
      } catch {
        // ignore
      }
    }
  };

  return (
    <Card
      className="w-full border-2 border-dashed border-muted-foreground/20"
      data-ocid="results.panel"
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <ImageIcon className="h-4 w-4 text-primary" />
          Results
          {isProcessing && (
            <Badge variant="outline" className="ml-auto gap-1 text-xs">
              <Loader2 className="h-3 w-3 animate-spin" />
              Generating...
            </Badge>
          )}
          {isComplete && (
            <Badge
              variant="default"
              className="ml-auto gap-1 bg-green-600 text-xs"
            >
              <CheckCircle2 className="h-3 w-3" />
              Complete
            </Badge>
          )}
          {isFailed && (
            <Badge variant="destructive" className="ml-auto gap-1 text-xs">
              <XCircle className="h-3 w-3" />
              Failed
            </Badge>
          )}
          {!isProcessing && !run && (
            <Badge variant="secondary" className="ml-auto gap-1 text-xs">
              <Clock className="h-3 w-3" />
              Waiting
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Empty state — before any generation */}
        {!isProcessing && !run && (
          <div
            className="flex flex-col items-center justify-center py-12 gap-3 text-center"
            data-ocid="results.empty_state"
          >
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
              <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
            </div>
            <p className="text-sm text-muted-foreground font-medium">
              Your results will appear here
            </p>
            <p className="text-xs text-muted-foreground/60 max-w-xs">
              {isArtifact
                ? "Enter a prompt above and click Generate to see your image or video here."
                : "Configure the options above and click Execute to see results here."}
            </p>
          </div>
        )}

        {/* Loading state */}
        {isProcessing && (
          <div
            className="flex flex-col items-center justify-center py-12 gap-4"
            data-ocid="results.loading_state"
          >
            <div className="relative">
              <div className="h-20 w-20 rounded-full border-4 border-muted" />
              <Loader2 className="h-20 w-20 animate-spin text-primary absolute inset-0" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-medium text-foreground">
                {workflowType === "video-generation"
                  ? "Generating your video..."
                  : workflowType === "image-generation"
                    ? "Generating your image..."
                    : "Running your workflow..."}
              </p>
              <p className="text-xs text-muted-foreground">
                {workflowType === "video-generation"
                  ? "This may take 1–5 minutes"
                  : "This may take 10–30 seconds"}
              </p>
            </div>
            {run && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                disabled={cancelRun.isPending}
                className="gap-1"
                data-ocid="results.cancel_button"
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
            )}
          </div>
        )}

        {/* Prompt summary */}
        {!isProcessing && run?.inputs && (
          <div className="mb-4 text-sm space-y-1">
            <p className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
              Prompt Used
            </p>
            <p className="text-foreground line-clamp-2">
              {(() => {
                try {
                  const inputs = JSON.parse(run.inputs);
                  return (
                    inputs.prompt ||
                    inputs.positivePrompt ||
                    inputs.script ||
                    "No prompt provided"
                  );
                } catch {
                  return run.inputs;
                }
              })()}
            </p>
          </div>
        )}

        {/* Image result */}
        {isComplete && run?.outputBlobId && !imageLoadError && isArtifact && (
          <div className="space-y-3" data-ocid="results.success_state">
            <div className="relative rounded-lg overflow-hidden border bg-muted w-full">
              {workflowType === "video-generation" ? (
                // biome-ignore lint/a11y/useMediaCaption: AI-generated video
                <video
                  src={run.outputBlobId}
                  controls
                  className="w-full max-h-[480px] object-contain"
                  onError={handleImageError}
                />
              ) : (
                <img
                  src={run.outputBlobId}
                  alt="Generated content"
                  className="w-full object-contain max-h-[512px]"
                  onError={handleImageError}
                />
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="flex-1"
                data-ocid="results.download_button"
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="flex-1"
                data-ocid="results.share_button"
              >
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
            </div>
          </div>
        )}

        {/* Text/workflow result */}
        {isComplete && !isArtifact && (
          <div
            className="rounded-lg border bg-muted/40 p-4 text-sm text-foreground"
            data-ocid="results.success_state"
          >
            <div className="flex items-center gap-2 mb-2 text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              <span className="font-medium">
                Workflow completed successfully
              </span>
            </div>
            {run?.inputs && (
              <div className="text-muted-foreground text-xs mt-2">
                Run ID: {run.id}
              </div>
            )}
          </div>
        )}

        {/* Image load error */}
        {isComplete && imageLoadError && (
          <div
            className="flex items-start gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-4"
            data-ocid="results.error_state"
          >
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <div className="text-sm text-destructive">
              Failed to load the generated image. Please try generating again.
            </div>
          </div>
        )}

        {/* Failed state */}
        {isFailed && run?.status.__kind__ === "failed" && (
          <div
            className="flex items-start gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-4"
            data-ocid="results.error_state"
          >
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <div className="text-sm text-destructive">{run.status.failed}</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
