import type { WorkflowRun } from '@/backend';

interface ImageGenerationParams {
  provider: string;
  model?: string;
  prompt: string;
  positivePrompt?: string;
  negativePrompt?: string;
  aspectRatio?: string;
  style?: string;
  [key: string]: any;
}

interface ImageGenerationResult {
  imageUrl: string;
  imageData?: Uint8Array;
}

/**
 * Generate an image using OpenAI DALL-E
 */
async function generateWithOpenAI(apiKey: string, params: ImageGenerationParams): Promise<ImageGenerationResult> {
  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt: params.prompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
      response_format: 'url',
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
    throw new Error(error.error?.message || `OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const imageUrl = data.data[0].url;

  // Fetch the image data
  const imageResponse = await fetch(imageUrl);
  const imageBlob = await imageResponse.blob();
  const imageData = new Uint8Array(await imageBlob.arrayBuffer());

  return { imageUrl, imageData };
}

/**
 * Generate an image using Fal.ai Flux models
 */
async function generateWithFalAI(apiKey: string, params: ImageGenerationParams): Promise<ImageGenerationResult> {
  const model = params.model || 'fal-ai/flux-pro';
  
  // Combine prompts
  let fullPrompt = params.prompt || '';
  if (params.positivePrompt) {
    fullPrompt = `${fullPrompt} ${params.positivePrompt}`.trim();
  }

  const requestBody: any = {
    prompt: fullPrompt,
  };

  if (params.negativePrompt) {
    requestBody.negative_prompt = params.negativePrompt;
  }

  const response = await fetch(`https://fal.run/${model}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Key ${apiKey}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || error.detail || `Fal.ai API error: ${response.status}`);
  }

  const data = await response.json();
  const imageUrl = data.images?.[0]?.url || data.image?.url;

  if (!imageUrl) {
    throw new Error('No image URL returned from Fal.ai');
  }

  // Fetch the image data
  const imageResponse = await fetch(imageUrl);
  const imageBlob = await imageResponse.blob();
  const imageData = new Uint8Array(await imageBlob.arrayBuffer());

  return { imageUrl, imageData };
}

/**
 * Generate an image using Stability AI
 */
async function generateWithStabilityAI(apiKey: string, params: ImageGenerationParams): Promise<ImageGenerationResult> {
  const model = params.model || 'stable-diffusion-xl-1024-v1-0';
  
  // Map aspect ratio to dimensions
  const aspectRatioMap: Record<string, { width: number; height: number }> = {
    '1:1': { width: 1024, height: 1024 },
    '16:9': { width: 1344, height: 768 },
    '9:16': { width: 768, height: 1344 },
    '4:3': { width: 1152, height: 896 },
  };
  
  const dimensions = aspectRatioMap[params.aspectRatio || '1:1'] || { width: 1024, height: 1024 };

  const formData = new FormData();
  formData.append('prompt', params.prompt);
  if (params.negativePrompt) {
    formData.append('negative_prompt', params.negativePrompt);
  }
  formData.append('width', dimensions.width.toString());
  formData.append('height', dimensions.height.toString());
  formData.append('samples', '1');

  const response = await fetch(`https://api.stability.ai/v1/generation/${model}/text-to-image`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Accept': 'application/json',
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || `Stability AI API error: ${response.status}`);
  }

  const data = await response.json();
  const base64Image = data.artifacts?.[0]?.base64;

  if (!base64Image) {
    throw new Error('No image data returned from Stability AI');
  }

  // Convert base64 to Uint8Array
  const binaryString = atob(base64Image);
  const imageData = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    imageData[i] = binaryString.charCodeAt(i);
  }

  // Create a blob URL for preview
  const blob = new Blob([imageData], { type: 'image/png' });
  const imageUrl = URL.createObjectURL(blob);

  return { imageUrl, imageData };
}

/**
 * Generate an image using Replicate
 */
async function generateWithReplicate(apiKey: string, params: ImageGenerationParams): Promise<ImageGenerationResult> {
  const model = params.model || 'stability-ai/sdxl';
  
  // Start the prediction
  const response = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token ${apiKey}`,
    },
    body: JSON.stringify({
      version: model.includes('flux-schnell') 
        ? 'black-forest-labs/flux-schnell' 
        : 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
      input: {
        prompt: params.prompt,
        negative_prompt: params.negativePrompt || '',
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || `Replicate API error: ${response.status}`);
  }

  let prediction = await response.json();

  // Poll for completion
  while (prediction.status === 'starting' || prediction.status === 'processing') {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
      headers: {
        'Authorization': `Token ${apiKey}`,
      },
    });
    
    if (!pollResponse.ok) {
      throw new Error(`Replicate polling error: ${pollResponse.status}`);
    }
    
    prediction = await pollResponse.json();
  }

  if (prediction.status === 'failed') {
    throw new Error(prediction.error || 'Image generation failed');
  }

  const imageUrl = prediction.output?.[0] || prediction.output;

  if (!imageUrl) {
    throw new Error('No image URL returned from Replicate');
  }

  // Fetch the image data
  const imageResponse = await fetch(imageUrl);
  const imageBlob = await imageResponse.blob();
  const imageData = new Uint8Array(await imageBlob.arrayBuffer());

  return { imageUrl, imageData };
}

/**
 * Generate an image using Leonardo AI
 */
async function generateWithLeonardoAI(apiKey: string, params: ImageGenerationParams): Promise<ImageGenerationResult> {
  // Start generation
  const response = await fetch('https://cloud.leonardo.ai/api/rest/v1/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      prompt: params.prompt,
      modelId: params.model || 'b24e16ff-06e3-43eb-8d33-4416c2d75876', // Leonardo Diffusion XL
      width: 1024,
      height: 1024,
      num_images: 1,
      presetStyle: params.style || 'LEONARDO',
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `Leonardo AI API error: ${response.status}`);
  }

  const data = await response.json();
  const generationId = data.sdGenerationJob?.generationId;

  if (!generationId) {
    throw new Error('No generation ID returned from Leonardo AI');
  }

  // Poll for completion
  let imageUrl: string | null = null;
  for (let i = 0; i < 60; i++) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const pollResponse = await fetch(`https://cloud.leonardo.ai/api/rest/v1/generations/${generationId}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });
    
    if (!pollResponse.ok) {
      throw new Error(`Leonardo AI polling error: ${pollResponse.status}`);
    }
    
    const pollData = await pollResponse.json();
    
    if (pollData.generations_by_pk?.status === 'COMPLETE') {
      imageUrl = pollData.generations_by_pk?.generated_images?.[0]?.url;
      break;
    } else if (pollData.generations_by_pk?.status === 'FAILED') {
      throw new Error('Image generation failed');
    }
  }

  if (!imageUrl) {
    throw new Error('Image generation timed out');
  }

  // Fetch the image data
  const imageResponse = await fetch(imageUrl);
  const imageBlob = await imageResponse.blob();
  const imageData = new Uint8Array(await imageBlob.arrayBuffer());

  return { imageUrl, imageData };
}

/**
 * Main image generation function that routes to the appropriate provider
 */
export async function generateImage(
  provider: string,
  apiKey: string,
  params: ImageGenerationParams
): Promise<ImageGenerationResult> {
  switch (provider) {
    case 'openai':
      return generateWithOpenAI(apiKey, params);
    case 'fal-ai':
      return generateWithFalAI(apiKey, params);
    case 'stability-ai':
      return generateWithStabilityAI(apiKey, params);
    case 'replicate':
      return generateWithReplicate(apiKey, params);
    case 'leonardo-ai':
      return generateWithLeonardoAI(apiKey, params);
    default:
      throw new Error(`Image generation not supported for provider: ${provider}`);
  }
}

/**
 * Convert image data to a data URL for display
 */
export function imageDataToDataURL(imageData: Uint8Array, mimeType: string = 'image/png'): string {
  const blob = new Blob([imageData as BlobPart], { type: mimeType });
  return URL.createObjectURL(blob);
}
