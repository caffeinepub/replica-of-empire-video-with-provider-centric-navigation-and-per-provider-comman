import ChatbotCommandCenter from "@/components/chat/ChatbotCommandCenter";
import ProviderKeyManager from "@/components/keys/ProviderKeyManager";
import ProviderActionGuard from "@/components/providers/ProviderActionGuard";
import RecommendedPrompts from "@/components/providers/RecommendedPrompts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { GenerationHistory } from "@/components/workflows/GenerationHistory";
import { useBackendActor } from "@/hooks/useBackendActor";
import { useClearPendingWorkflowRunsForProvider } from "@/hooks/workflows/useClearPendingWorkflowRunsForProvider";
import { useWorkflowRuns } from "@/hooks/workflows/useWorkflowRuns";
import {
  Check,
  Code2,
  Copy,
  Download,
  ExternalLink,
  Image as ImageIcon,
  Loader2,
  MessageSquare,
  Play,
  Sparkles,
  Upload,
  Users,
  Video,
  X,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

// ─── Mode Definitions ────────────────────────────────────────────────────────

type VeniceMode = "chat" | "image" | "video" | "code" | "characters";

const VENICE_MODES: {
  id: VeniceMode;
  label: string;
  icon: React.ComponentType<any>;
  description: string;
}[] = [
  {
    id: "chat",
    label: "Text / Chat",
    icon: MessageSquare,
    description: "Conversational AI for writing, research, and reasoning",
  },
  {
    id: "image",
    label: "Image Generation",
    icon: ImageIcon,
    description: "Generate stunning images from text or uploaded images",
  },
  {
    id: "video",
    label: "Video Generation",
    icon: Video,
    description: "Create cinematic videos from text or images",
  },
  {
    id: "code",
    label: "Code",
    icon: Code2,
    description: "AI coding assistant for any language",
  },
  {
    id: "characters",
    label: "Characters",
    icon: Users,
    description: "Create rich AI personas and characters",
  },
];

// ─── Chat Models ─────────────────────────────────────────────────────────────

const CHAT_MODELS = [
  {
    id: "claude-opus-4-5",
    label: "Claude Opus 4.5",
    description:
      "Advanced conversational AI for writing, research, summarizing",
  },
  {
    id: "claude-sonnet-4-5",
    label: "Claude Sonnet 4.5",
    description: "Fast, capable conversational AI",
  },
  {
    id: "gpt-5.2",
    label: "GPT-5.2",
    description: "General purpose AI chat and reasoning",
  },
  {
    id: "gemini-3-pro-preview",
    label: "Gemini 3 Pro Preview",
    description: "Google's multimodal AI model",
  },
  {
    id: "deepseek-v3.2",
    label: "DeepSeek V3.2",
    description: "Open-source reasoning and research model",
  },
  {
    id: "grok-4.1-fast",
    label: "Grok 4.1 Fast",
    description: "Fast AI chat with unbiased responses",
  },
  {
    id: "kimi-k2-thinking",
    label: "Kimi K2 Thinking",
    description: "Deep reasoning and thinking model",
  },
  {
    id: "glm-4.6",
    label: "GLM 4.6",
    description: "Multilingual reasoning model",
  },
  {
    id: "glm-4.7",
    label: "GLM 4.7",
    description: "Enhanced multilingual model",
  },
  {
    id: "glm-4.7-reasoning",
    label: "GLM 4.7 Reasoning",
    description: "Advanced GLM reasoning model",
  },
  {
    id: "venice-uncensored-1.1",
    label: "Venice Uncensored 1.1",
    description: "Uncensored open-source AI",
  },
];

// ─── Image Models ─────────────────────────────────────────────────────────────

const IMAGE_MODELS = [
  {
    id: "flux-2-pro",
    label: "Flux 2 Pro",
    description: "High-quality text-to-image generation",
  },
  {
    id: "flux-2-max",
    label: "Flux 2 Max",
    description: "Maximum quality text-to-image",
  },
  {
    id: "gpt-image-1.5",
    label: "GPT Image 1.5",
    description: "OpenAI's image generation model",
  },
  {
    id: "lustify-sdxl",
    label: "Lustify SDXL",
    description: "Stylized image generation",
  },
  {
    id: "qwen-image",
    label: "Qwen Image",
    description: "Multimodal image understanding and generation",
  },
  {
    id: "anime-wai",
    label: "Anime (WAI)",
    description: "Anime-style image generation",
  },
];

// ─── Video Models ─────────────────────────────────────────────────────────────

const VIDEO_MODELS = [
  {
    id: "veo-3.1-fast",
    label: "Veo 3.1 Fast",
    description: "Google's fast text-to-video model",
  },
  {
    id: "veo-3.1-full",
    label: "Veo 3.1 Full Quality",
    description: "Google's high-quality text-to-video",
  },
  {
    id: "sora-2",
    label: "Sora 2",
    description: "OpenAI's cinematic video generation",
  },
  {
    id: "sora-2-pro",
    label: "Sora 2 Pro",
    description: "OpenAI's premium video generation",
  },
  {
    id: "kling-2.6-pro",
    label: "Kling 2.6 Pro",
    description: "High-motion video generation",
  },
  {
    id: "kling-2.5-turbo-pro",
    label: "Kling 2.5 Turbo Pro",
    description: "Fast high-motion video generation",
  },
  {
    id: "wan-2.6",
    label: "Wan 2.6",
    description: "Open-source video generation",
  },
  {
    id: "wan-2.1-pro",
    label: "Wan 2.1 Pro",
    description: "Professional open-source video generation",
  },
  {
    id: "ltx-video-2.0",
    label: "LTX Video 2.0 Full Quality",
    description: "Fast and efficient video generation",
  },
  {
    id: "longcat-full",
    label: "Longcat Full Quality",
    description: "Long-form video generation",
  },
  { id: "ovi", label: "Ovi", description: "AI video generation model" },
];

// ─── Code Models ─────────────────────────────────────────────────────────────

const CODE_MODELS = [
  {
    id: "gpt-5.2-codex",
    label: "GPT-5.2 Codex",
    description: "AI coding assistant for writing and debugging code",
  },
  {
    id: "deepseek-v3.2",
    label: "DeepSeek V3.2",
    description: "Open-source reasoning for code tasks",
  },
  {
    id: "glm-4.7-reasoning",
    label: "GLM 4.7 Reasoning",
    description: "Advanced reasoning for code generation",
  },
];

// ─── Character Models ─────────────────────────────────────────────────────────

const CHARACTER_MODELS = [
  {
    id: "claude-opus-4-5",
    label: "Claude Opus 4.5",
    description: "Create rich, detailed AI personas",
  },
  {
    id: "gpt-5.2",
    label: "GPT-5.2",
    description: "Design flexible AI characters",
  },
  {
    id: "venice-uncensored-1.1",
    label: "Venice Uncensored 1.1",
    description: "Uncensored character creation",
  },
];

// ─── Image Upload Component ───────────────────────────────────────────────────

interface ImageUploadProps {
  label: string;
  value?: File | null;
  onChange: (file: File | null) => void;
  "data-ocid"?: string;
}

function ImageUploadZone({
  label,
  onChange,
  "data-ocid": dataOcid,
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file (JPG, PNG, WEBP, GIF)");
        return;
      }
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      onChange(file);
    },
    [onChange],
  );

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleClear = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    onChange(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-2">
      <Label>
        {label}{" "}
        <span className="text-muted-foreground text-xs">(optional)</span>
      </Label>
      {previewUrl ? (
        <div className="relative rounded-lg overflow-hidden border border-border">
          <img
            src={previewUrl}
            alt="Upload preview"
            className="w-full max-h-48 object-cover"
          />
          <button
            type="button"
            onClick={handleClear}
            className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm rounded-full p-1 hover:bg-background transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          className={`w-full border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200 ${
            isDragging
              ? "border-primary bg-primary/5 scale-[1.01]"
              : "border-border hover:border-primary/50 hover:bg-muted/30"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          data-ocid={dataOcid}
        >
          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Drag & drop or{" "}
            <span className="text-primary underline underline-offset-2">
              browse
            </span>
          </p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            JPG, PNG, WEBP, GIF accepted
          </p>
        </button>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />
    </div>
  );
}

// ─── Model Select ─────────────────────────────────────────────────────────────

interface ModelSelectProps {
  models: { id: string; label: string; description: string }[];
  value: string;
  onChange: (v: string) => void;
  "data-ocid"?: string;
}

function ModelSelect({
  models,
  value,
  onChange,
  "data-ocid": dataOcid,
}: ModelSelectProps) {
  const selected = models.find((m) => m.id === value);
  return (
    <div className="space-y-2">
      <Label>Select Model</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger data-ocid={dataOcid}>
          <SelectValue placeholder="Choose a model..." />
        </SelectTrigger>
        <SelectContent>
          {models.map((m) => (
            <SelectItem key={m.id} value={m.id}>
              <div className="flex flex-col gap-0.5">
                <span className="font-medium">{m.label}</span>
                <span className="text-xs text-muted-foreground">
                  {m.description}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {selected && (
        <p className="text-xs text-muted-foreground">{selected.description}</p>
      )}
    </div>
  );
}

// ─── Chat Mode ────────────────────────────────────────────────────────────────

function ChatMode() {
  const [selectedModel, setSelectedModel] = useState(CHAT_MODELS[0].id);
  const [draftMessage, setDraftMessage] = useState("");

  const chatRecommendedPrompts = [
    "Write a viral Twitter thread about AI trends in 2025",
    "Summarize the pros and cons of renewable energy",
    "Explain blockchain to a 10-year-old",
    "Write a professional email declining a meeting",
    "Compare Python vs JavaScript for web development",
  ];

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-card p-4 space-y-3">
        <ModelSelect
          models={CHAT_MODELS}
          value={selectedModel}
          onChange={setSelectedModel}
          data-ocid="venice.model_select.select"
        />
      </div>
      <RecommendedPrompts
        prompts={chatRecommendedPrompts}
        onSelectPrompt={setDraftMessage}
      />
      <ChatbotCommandCenter
        providerId="venice-ai"
        providerName="Venice AI"
        draftMessage={draftMessage}
        onDraftChange={setDraftMessage}
      />
    </div>
  );
}

// ─── Image Mode ───────────────────────────────────────────────────────────────

function ImageMode() {
  const { actor, isReady } = useBackendActor();
  const [selectedModel, setSelectedModel] = useState(IMAGE_MODELS[0].id);
  const [positivePrompt, setPositivePrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [imageSize, setImageSize] = useState("square_hd");
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(
    null,
  );
  const [copied, setCopied] = useState(false);
  const [abortController, setAbortController] =
    useState<AbortController | null>(null);

  const clearPending = useClearPendingWorkflowRunsForProvider();
  const { data: workflowRuns = [] } = useWorkflowRuns("venice-ai");
  const hasPending = workflowRuns.some(
    (r) => r.status.__kind__ === "pending" || r.status.__kind__ === "running",
  );

  const handleGenerate = async () => {
    if (!positivePrompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    if (!isReady) {
      toast.error("Backend is still connecting. Please wait a moment.");
      return;
    }

    const ctrl = new AbortController();
    setAbortController(ctrl);
    setIsGenerating(true);
    setGeneratedImageUrl(null);

    try {
      if (ctrl.signal.aborted) return;

      if (!actor) throw new Error("Backend not connected");
      const apiKeyData = await actor.getProviderKey("venice-ai");
      if (!apiKeyData) {
        toast.error("Please save your Venice AI API key first.");
        return;
      }

      const result = await generateVeniceImage({
        prompt: positivePrompt,
        negativePrompt,
        model: selectedModel,
        imageSize,
        apiKey: apiKeyData.key,
      });

      if (!ctrl.signal.aborted) {
        setGeneratedImageUrl(result);
        toast.success("Image generated successfully!");
      }
    } catch (err: any) {
      if (!ctrl.signal.aborted) {
        toast.error(err.message || "Generation failed");
      }
    } finally {
      if (!ctrl.signal.aborted) {
        setIsGenerating(false);
        setAbortController(null);
      }
    }
  };

  const handleCancel = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
    }
    setIsGenerating(false);
    clearPending.mutate(
      { provider: "venice-ai" },
      {
        onSuccess: () => toast.info("Pending jobs cleared"),
      },
    );
  };

  const handleClearAll = () => {
    clearPending.mutate(
      { provider: "venice-ai" },
      {
        onSuccess: () => toast.info("All pending image jobs cleared"),
      },
    );
  };

  const handleDownload = async () => {
    if (!generatedImageUrl) return;
    const a = document.createElement("a");
    a.href = generatedImageUrl;
    a.download = `venice-image-${Date.now()}.png`;
    a.click();
    toast.success("Download started");
  };

  const handleCopyUrl = async () => {
    if (!generatedImageUrl) return;
    await navigator.clipboard.writeText(generatedImageUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("URL copied");
  };

  const historyRuns = workflowRuns
    .filter((r) => r.status.__kind__ === "success")
    .slice(0, 9);

  return (
    <div className="space-y-6">
      {/* Config */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-primary" />
            Image Generation Settings
          </CardTitle>
          <CardDescription>
            Generate images using Venice AI's image models
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ModelSelect
            models={IMAGE_MODELS}
            value={selectedModel}
            onChange={setSelectedModel}
            data-ocid="venice.model_select.select"
          />

          <div className="space-y-2">
            <Label htmlFor="venice-pos-prompt">Positive Prompt</Label>
            <Textarea
              id="venice-pos-prompt"
              placeholder="Describe what you want to see — be specific about style, lighting, composition..."
              value={positivePrompt}
              onChange={(e) => setPositivePrompt(e.target.value)}
              rows={3}
              data-ocid="venice.image.positive_prompt.textarea"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="venice-neg-prompt">Negative Prompt</Label>
            <Textarea
              id="venice-neg-prompt"
              placeholder="What to avoid — blurry, low quality, extra limbs, watermark..."
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
              rows={2}
              data-ocid="venice.image.negative_prompt.textarea"
            />
          </div>

          <div className="space-y-2">
            <Label>Image Size</Label>
            <Select value={imageSize} onValueChange={setImageSize}>
              <SelectTrigger data-ocid="venice.image.size.select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="square_hd">Square HD (1024×1024)</SelectItem>
                <SelectItem value="square">Square (512×512)</SelectItem>
                <SelectItem value="portrait_4_3">Portrait 4:3</SelectItem>
                <SelectItem value="portrait_16_9">Portrait 16:9</SelectItem>
                <SelectItem value="landscape_4_3">Landscape 4:3</SelectItem>
                <SelectItem value="landscape_16_9">Landscape 16:9</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <ImageUploadZone
            label="Upload reference image (image-to-image)"
            value={uploadedImage}
            onChange={setUploadedImage}
            data-ocid="venice.image.upload_button"
          />

          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !positivePrompt.trim()}
              className="flex-1"
              data-ocid="venice.image.primary_button"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Image
                </>
              )}
            </Button>
            {(isGenerating || hasPending) && (
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={clearPending.isPending}
                data-ocid="venice.image.cancel_button"
              >
                {clearPending.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <X className="h-4 w-4" />
                )}
              </Button>
            )}
            {!isGenerating && hasPending && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="text-xs"
              >
                Clear All Pending
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Result */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="rounded-lg border border-border bg-card p-6 flex flex-col items-center gap-3"
            data-ocid="venice.image.loading_state"
          >
            <div className="relative">
              <div className="h-16 w-16 rounded-full border-2 border-primary/20" />
              <Loader2 className="h-16 w-16 animate-spin text-primary absolute inset-0" />
            </div>
            <p className="text-sm text-muted-foreground font-medium">
              Generating your image...
            </p>
            <p className="text-xs text-muted-foreground/60">
              This may take 10–30 seconds
            </p>
          </motion.div>
        )}

        {generatedImageUrl && !isGenerating && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            data-ocid="venice.image.success_state"
          >
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Generated Image
                  <Badge variant="outline" className="ml-auto text-xs">
                    {IMAGE_MODELS.find((m) => m.id === selectedModel)?.label}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-lg overflow-hidden border border-border">
                  <img
                    src={generatedImageUrl}
                    alt="Generated by Venice AI"
                    className="w-full object-contain max-h-[512px]"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleDownload} size="sm" className="flex-1">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                  <Button onClick={handleCopyUrl} variant="outline" size="sm">
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* History */}
      {historyRuns.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">
              Generation History
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="text-xs"
            >
              Clear Pending
            </Button>
          </div>
          <GenerationHistory
            runs={historyRuns}
            provider="venice-ai"
            workflowType="image-generation"
          />
        </div>
      )}
    </div>
  );
}

// ─── Venice Image API ─────────────────────────────────────────────────────────

async function generateVeniceImage(params: {
  prompt: string;
  negativePrompt?: string;
  model: string;
  imageSize?: string;
  apiKey: string;
}): Promise<string> {
  const { prompt, negativePrompt, model, imageSize, apiKey } = params;

  // Map our model IDs to Venice API model identifiers
  const modelMap: Record<string, string> = {
    "flux-2-pro": "flux-dev",
    "flux-2-max": "flux-dev",
    "gpt-image-1.5": "flux-dev",
    "lustify-sdxl": "lustify-sdxl",
    "qwen-image": "qwen2.5-vl-7b",
    "anime-wai": "wai-ani-nsfw-pony",
  };

  const veniceModel = modelMap[model] || "flux-dev";

  const sizeMap: Record<string, { width: number; height: number }> = {
    square_hd: { width: 1024, height: 1024 },
    square: { width: 512, height: 512 },
    portrait_4_3: { width: 768, height: 1024 },
    portrait_16_9: { width: 576, height: 1024 },
    landscape_4_3: { width: 1024, height: 768 },
    landscape_16_9: { width: 1024, height: 576 },
  };

  const dimensions = sizeMap[imageSize || "square_hd"] || {
    width: 1024,
    height: 1024,
  };

  const response = await fetch("https://api.venice.ai/api/v1/image/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: veniceModel,
      prompt,
      negative_prompt: negativePrompt || "",
      width: dimensions.width,
      height: dimensions.height,
      steps: 30,
      safe: false,
      return_binary: false,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      err.error?.message ||
        err.message ||
        `Venice AI error: ${response.status}`,
    );
  }

  const data = await response.json();

  // Venice returns images as base64 or URL
  if (data.images?.[0]) {
    const img = data.images[0];
    if (typeof img === "string" && img.startsWith("http")) return img;
    if (typeof img === "string") {
      const blob = new Blob(
        [
          Uint8Array.from(
            atob(img.replace(/^data:image\/\w+;base64,/, "")),
            (c) => c.charCodeAt(0),
          ),
        ],
        { type: "image/png" },
      );
      return URL.createObjectURL(blob);
    }
    if (img.url) return img.url;
  }

  throw new Error("No image returned from Venice AI");
}

// ─── Video Mode ───────────────────────────────────────────────────────────────

function VideoMode() {
  const { actor, isReady } = useBackendActor();
  const [selectedModel, setSelectedModel] = useState(VIDEO_MODELS[0].id);
  const [prompt, setPrompt] = useState("");
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [duration, setDuration] = useState(5);
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(
    null,
  );
  const [abortController, setAbortController] =
    useState<AbortController | null>(null);

  const clearPending = useClearPendingWorkflowRunsForProvider();
  const { data: workflowRuns = [] } = useWorkflowRuns("venice-ai-video");
  const hasPending = workflowRuns.some(
    (r) => r.status.__kind__ === "pending" || r.status.__kind__ === "running",
  );

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a video prompt");
      return;
    }

    const ctrl = new AbortController();
    setAbortController(ctrl);
    setIsGenerating(true);
    setGeneratedVideoUrl(null);

    try {
      if (!actor || !isReady) throw new Error("Backend not ready");

      const apiKeyData = await actor.getProviderKey("venice-ai");
      if (!apiKeyData) {
        toast.error("Please save your Venice AI API key first.");
        return;
      }

      const response = await fetch(
        "https://api.venice.ai/api/v1/video/generate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKeyData.key}`,
          },
          body: JSON.stringify({
            model: selectedModel,
            prompt,
            duration,
            aspect_ratio: aspectRatio,
          }),
          signal: ctrl.signal,
        },
      );

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(
          err.error?.message || `Venice AI error: ${response.status}`,
        );
      }

      const data = await response.json();
      if (data.video_url || data.url) {
        setGeneratedVideoUrl(data.video_url || data.url);
        toast.success("Video generated!");
      } else {
        toast.info("Video generation queued — check history for results.");
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        toast.error(
          err.message ||
            "Video generation failed. Check your API key and try again.",
        );
      }
    } finally {
      setIsGenerating(false);
      setAbortController(null);
    }
  };

  const handleCancel = () => {
    abortController?.abort();
    setAbortController(null);
    setIsGenerating(false);
    clearPending.mutate({ provider: "venice-ai-video" });
    toast.info("Generation cancelled");
  };

  const handleDownload = () => {
    if (!generatedVideoUrl) return;
    const a = document.createElement("a");
    a.href = generatedVideoUrl;
    a.download = `venice-video-${Date.now()}.mp4`;
    a.click();
    toast.success("Download started");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Video className="h-4 w-4 text-primary" />
            Video Generation Settings
          </CardTitle>
          <CardDescription>
            Create cinematic videos from text prompts or reference images
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ModelSelect
            models={VIDEO_MODELS}
            value={selectedModel}
            onChange={setSelectedModel}
            data-ocid="venice.model_select.select"
          />

          <div className="space-y-2">
            <Label htmlFor="venice-video-prompt">Video Prompt</Label>
            <Textarea
              id="venice-video-prompt"
              placeholder="Describe the video — camera movement, lighting, subject, action, atmosphere..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              data-ocid="venice.video.prompt.textarea"
            />
          </div>

          <ImageUploadZone
            label="Upload image for image-to-video"
            value={uploadedImage}
            onChange={setUploadedImage}
            data-ocid="venice.video.upload_button"
          />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="venice-duration">Duration (seconds)</Label>
              <Input
                id="venice-duration"
                type="number"
                min={1}
                max={60}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>Aspect Ratio</Label>
              <Select value={aspectRatio} onValueChange={setAspectRatio}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="16:9">16:9 Landscape</SelectItem>
                  <SelectItem value="9:16">9:16 Portrait</SelectItem>
                  <SelectItem value="1:1">1:1 Square</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="flex-1"
              data-ocid="venice.video.primary_button"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Generate Video
                </>
              )}
            </Button>
            {(isGenerating || hasPending) && (
              <Button
                variant="outline"
                onClick={handleCancel}
                data-ocid="venice.video.cancel_button"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <AnimatePresence>
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-lg border border-border bg-card p-6 flex flex-col items-center gap-3"
          >
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              Generating your video...
            </p>
            <p className="text-xs text-muted-foreground/60">
              Video generation may take 1–5 minutes
            </p>
          </motion.div>
        )}

        {generatedVideoUrl && !isGenerating && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Generated Video
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-lg overflow-hidden border border-border bg-black">
                  {/* biome-ignore lint/a11y/useMediaCaption: AI-generated video content */}
                  <video
                    src={generatedVideoUrl}
                    controls
                    className="w-full max-h-[480px]"
                  />
                </div>
                <Button onClick={handleDownload} size="sm" className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Download Video
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Code Mode ────────────────────────────────────────────────────────────────

function CodeMode() {
  const { actor, isReady } = useBackendActor();
  const [selectedModel, setSelectedModel] = useState(CODE_MODELS[0].id);
  const [prompt, setPrompt] = useState("");
  const [language, setLanguage] = useState("Python");
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const codePrompts = [
    "Write a REST API client with error handling and retries",
    "Create a function to parse and validate JSON schemas",
    "Build a simple async task queue",
    "Implement a binary search tree with insert and delete",
    "Write a web scraper with rate limiting",
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a code prompt");
      return;
    }
    if (!isReady) {
      toast.error("Backend not ready");
      return;
    }

    setIsGenerating(true);
    setResult(null);

    try {
      if (!actor) throw new Error("Actor not available");
      const apiKeyData = await actor.getProviderKey("venice-ai");
      if (!apiKeyData) {
        toast.error("Please save your Venice AI API key first.");
        return;
      }

      const fullPrompt = `Write ${language} code for the following: ${prompt}\n\nProvide only the code with inline comments. No markdown fences.`;

      const response = await fetch(
        "https://api.venice.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKeyData.key}`,
          },
          body: JSON.stringify({
            model: selectedModel,
            messages: [{ role: "user", content: fullPrompt }],
            temperature: 0.2,
            venice_parameters: {
              enable_web_search: "never",
              include_venice_system_prompt: false,
            },
          }),
        },
      );

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(
          err.error?.message || `Venice AI error: ${response.status}`,
        );
      }

      const data = await response.json();
      const code = data.choices?.[0]?.message?.content;
      if (!code) throw new Error("No code returned from Venice AI");

      setResult(code);
      toast.success("Code generated!");
    } catch (err: any) {
      toast.error(err.message || "Code generation failed");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Code copied to clipboard");
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Code2 className="h-4 w-4 text-primary" />
            Code Generator
          </CardTitle>
          <CardDescription>
            Generate production-ready code in any language
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ModelSelect
            models={CODE_MODELS}
            value={selectedModel}
            onChange={setSelectedModel}
            data-ocid="venice.model_select.select"
          />

          <div className="space-y-2">
            <Label>Language</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger data-ocid="venice.code.language.select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[
                  "Python",
                  "JavaScript",
                  "TypeScript",
                  "Go",
                  "Rust",
                  "Java",
                  "C#",
                  "Other",
                ].map((l) => (
                  <SelectItem key={l} value={l}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="venice-code-prompt">Code Prompt</Label>
            <Textarea
              id="venice-code-prompt"
              placeholder="Describe the function, class, or module you want to create..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              data-ocid="venice.code.prompt.textarea"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {codePrompts.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPrompt(p)}
                className="text-xs px-2 py-1 rounded border border-border hover:border-primary/50 hover:bg-primary/5 transition-colors text-muted-foreground hover:text-foreground"
              >
                {p}
              </button>
            ))}
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="w-full"
            data-ocid="venice.code.primary_button"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Code2 className="mr-2 h-4 w-4" />
                Generate Code
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    {language} Code
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={handleCopy}>
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted rounded-lg p-4 overflow-x-auto text-sm font-mono text-foreground whitespace-pre-wrap break-words max-h-[500px] overflow-y-auto">
                  {result}
                </pre>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Characters Mode ──────────────────────────────────────────────────────────

function CharactersMode() {
  const { actor, isReady } = useBackendActor();
  const [selectedModel, setSelectedModel] = useState(CHARACTER_MODELS[0].id);
  const [characterName, setCharacterName] = useState("");
  const [personality, setPersonality] = useState("");
  const [scenario, setScenario] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [characterProfile, setCharacterProfile] = useState<{
    name: string;
    personality: string;
    backstory: string;
    quirks: string;
    speakingStyle: string;
  } | null>(null);

  const handleGenerate = async () => {
    if (!characterName.trim()) {
      toast.error("Please enter a character name");
      return;
    }
    if (!personality.trim()) {
      toast.error("Please describe the personality");
      return;
    }
    if (!isReady) {
      toast.error("Backend not ready");
      return;
    }

    setIsGenerating(true);
    setCharacterProfile(null);

    try {
      if (!actor) throw new Error("Actor not available");
      const apiKeyData = await actor.getProviderKey("venice-ai");
      if (!apiKeyData) {
        toast.error("Please save your Venice AI API key first.");
        return;
      }

      const systemPrompt =
        "You are a creative character designer. Generate a detailed AI character profile and return it as JSON.";
      const userPrompt = `Create a detailed character profile for:
Name: ${characterName}
Personality traits: ${personality}
${scenario ? `Scenario/Context: ${scenario}` : ""}

Return JSON with these exact keys: name, personality, backstory, quirks, speakingStyle`;

      const response = await fetch(
        "https://api.venice.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKeyData.key}`,
          },
          body: JSON.stringify({
            model: selectedModel,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            temperature: 0.8,
            venice_parameters: {
              enable_web_search: "never",
              include_venice_system_prompt: false,
            },
          }),
        },
      );

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(
          err.error?.message || `Venice AI error: ${response.status}`,
        );
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) throw new Error("No character data returned");

      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const profile = JSON.parse(jsonMatch[0]);
        setCharacterProfile(profile);
        toast.success("Character created!");
      } else {
        setCharacterProfile({
          name: characterName,
          personality,
          backstory: content,
          quirks: "",
          speakingStyle: "",
        });
        toast.success("Character created!");
      }
    } catch (err: any) {
      toast.error(err.message || "Character generation failed");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            Character Creator
          </CardTitle>
          <CardDescription>
            Design rich AI personas with detailed backstories and personalities
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ModelSelect
            models={CHARACTER_MODELS}
            value={selectedModel}
            onChange={setSelectedModel}
            data-ocid="venice.model_select.select"
          />

          <div className="space-y-2">
            <Label htmlFor="venice-char-name">Character Name</Label>
            <Input
              id="venice-char-name"
              placeholder="e.g. Aria, Director Chen, Professor Malone..."
              value={characterName}
              onChange={(e) => setCharacterName(e.target.value)}
              data-ocid="venice.character.name.input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="venice-char-personality">
              Personality Description
            </Label>
            <Textarea
              id="venice-char-personality"
              placeholder="Describe their traits, values, communication style, strengths, and flaws..."
              value={personality}
              onChange={(e) => setPersonality(e.target.value)}
              rows={3}
              data-ocid="venice.character.personality.textarea"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="venice-char-scenario">Scenario / Context</Label>
            <Textarea
              id="venice-char-scenario"
              placeholder="What role does this character play? What world do they inhabit? What's their purpose?"
              value={scenario}
              onChange={(e) => setScenario(e.target.value)}
              rows={2}
              data-ocid="venice.character.scenario.textarea"
            />
          </div>

          <Button
            onClick={handleGenerate}
            disabled={
              isGenerating || !characterName.trim() || !personality.trim()
            }
            className="w-full"
            data-ocid="venice.character.primary_button"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Character...
              </>
            ) : (
              <>
                <Users className="mr-2 h-4 w-4" />
                Generate Character
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <AnimatePresence>
        {characterProfile && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            <Card className="border-primary/20 bg-gradient-to-b from-primary/5 to-transparent">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-xl font-bold text-primary">
                    {characterProfile.name?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div>
                    <CardTitle>{characterProfile.name}</CardTitle>
                    <CardDescription>AI Character Profile</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: "Personality", value: characterProfile.personality },
                  { label: "Backstory", value: characterProfile.backstory },
                  { label: "Quirks", value: characterProfile.quirks },
                  {
                    label: "Speaking Style",
                    value: characterProfile.speakingStyle,
                  },
                ]
                  .filter((s) => s.value)
                  .map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                        {label}
                      </p>
                      <p className="text-sm text-foreground leading-relaxed">
                        {value}
                      </p>
                    </div>
                  ))}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Venice AI Page ───────────────────────────────────────────────────────────

export default function VeniceAIPage() {
  const [activeMode, setActiveMode] = useState<VeniceMode>("chat");

  const referralLink = (() => {
    try {
      return localStorage.getItem("referral_venice-ai");
    } catch {
      return null;
    }
  })();

  const activeModeDef = VENICE_MODES.find((m) => m.id === activeMode)!;

  return (
    <div className="container mx-auto space-y-6 px-4 py-6 sm:px-6 pb-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4"
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 sm:h-16 sm:w-16 flex-shrink-0">
          <Sparkles className="h-7 w-7 text-primary sm:h-8 sm:w-8" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold sm:text-3xl">Venice AI</h1>
            <Badge variant="outline" className="text-xs">
              Private & Unbiased
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground sm:text-base mt-0.5">
            Private, uncensored AI — text, images, video, code, and characters
            via Venice's permissionless API
          </p>
        </div>
      </motion.div>

      {/* Key Manager */}
      <ProviderKeyManager providerId="venice-ai" providerName="Venice AI" />

      <ProviderActionGuard providerId="venice-ai" providerName="Venice AI">
        {/* Mode Selector */}
        <div className="space-y-4">
          <div className="space-y-1">
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">
              Select Mode
            </Label>
            <div
              className="grid gap-2"
              style={{
                gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
              }}
            >
              {VENICE_MODES.map((mode) => {
                const Icon = mode.icon;
                const isActive = activeMode === mode.id;
                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setActiveMode(mode.id)}
                    data-ocid="venice.mode_select.select"
                    className={`flex flex-col items-center gap-2 rounded-xl border p-3 text-sm font-medium transition-all duration-200 text-center ${
                      isActive
                        ? "border-primary bg-primary/10 text-primary shadow-sm"
                        : "border-border bg-card hover:border-primary/40 hover:bg-primary/5 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-xs leading-tight">{mode.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Mode Description */}
          <motion.div
            key={activeMode}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2 rounded-lg bg-muted/40 border border-border px-4 py-3"
          >
            {(() => {
              const Icon = activeModeDef.icon;
              return <Icon className="h-4 w-4 text-primary flex-shrink-0" />;
            })()}
            <div>
              <span className="font-medium text-sm">{activeModeDef.label}</span>
              <span className="text-muted-foreground text-sm ml-2">
                — {activeModeDef.description}
              </span>
            </div>
          </motion.div>

          {/* Mode Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeMode}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {activeMode === "chat" && <ChatMode />}
              {activeMode === "image" && <ImageMode />}
              {activeMode === "video" && <VideoMode />}
              {activeMode === "code" && <CodeMode />}
              {activeMode === "characters" && <CharactersMode />}
            </motion.div>
          </AnimatePresence>
        </div>
      </ProviderActionGuard>

      {/* Referral Link */}
      {referralLink && (
        <div className="rounded-xl border border-border bg-card p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            <span className="font-medium text-sm">
              Don't have a Venice AI key yet?
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Get your own Venice AI API key and use it here for free inference
            without being charged.
          </p>
          <Button
            variant="outline"
            size="sm"
            asChild
            data-ocid="venice.referral.link"
          >
            <a href={referralLink} target="_blank" rel="noopener noreferrer">
              Get Venice AI API Key <ExternalLink className="ml-2 h-3 w-3" />
            </a>
          </Button>
        </div>
      )}
    </div>
  );
}
