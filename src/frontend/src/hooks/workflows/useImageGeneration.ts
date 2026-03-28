import type { WorkflowRun } from "@/backend";
import { generateImage } from "@/services/imageGeneration";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { useBackendActor } from "../useBackendActor";
import { useWorkflowRunUpdate } from "./useWorkflowExecution";

interface UseImageGenerationParams {
  provider: string;
  onSuccess?: (run: WorkflowRun, imageUrl: string) => void;
  onError?: (error: Error) => void;
}

export function useImageGeneration({
  provider,
  onSuccess,
  onError,
}: UseImageGenerationParams) {
  const { actor, isReady } = useBackendActor();
  const updateWorkflowRun = useWorkflowRunUpdate();
  const [isGenerating, setIsGenerating] = useState(false);

  const generateImageForRun = useCallback(
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
        // Update status to running
        await updateWorkflowRun.mutateAsync({
          runId: run.id,
          provider,
          status: { __kind__: "running", running: null },
        });

        // Get the API key from backend
        const apiKeyData = await actor.getProviderKey(provider);
        if (!apiKeyData) {
          throw new Error(
            `No API key found for ${provider}. Please add your API key in the Key Vault.`,
          );
        }

        // Ensure we have a prompt
        const prompt = inputs.prompt || inputs.positivePrompt || "";
        if (!prompt.trim()) {
          throw new Error("Prompt is required for image generation");
        }

        // Generate the image with proper typing
        const imageParams = {
          prompt,
          apiKey: apiKeyData.key,
          provider: { id: provider } as any,
          model: inputs.model,
          positivePrompt: inputs.positivePrompt,
          negativePrompt: inputs.negativePrompt,
          imageSize: inputs.imageSize,
        };

        const result = await generateImage(imageParams);

        // Use the image URL from the result
        const imageUrl = result.imageUrl;

        // Calculate duration
        const durationNanos = BigInt((Date.now() - startTime) * 1_000_000);

        // Update status to success with the image URL as outputBlobId
        const updatedRun = await updateWorkflowRun.mutateAsync({
          runId: run.id,
          provider,
          status: { __kind__: "success", success: null },
          outputBlobId: imageUrl,
          durationNanos,
        });

        toast.success("Image generated successfully!");
        onSuccess?.(updatedRun, imageUrl);
        return updatedRun;
      } catch (error: any) {
        console.error("Image generation failed:", error);

        const errorMessage =
          error.message || "Image generation failed. Please try again.";

        // Update status to failed
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

  return {
    generateImageForRun,
    isGenerating,
  };
}
