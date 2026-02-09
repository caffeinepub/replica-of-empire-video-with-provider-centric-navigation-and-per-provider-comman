import { useState, useCallback } from 'react';
import { useBackendActor } from '../useBackendActor';
import { useWorkflowRunUpdate } from './useWorkflowExecution';
import { generateImage, imageDataToDataURL } from '@/services/imageGeneration';
import { toast } from 'sonner';
import type { WorkflowRun } from '@/backend';

interface UseImageGenerationParams {
  provider: string;
  onSuccess?: (run: WorkflowRun, imageUrl: string) => void;
  onError?: (error: Error) => void;
}

export function useImageGeneration({ provider, onSuccess, onError }: UseImageGenerationParams) {
  const { actor, isReady } = useBackendActor();
  const updateWorkflowRun = useWorkflowRunUpdate();
  const [isGenerating, setIsGenerating] = useState(false);

  const generateImageForRun = useCallback(async (run: WorkflowRun, inputs: Record<string, any>) => {
    if (!actor || !isReady) {
      toast.error('Backend not ready. Please try again.');
      return;
    }

    setIsGenerating(true);
    const startTime = Date.now();

    try {
      // Update status to running
      await updateWorkflowRun.mutateAsync({
        runId: run.id,
        provider,
        status: { __kind__: 'running', running: null },
      });

      // Get the API key from backend
      const apiKeyData = await actor.getProviderKey(provider);
      if (!apiKeyData) {
        throw new Error(`No API key found for ${provider}. Please add your API key in the Key Vault.`);
      }

      // Ensure we have a prompt
      const prompt = inputs.prompt || '';
      if (!prompt) {
        throw new Error('Prompt is required for image generation');
      }

      // Generate the image with proper typing
      const imageParams = {
        provider,
        prompt,
        model: inputs.model,
        positivePrompt: inputs.positivePrompt,
        negativePrompt: inputs.negativePrompt,
        aspectRatio: inputs.aspectRatio,
        style: inputs.style,
        ...inputs,
      };

      const result = await generateImage(provider, apiKeyData.key, imageParams);

      // Convert image data to data URL for display
      const imageUrl = result.imageData 
        ? imageDataToDataURL(result.imageData, 'image/png')
        : result.imageUrl;

      // Calculate duration
      const durationNanos = BigInt((Date.now() - startTime) * 1_000_000);

      // Update status to success with the image URL as outputBlobId
      const updatedRun = await updateWorkflowRun.mutateAsync({
        runId: run.id,
        provider,
        status: { __kind__: 'success', success: null },
        outputBlobId: imageUrl,
        durationNanos,
      });

      toast.success('Image generated successfully!');
      onSuccess?.(updatedRun, imageUrl);
    } catch (error: any) {
      console.error('Image generation failed:', error);
      
      // Update status to failed
      await updateWorkflowRun.mutateAsync({
        runId: run.id,
        provider,
        status: { __kind__: 'failed', failed: error.message || 'Image generation failed' },
      });

      toast.error(error.message || 'Failed to generate image');
      onError?.(error);
    } finally {
      setIsGenerating(false);
    }
  }, [actor, isReady, provider, updateWorkflowRun, onSuccess, onError]);

  return {
    generateImageForRun,
    isGenerating,
  };
}
