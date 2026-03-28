import type { WorkflowRun } from "@/backend";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { GenerationHistory } from "@/components/workflows/GenerationHistory";
import { ResultsPanel } from "@/components/workflows/ResultsPanel";
import { useClearPendingWorkflowRunsForProvider } from "@/hooks/workflows/useClearPendingWorkflowRunsForProvider";
import { useImageGeneration } from "@/hooks/workflows/useImageGeneration";
import { useVideoGeneration } from "@/hooks/workflows/useVideoGeneration";
import { useWorkflowExecution } from "@/hooks/workflows/useWorkflowExecution";
import { useWorkflowRuns } from "@/hooks/workflows/useWorkflowRuns";
import type { OptionField, WorkflowType } from "@/providers/providers";
import { History, Loader2, Play } from "lucide-react";
import { useEffect, useState } from "react";

interface ProviderToolsOptionsSectionProps {
  provider: string;
  workflowType?: WorkflowType;
  optionFields?: OptionField[];
}

export function ProviderToolsOptionsSection({
  provider,
  workflowType = "custom",
  optionFields = [],
}: ProviderToolsOptionsSectionProps) {
  const [formData, setFormData] = useState<Record<string, string | number>>({});
  const [activeTab, setActiveTab] = useState<string>("workflow");
  const [localLatestRun, setLocalLatestRun] = useState<WorkflowRun | null>(
    null,
  );

  const executeWorkflowMutation = useWorkflowExecution();
  const clearPendingMutation = useClearPendingWorkflowRunsForProvider();
  const { data: workflowRuns = [], isLoading: runsLoading } =
    useWorkflowRuns(provider);
  const { generateImageForRun, isGenerating: isGeneratingImage } =
    useImageGeneration({
      provider,
      onSuccess: () => {},
      onError: () => {},
    });
  const { generateVideoForRun, isGenerating: isGeneratingVideo } =
    useVideoGeneration({
      provider,
      onSuccess: () => {},
      onError: () => {},
    });

  const isGenerating = isGeneratingImage || isGeneratingVideo;

  const latestRun = workflowRuns[0];
  const historyRuns = workflowRuns.slice(1);

  useEffect(() => {
    const initialData: Record<string, string | number> = {};
    for (const field of optionFields ?? []) {
      if (field.defaultValue !== undefined) {
        initialData[field.id] = field.defaultValue;
      }
    }
    setFormData(initialData);
  }, [optionFields]);

  const handleFieldChange = (fieldId: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleExecute = async () => {
    const run = await executeWorkflowMutation.mutateAsync({
      provider,
      workflowType,
      inputs: formData,
    });

    if (workflowType === "image-generation") {
      const finalRun = await generateImageForRun(run, formData);
      if (finalRun) setLocalLatestRun(finalRun);
    } else if (workflowType === "video-generation") {
      const finalRun = await generateVideoForRun(run, formData);
      if (finalRun) setLocalLatestRun(finalRun);
    }
  };

  const handleClear = async () => {
    await clearPendingMutation.mutateAsync({ provider });
  };

  const renderField = (field: OptionField) => {
    const value = formData[field.id] ?? "";

    switch (field.type) {
      case "text":
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>{field.label}</Label>
            <Input
              id={field.id}
              placeholder={field.placeholder}
              value={value as string}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
            />
          </div>
        );

      case "textarea":
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>{field.label}</Label>
            <Textarea
              id={field.id}
              placeholder={field.placeholder}
              value={value as string}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              rows={4}
            />
          </div>
        );

      case "select":
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>{field.label}</Label>
            <Select
              value={value as string}
              onValueChange={(val) => handleFieldChange(field.id, val)}
            >
              <SelectTrigger id={field.id}>
                <SelectValue
                  placeholder={`Select ${field.label.toLowerCase()}`}
                />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case "number":
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>{field.label}</Label>
            <Input
              id={field.id}
              type="number"
              placeholder={field.placeholder}
              value={value as number}
              onChange={(e) =>
                handleFieldChange(
                  field.id,
                  Number.parseFloat(e.target.value) || 0,
                )
              }
            />
          </div>
        );

      default:
        return null;
    }
  };

  const isImageGeneration = workflowType === "image-generation";
  const isVideoGeneration = workflowType === "video-generation";

  const executeLabel = isImageGeneration
    ? "Generate Image"
    : isVideoGeneration
      ? "Generate Video"
      : "Execute Workflow";

  const executingLabel = isImageGeneration
    ? "Generating Image..."
    : isVideoGeneration
      ? "Generating Video..."
      : "Executing...";

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="workflow">
          <Play className="mr-2 h-4 w-4" />
          {isImageGeneration
            ? "Generate"
            : isVideoGeneration
              ? "Generate"
              : "Workflow"}
        </TabsTrigger>
        <TabsTrigger value="history">
          <History className="mr-2 h-4 w-4" />
          History
        </TabsTrigger>
      </TabsList>

      <TabsContent value="workflow" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>
              {isImageGeneration
                ? "Image Generation"
                : isVideoGeneration
                  ? "Video Generation"
                  : "Workflow Options"}
            </CardTitle>
            <CardDescription>
              {isImageGeneration
                ? "Enter a prompt and generate an image"
                : isVideoGeneration
                  ? "Enter a prompt and generate a video"
                  : "Configure and execute workflows"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {optionFields?.map(renderField)}

            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleExecute}
                disabled={isGenerating || executeWorkflowMutation.isPending}
                className="flex-1"
                data-ocid="workflow.primary_button"
              >
                {isGenerating || executeWorkflowMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {executingLabel}
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    {executeLabel}
                  </>
                )}
              </Button>
              {workflowRuns.length > 0 && (
                <Button
                  variant="outline"
                  onClick={handleClear}
                  disabled={clearPendingMutation.isPending}
                  data-ocid="workflow.secondary_button"
                >
                  Clear
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Always-visible results area */}
        <ResultsPanel
          run={localLatestRun ?? latestRun ?? null}
          provider={provider}
          workflowType={workflowType}
          isGenerating={isGenerating || executeWorkflowMutation.isPending}
        />
      </TabsContent>

      <TabsContent value="history">
        {runsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : historyRuns.length > 0 ? (
          <GenerationHistory
            runs={historyRuns}
            provider={provider}
            workflowType={workflowType}
          />
        ) : (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No workflow history yet. Execute a workflow to see results here.
            </CardContent>
          </Card>
        )}
      </TabsContent>
    </Tabs>
  );
}
