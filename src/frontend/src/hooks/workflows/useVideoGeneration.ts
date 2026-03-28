import type { WorkflowRun } from "@/backend";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { useBackendActor } from "../useBackendActor";
import { useWorkflowRunUpdate } from "./useWorkflowExecution";

const LTX_MODEL = "fal-ai/lightricks/ltx-video";

async function pollFalQueue(
  model: string,
  requestId: string,
  apiKey: string,
  signal?: AbortSignal,
): Promise<any> {
  const statusUrl = `https://queue.fal.run/${model}/requests/${requestId}/status?logs=1`;
  const resultUrl = `https://queue.fal.run/${model}/requests/${requestId}`;

  for (let i = 0; i < 120; i++) {
    if (signal?.aborted) throw new Error("Video generation cancelled");
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const statusRes = await fetch(statusUrl, {
      headers: { Authorization: `Key ${apiKey}` },
    });
    if (!statusRes.ok) continue;

    const status = await statusRes.json();
    if (status.status === "COMPLETED") {
      const resultRes = await fetch(resultUrl, {
        headers: { Authorization: `Key ${apiKey}` },
      });
      if (!resultRes.ok)
        throw new Error(`Failed to fetch result: ${resultRes.status}`);
      return resultRes.json();
    }
    if (status.status === "FAILED") {
      throw new Error(status.error || "Video generation failed on Fal.ai");
    }
  }
  throw new Error("Video generation timed out after 6 minutes");
}

async function generateLTXVideo(
  prompt: string,
  apiKey: string,
): Promise<string> {
  const response = await fetch(`https://fal.run/${LTX_MODEL}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Key ${apiKey}`,
    },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      err.error?.message ||
        err.detail ||
        `Fal.ai LTX error: ${response.status} ${response.statusText}`,
    );
  }

  const data = await response.json();

  // Immediate result
  if (data.video?.url) return data.video.url;

  // Async queue result
  if (data.request_id) {
    const result = await pollFalQueue(LTX_MODEL, data.request_id, apiKey);
    if (result.video?.url) return result.video.url;
    throw new Error("No video URL in Fal.ai LTX result");
  }

  throw new Error("Unexpected response from Fal.ai LTX Video");
}

interface UseVideoGenerationParams {
  provider: string;
  onSuccess?: (run: WorkflowRun, videoUrl: string) => void;
  onError?: (error: Error) => void;
}

export function useVideoGeneration({
  provider,
  onSuccess,
  onError,
}: UseVideoGenerationParams) {
  const { actor, isReady } = useBackendActor();
  const updateWorkflowRun = useWorkflowRunUpdate();
  const [isGenerating, setIsGenerating] = useState(false);

  const generateVideoForRun = useCallback(
    async (
      run: WorkflowRun,
      inputs: Record<string, any>,
    ): Promise<WorkflowRun | undefined> => {
      if (!actor || !isReady) {
        toast.error("Backend not ready. Please try again.");
        return;
      }

      setIsGenerating(true);
      const startTime = Date.now();

      try {
        await updateWorkflowRun.mutateAsync({
          runId: run.id,
          provider,
          status: { __kind__: "running", running: null },
        });

        // Try provider key first, then fall back to fal-ai key
        let apiKeyData = await actor.getProviderKey(provider);
        if (!apiKeyData) {
          apiKeyData = await actor.getProviderKey("fal-ai");
        }
        if (!apiKeyData) {
          throw new Error(
            `No API key found for ${provider}. Please add your LTX/Fal.ai API key in the Key Vault.`,
          );
        }

        const prompt = inputs.prompt || inputs.positivePrompt || "";
        if (!prompt.trim()) {
          throw new Error("Prompt is required for video generation");
        }

        const videoUrl = await generateLTXVideo(prompt, apiKeyData.key);
        const durationNanos = BigInt((Date.now() - startTime) * 1_000_000);

        const updatedRun = await updateWorkflowRun.mutateAsync({
          runId: run.id,
          provider,
          status: { __kind__: "success", success: null },
          outputBlobId: videoUrl,
          durationNanos,
        });

        toast.success("Video generated successfully!");
        onSuccess?.(updatedRun, videoUrl);
        return updatedRun;
      } catch (error: any) {
        console.error("Video generation failed:", error);
        const errorMessage =
          error.message || "Video generation failed. Please try again.";

        try {
          await updateWorkflowRun.mutateAsync({
            runId: run.id,
            provider,
            status: { __kind__: "failed", failed: errorMessage },
          });
        } catch (updateError) {
          console.error("Failed to update workflow run status:", updateError);
        }

        toast.error(errorMessage);
        onError?.(error);
      } finally {
        setIsGenerating(false);
      }
    },
    [actor, isReady, provider, updateWorkflowRun, onSuccess, onError],
  );

  return { generateVideoForRun, isGenerating };
}
