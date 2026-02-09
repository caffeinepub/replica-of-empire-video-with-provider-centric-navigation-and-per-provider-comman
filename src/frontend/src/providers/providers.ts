import { Bot, Zap, Repeat, Server, MessageSquare, Sparkles, Video, Film, Wand2, Image, Layers, Box, Palette, Users, Hash, ShoppingBag, Store, Settings } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type WorkflowType = 'chat' | 'video-generation' | 'image-generation' | 'app-builder' | 'integration' | 'custom';

export interface OptionField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'number';
  placeholder?: string;
  options?: string[];
  defaultValue?: string | number;
}

export interface ProviderConfig {
  id: string;
  name: string;
  displayName: string;
  description: string;
  icon: LucideIcon;
  capabilities: string[];
  route: string;
  isCustomSlot?: boolean;
  credentialLabel?: string;
  credentialPlaceholder?: string;
  workflowType?: WorkflowType;
  optionFields?: OptionField[];
  recommendedPrompts?: string[];
}

export const PROVIDERS: ProviderConfig[] = [
  {
    id: 'openai',
    name: 'openai',
    displayName: 'OpenAI',
    description: 'GPT-4, DALL-E 3, and advanced language models',
    icon: Bot,
    capabilities: ['Chat', 'Image Generation', 'Text Analysis'],
    route: '/providers/openai',
    workflowType: 'chat',
    optionFields: [
      { id: 'model', label: 'Model', type: 'select', options: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'], defaultValue: 'gpt-4' },
      { id: 'temperature', label: 'Temperature', type: 'number', defaultValue: 0.7 },
    ],
    recommendedPrompts: [
      'Explain quantum computing in simple terms',
      'Write a Python function to sort a list of dictionaries by a specific key',
      'Create a marketing email for a new product launch',
      'Summarize the key points of machine learning',
    ],
  },
  {
    id: 'replicate',
    name: 'replicate',
    displayName: 'Replicate',
    description: 'Run open-source ML models in the cloud',
    icon: Repeat,
    capabilities: ['Image Generation', 'Video Generation', 'Model Polling'],
    route: '/providers/replicate',
    workflowType: 'image-generation',
    optionFields: [
      { id: 'model', label: 'Model', type: 'select', options: ['stability-ai/sdxl', 'black-forest-labs/flux-schnell'], defaultValue: 'stability-ai/sdxl' },
      { id: 'prompt', label: 'Prompt', type: 'textarea', placeholder: 'Describe what you want to generate...' },
    ],
    recommendedPrompts: [
      'A futuristic cityscape at sunset with flying cars',
      'Portrait of a cyberpunk character with neon lights',
      'Abstract art with vibrant colors and geometric shapes',
    ],
  },
  {
    id: 'runpod',
    name: 'runpod',
    displayName: 'RunPod',
    description: 'Custom GPU endpoints and serverless inference',
    icon: Server,
    capabilities: ['Custom Endpoints', 'GPU Compute'],
    route: '/providers/runpod',
    workflowType: 'custom',
    optionFields: [
      { id: 'endpoint', label: 'Endpoint URL', type: 'text', placeholder: 'https://api.runpod.ai/v2/...' },
      { id: 'input', label: 'Input JSON', type: 'textarea', placeholder: '{"prompt": "..."}' },
    ],
    recommendedPrompts: [
      'Run inference on custom trained model',
      'Execute batch processing job',
    ],
  },
  {
    id: 'gemini',
    name: 'gemini',
    displayName: 'Gemini',
    description: 'Google\'s multimodal AI models for text and vision',
    icon: Sparkles,
    capabilities: ['Chat', 'Vision', 'Multimodal Understanding'],
    route: '/providers/gemini',
    workflowType: 'chat',
    optionFields: [
      { id: 'model', label: 'Model', type: 'select', options: ['gemini-pro', 'gemini-pro-vision'], defaultValue: 'gemini-pro' },
    ],
    recommendedPrompts: [
      'Analyze this image and describe what you see',
      'Compare and contrast two different approaches to solving this problem',
      'Generate a creative story about space exploration',
    ],
  },
  {
    id: 'ltx',
    name: 'ltx',
    displayName: 'LTX',
    description: 'Video generation and transformation models',
    icon: Zap,
    capabilities: ['Text-to-Video', 'Video Enhancement'],
    route: '/providers/ltx',
    workflowType: 'video-generation',
    optionFields: [
      { id: 'prompt', label: 'Video Prompt', type: 'textarea', placeholder: 'Describe the video you want to create...' },
      { id: 'duration', label: 'Duration (seconds)', type: 'number', defaultValue: 5 },
      { id: 'aspectRatio', label: 'Aspect Ratio', type: 'select', options: ['16:9', '9:16', '1:1'], defaultValue: '16:9' },
    ],
    recommendedPrompts: [
      'A serene ocean wave crashing on a beach at golden hour',
      'Time-lapse of a flower blooming in a garden',
      'Drone footage flying through a mountain valley',
      'Abstract particles forming into a logo',
    ],
  },
  {
    id: 'runway',
    name: 'runway',
    displayName: 'Runway',
    description: 'Advanced video generation and editing tools',
    icon: Video,
    capabilities: ['Video Generation', 'Video Editing', 'Motion Tracking'],
    route: '/providers/runway',
    workflowType: 'video-generation',
    optionFields: [
      { id: 'prompt', label: 'Video Prompt', type: 'textarea', placeholder: 'Describe the video scene...' },
      { id: 'duration', label: 'Duration (seconds)', type: 'number', defaultValue: 4 },
      { id: 'style', label: 'Style', type: 'select', options: ['Cinematic', 'Realistic', 'Animated', 'Abstract'], defaultValue: 'Cinematic' },
    ],
    recommendedPrompts: [
      'A person walking through a neon-lit cyberpunk street',
      'Camera slowly zooming into a mysterious forest',
      'Product showcase with smooth camera movements',
    ],
  },
  {
    id: 'pika',
    name: 'pika',
    displayName: 'Pika',
    description: 'AI-powered video creation and animation',
    icon: Film,
    capabilities: ['Text-to-Video', 'Image-to-Video', 'Video Effects'],
    route: '/providers/pika',
    workflowType: 'video-generation',
    optionFields: [
      { id: 'prompt', label: 'Video Prompt', type: 'textarea', placeholder: 'Describe your video...' },
      { id: 'duration', label: 'Duration (seconds)', type: 'number', defaultValue: 3 },
      { id: 'motion', label: 'Motion Intensity', type: 'select', options: ['Low', 'Medium', 'High'], defaultValue: 'Medium' },
    ],
    recommendedPrompts: [
      'A cat playing with a ball of yarn in slow motion',
      'Fireworks exploding over a city skyline',
      'Waterfall cascading down mossy rocks',
    ],
  },
  {
    id: 'luma',
    name: 'luma',
    displayName: 'Luma',
    description: '3D capture and video generation technology',
    icon: Box,
    capabilities: ['3D Capture', 'Video Generation', 'Scene Reconstruction'],
    route: '/providers/luma',
    workflowType: 'video-generation',
    optionFields: [
      { id: 'prompt', label: 'Scene Prompt', type: 'textarea', placeholder: 'Describe the 3D scene...' },
      { id: 'cameraMovement', label: 'Camera Movement', type: 'select', options: ['Static', 'Orbit', 'Fly-through', 'Dolly'], defaultValue: 'Orbit' },
    ],
    recommendedPrompts: [
      'A 3D model of a futuristic car rotating on a platform',
      'Camera orbiting around a detailed architectural structure',
      'Fly-through of a virtual museum gallery',
    ],
  },
  {
    id: 'kling',
    name: 'kling',
    displayName: 'Kling',
    description: 'High-quality video generation from text and images',
    icon: Wand2,
    capabilities: ['Text-to-Video', 'Image-to-Video', 'Long-form Video'],
    route: '/providers/kling',
    workflowType: 'video-generation',
    optionFields: [
      { id: 'prompt', label: 'Video Prompt', type: 'textarea', placeholder: 'Describe your video in detail...' },
      { id: 'duration', label: 'Duration (seconds)', type: 'number', defaultValue: 5 },
      { id: 'quality', label: 'Quality', type: 'select', options: ['Standard', 'High', 'Ultra'], defaultValue: 'High' },
    ],
    recommendedPrompts: [
      'A majestic eagle soaring over snow-capped mountains',
      'Time-lapse of clouds moving across a blue sky',
      'A chef preparing a gourmet dish in a professional kitchen',
    ],
  },
  {
    id: 'hailuo',
    name: 'hailuo',
    displayName: 'Hailuo',
    description: 'AI video generation and creative tools',
    icon: Layers,
    capabilities: ['Video Generation', 'Creative Effects', 'Style Transfer'],
    route: '/providers/hailuo',
    workflowType: 'video-generation',
    optionFields: [
      { id: 'prompt', label: 'Video Prompt', type: 'textarea', placeholder: 'Describe the video...' },
      { id: 'style', label: 'Visual Style', type: 'select', options: ['Realistic', 'Artistic', 'Anime', 'Sketch'], defaultValue: 'Realistic' },
    ],
    recommendedPrompts: [
      'A magical forest with glowing mushrooms and fireflies',
      'Urban street scene in the rain with reflections',
      'Underwater scene with colorful coral and fish',
    ],
  },
  {
    id: 'stability-ai',
    name: 'stability-ai',
    displayName: 'Stability AI',
    description: 'Stable Diffusion and image generation models',
    icon: Image,
    capabilities: ['Image Generation', 'Image Editing', 'Upscaling'],
    route: '/providers/stability-ai',
    workflowType: 'image-generation',
    optionFields: [
      { id: 'model', label: 'Model', type: 'select', options: ['stable-diffusion-xl-1024-v1-0', 'stable-diffusion-v1-6'], defaultValue: 'stable-diffusion-xl-1024-v1-0' },
      { id: 'prompt', label: 'Image Prompt', type: 'textarea', placeholder: 'Describe the image...' },
      { id: 'negativePrompt', label: 'Negative Prompt', type: 'textarea', placeholder: 'What to avoid...' },
      { id: 'aspectRatio', label: 'Aspect Ratio', type: 'select', options: ['1:1', '16:9', '9:16', '4:3'], defaultValue: '1:1' },
    ],
    recommendedPrompts: [
      'A photorealistic portrait of a person in natural lighting',
      'Fantasy landscape with castles and dragons',
      'Product photography of a luxury watch on marble surface',
      'Minimalist logo design with geometric shapes',
    ],
  },
  {
    id: 'fal-ai',
    name: 'fal-ai',
    displayName: 'Fal.ai',
    description: 'Fast AI model inference and deployment',
    icon: Zap,
    capabilities: ['Fast Inference', 'Model Deployment', 'API Access'],
    route: '/providers/fal-ai',
    workflowType: 'image-generation',
    optionFields: [
      { id: 'model', label: 'Model', type: 'select', options: ['fal-ai/flux-pro', 'fal-ai/flux-dev', 'fal-ai/flux-schnell'], defaultValue: 'fal-ai/flux-pro' },
      { id: 'prompt', label: 'Prompt', type: 'textarea', placeholder: 'Your main prompt...' },
      { id: 'positivePrompt', label: 'Positive prompt', type: 'textarea', placeholder: 'Elements to emphasize...' },
      { id: 'negativePrompt', label: 'Negative prompt', type: 'textarea', placeholder: 'Elements to avoid...' },
    ],
    recommendedPrompts: [
      'High-resolution architectural rendering of a modern building',
      'Character concept art for a video game',
      'Photorealistic product shot with studio lighting',
      'Abstract digital art with vibrant colors',
    ],
  },
  {
    id: 'modelscope',
    name: 'modelscope',
    displayName: 'ModelScope',
    description: 'Open-source AI models and tools',
    icon: Layers,
    capabilities: ['Model Library', 'Text-to-Video', 'Multi-task Models'],
    route: '/providers/modelscope',
    workflowType: 'video-generation',
    optionFields: [
      { id: 'task', label: 'Task', type: 'select', options: ['Text-to-Video', 'Image-to-Video', 'Video Enhancement'], defaultValue: 'Text-to-Video' },
      { id: 'prompt', label: 'Prompt', type: 'textarea', placeholder: 'Describe what you want...' },
    ],
    recommendedPrompts: [
      'A robot walking through a futuristic city',
      'Nature documentary style footage of wildlife',
    ],
  },
  {
    id: 'leonardo-ai',
    name: 'leonardo-ai',
    displayName: 'Leonardo AI',
    description: 'AI-powered creative content generation',
    icon: Palette,
    capabilities: ['Image Generation', 'Asset Creation', 'Style Control'],
    route: '/providers/leonardo-ai',
    workflowType: 'image-generation',
    optionFields: [
      { id: 'model', label: 'Model', type: 'select', options: ['Leonardo Diffusion XL', 'Leonardo Vision XL', 'Leonardo Anime XL'], defaultValue: 'Leonardo Diffusion XL' },
      { id: 'prompt', label: 'Image Prompt', type: 'textarea', placeholder: 'Describe your image...' },
      { id: 'style', label: 'Style Preset', type: 'select', options: ['Leonardo Style', 'Anime', 'Photorealistic', 'Digital Art'], defaultValue: 'Leonardo Style' },
    ],
    recommendedPrompts: [
      'Fantasy character design with detailed armor',
      'Isometric game asset of a medieval village',
      'Concept art for a sci-fi spaceship interior',
    ],
  },
  {
    id: 'synthesia',
    name: 'synthesia',
    displayName: 'Synthesia',
    description: 'AI video generation with virtual avatars',
    icon: Users,
    capabilities: ['Avatar Videos', 'Text-to-Speech', 'Multilingual'],
    route: '/providers/synthesia',
    workflowType: 'video-generation',
    optionFields: [
      { id: 'script', label: 'Video Script', type: 'textarea', placeholder: 'Enter the script for your avatar to speak...' },
      { id: 'avatar', label: 'Avatar', type: 'select', options: ['Professional Male', 'Professional Female', 'Casual Male', 'Casual Female'], defaultValue: 'Professional Female' },
      { id: 'language', label: 'Language', type: 'select', options: ['English', 'Spanish', 'French', 'German', 'Chinese'], defaultValue: 'English' },
    ],
    recommendedPrompts: [
      'Welcome message for new employees joining the company',
      'Product demonstration explaining key features',
      'Educational content about climate change',
      'Marketing pitch for a new software product',
    ],
  },
  {
    id: 'slack',
    name: 'slack',
    displayName: 'Slack',
    description: 'Team communication and workflow automation',
    icon: MessageSquare,
    capabilities: ['Messaging', 'Notifications', 'Webhooks'],
    route: '/providers/slack',
    workflowType: 'integration',
    optionFields: [
      { id: 'channel', label: 'Channel', type: 'text', placeholder: '#general' },
      { id: 'message', label: 'Message', type: 'textarea', placeholder: 'Your message...' },
    ],
    recommendedPrompts: [
      'Send a daily standup reminder to the team',
      'Post a deployment notification to the dev channel',
      'Share weekly metrics summary with stakeholders',
    ],
  },
  {
    id: 'tiktok',
    name: 'tiktok',
    displayName: 'TikTok',
    description: 'Social media integration and content publishing',
    icon: Hash,
    capabilities: ['Content Publishing', 'Analytics', 'API Integration'],
    route: '/providers/tiktok',
    workflowType: 'integration',
    optionFields: [
      { id: 'caption', label: 'Caption', type: 'textarea', placeholder: 'Video caption with hashtags...' },
      { id: 'privacy', label: 'Privacy', type: 'select', options: ['Public', 'Friends', 'Private'], defaultValue: 'Public' },
    ],
    recommendedPrompts: [
      'Post a product showcase video with trending hashtags',
      'Share behind-the-scenes content from our studio',
    ],
  },
  {
    id: 'shopify',
    name: 'shopify',
    displayName: 'Shopify',
    description: 'E-commerce platform integration',
    icon: ShoppingBag,
    capabilities: ['Store Management', 'Product Sync', 'Order Processing'],
    route: '/providers/shopify',
    workflowType: 'integration',
    optionFields: [
      { id: 'action', label: 'Action', type: 'select', options: ['Add Product', 'Update Inventory', 'Process Order'], defaultValue: 'Add Product' },
      { id: 'data', label: 'Data', type: 'textarea', placeholder: 'JSON data for the action...' },
    ],
    recommendedPrompts: [
      'Add a new product with images and description',
      'Update inventory levels for multiple SKUs',
    ],
  },
  {
    id: 'shopify-shop-url',
    name: 'shopify-shop-url',
    displayName: 'Shopify Shop URL',
    description: 'Configure your Shopify store URL',
    icon: Store,
    capabilities: ['Store Configuration', 'URL Management'],
    route: '/providers/shopify-shop-url',
    credentialLabel: 'Shop URL',
    credentialPlaceholder: 'https://your-store.myshopify.com',
    workflowType: 'integration',
  },
  {
    id: 'custom-slot-1',
    name: 'custom-slot-1',
    displayName: 'Custom Slot 1',
    description: 'Configure your own custom provider integration',
    icon: Settings,
    capabilities: ['Custom Integration', 'Flexible Configuration'],
    route: '/providers/custom-slot-1',
    isCustomSlot: true,
    workflowType: 'custom',
    recommendedPrompts: [
      'Execute custom workflow',
      'Run specialized task',
    ],
  },
  {
    id: 'custom-slot-2',
    name: 'custom-slot-2',
    displayName: 'Custom Slot 2',
    description: 'Configure your own custom provider integration',
    icon: Settings,
    capabilities: ['Custom Integration', 'Flexible Configuration'],
    route: '/providers/custom-slot-2',
    isCustomSlot: true,
    workflowType: 'custom',
    recommendedPrompts: [
      'Execute custom workflow',
      'Run specialized task',
    ],
  },
];

export function getProviderById(id: string): ProviderConfig | undefined {
  return PROVIDERS.find((p) => p.id === id);
}

export function getProviderByName(name: string): ProviderConfig | undefined {
  return PROVIDERS.find((p) => p.name === name);
}
