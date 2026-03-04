import type { ProviderConfig } from '@/providers/providers';

export interface ImageGenerationParams {
  prompt: string;
  apiKey: string;
  provider: ProviderConfig;
  model?: string;
  positivePrompt?: string;
  negativePrompt?: string;
  imageSize?: string;
}

export interface ImageGenerationResult {
  imageUrl: string;
  imageBytes?: Uint8Array;
}

/**
 * Generate an image using the specified provider's API
 */
export async function generateImage(params: ImageGenerationParams): Promise<ImageGenerationResult> {
  const { prompt, apiKey, provider, model, positivePrompt, negativePrompt, imageSize } = params;

  switch (provider.id) {
    case 'openai':
      return generateOpenAIImage(prompt, apiKey);
    case 'fal-ai':
      return generateFalAIImage(prompt, apiKey, model, positivePrompt, negativePrompt, imageSize);
    case 'stability-ai':
      return generateStabilityAIImage(prompt, apiKey, model);
    case 'replicate':
      return generateReplicateImage(prompt, apiKey, model);
    case 'leonardo-ai':
      return generateLeonardoAIImage(prompt, apiKey, model);
    default:
      throw new Error(`Image generation not implemented for provider: ${provider.id}`);
  }
}

async function generateOpenAIImage(prompt: string, apiKey: string): Promise<ImageGenerationResult> {
  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size: '1024x1024',
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `OpenAI API error: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();
  if (!data.data?.[0]?.url) {
    throw new Error('No image URL returned from OpenAI. The generation may have failed.');
  }

  return { imageUrl: data.data[0].url };
}

async function generateFalAIImage(
  prompt: string,
  apiKey: string,
  model?: string,
  positivePrompt?: string,
  negativePrompt?: string,
  imageSize?: string
): Promise<ImageGenerationResult> {
  const selectedModel = model || 'fal-ai/flux-pro';
  
  // Validate model selection
  const validModels = ['fal-ai/flux-pro', 'fal-ai/flux-dev', 'fal-ai/flux-schnell'];
  if (!validModels.includes(selectedModel)) {
    throw new Error(
      `The selected model "${selectedModel}" is not available. Please choose from: ${validModels.join(', ')}`
    );
  }

  const requestBody: any = {
    prompt: prompt || positivePrompt || 'A beautiful landscape',
  };

  if (positivePrompt && positivePrompt.trim()) {
    requestBody.prompt = positivePrompt;
  }

  if (negativePrompt && negativePrompt.trim()) {
    requestBody.negative_prompt = negativePrompt;
  }

  if (imageSize) {
    requestBody.image_size = imageSize;
  }

  const response = await fetch(`https://fal.run/${selectedModel}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Key ${apiKey}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(
        `The selected model endpoint "${selectedModel}" was not found. This model may no longer be available. Please select a different model and try again.`
      );
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message ||
        errorData.detail ||
        `Fal.ai API error: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();
  
  // Validate response structure
  if (!data.images || !Array.isArray(data.images) || data.images.length === 0) {
    throw new Error('No images returned from Fal.ai. The generation may have failed or returned an empty result.');
  }

  const imageUrl = data.images[0].url;
  if (!imageUrl || typeof imageUrl !== 'string') {
    throw new Error('Invalid image URL returned from Fal.ai. The image data may be corrupted.');
  }

  // Validate that the image URL is accessible
  try {
    const imageResponse = await fetch(imageUrl, { method: 'HEAD' });
    if (!imageResponse.ok) {
      throw new Error(`Image URL is not accessible (status: ${imageResponse.status})`);
    }
    const contentType = imageResponse.headers.get('content-type');
    if (!contentType || !contentType.startsWith('image/')) {
      throw new Error(`Invalid content type: expected image, got ${contentType || 'unknown'}`);
    }
  } catch (error: any) {
    throw new Error(
      `Failed to validate generated image: ${error.message}. The image may not have been generated correctly.`
    );
  }

  return { imageUrl };
}

async function generateStabilityAIImage(
  prompt: string,
  apiKey: string,
  model?: string
): Promise<ImageGenerationResult> {
  const engineId = model || 'stable-diffusion-xl-1024-v1-0';

  const response = await fetch(
    `https://api.stability.ai/v1/generation/${engineId}/text-to-image`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        text_prompts: [{ text: prompt }],
        cfg_scale: 7,
        height: 1024,
        width: 1024,
        steps: 30,
        samples: 1,
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `Stability AI API error: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();
  if (!data.artifacts?.[0]?.base64) {
    throw new Error('No image data returned from Stability AI. The generation may have failed.');
  }

  const base64Image = data.artifacts[0].base64;
  const imageBytes = Uint8Array.from(atob(base64Image), (c) => c.charCodeAt(0));
  const blob = new Blob([imageBytes], { type: 'image/png' });
  const imageUrl = URL.createObjectURL(blob);

  return { imageUrl, imageBytes };
}

async function generateReplicateImage(
  prompt: string,
  apiKey: string,
  model?: string
): Promise<ImageGenerationResult> {
  const selectedModel = model || 'stability-ai/sdxl';

  const response = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Token ${apiKey}`,
    },
    body: JSON.stringify({
      version: selectedModel,
      input: { prompt },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.detail || `Replicate API error: ${response.status} ${response.statusText}`
    );
  }

  const prediction = await response.json();
  const predictionUrl = prediction.urls?.get;

  if (!predictionUrl) {
    throw new Error('No prediction URL returned from Replicate. The generation may have failed.');
  }

  // Poll for completion
  let result = prediction;
  while (result.status === 'starting' || result.status === 'processing') {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const pollResponse = await fetch(predictionUrl, {
      headers: { Authorization: `Token ${apiKey}` },
    });
    result = await pollResponse.json();
  }

  if (result.status === 'failed') {
    throw new Error(result.error || 'Replicate generation failed');
  }

  if (!result.output?.[0]) {
    throw new Error('No image URL returned from Replicate. The generation may have failed.');
  }

  return { imageUrl: result.output[0] };
}

async function generateLeonardoAIImage(
  prompt: string,
  apiKey: string,
  model?: string
): Promise<ImageGenerationResult> {
  const response = await fetch('https://cloud.leonardo.ai/api/rest/v1/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      prompt,
      modelId: model || 'leonardo-diffusion-xl',
      width: 1024,
      height: 1024,
      num_images: 1,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error || `Leonardo AI API error: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();
  const generationId = data.sdGenerationJob?.generationId;

  if (!generationId) {
    throw new Error('No generation ID returned from Leonardo AI. The generation may have failed.');
  }

  // Poll for completion
  let result: any = null;
  for (let i = 0; i < 30; i++) {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const pollResponse = await fetch(
      `https://cloud.leonardo.ai/api/rest/v1/generations/${generationId}`,
      {
        headers: { Authorization: `Bearer ${apiKey}` },
      }
    );
    result = await pollResponse.json();
    if (result.generations_by_pk?.status === 'COMPLETE') {
      break;
    }
  }

  if (!result?.generations_by_pk?.generated_images?.[0]?.url) {
    throw new Error('No image URL returned from Leonardo AI. The generation may have failed or timed out.');
  }

  return { imageUrl: result.generations_by_pk.generated_images[0].url };
}
