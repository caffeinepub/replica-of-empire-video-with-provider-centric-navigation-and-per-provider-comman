import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Video, Image, Wrench, Loader2, AlertCircle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { WorkflowType, OptionField } from '@/providers/providers';
import type { WorkflowRun } from '@/backend';
import { useWorkflowExecution } from '@/hooks/workflows/useWorkflowExecution';
import { useWorkflowRuns } from '@/hooks/workflows/useWorkflowRuns';
import { useImageGeneration } from '@/hooks/workflows/useImageGeneration';
import { useClearPendingWorkflowRunsForProvider } from '@/hooks/workflows/useClearPendingWorkflowRunsForProvider';
import { GenerationResult } from '@/components/workflows/GenerationResult';
import ExecutionResultPanel from '@/components/workflows/ExecutionResultPanel';
import { GenerationHistory } from '@/components/workflows/GenerationHistory';

interface ProviderToolsOptionsSectionProps {
  provider: string;
  workflowType?: WorkflowType;
  optionFields?: OptionField[];
}

export function ProviderToolsOptionsSection({
  provider,
  workflowType = 'custom',
  optionFields = [],
}: ProviderToolsOptionsSectionProps) {
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const executeWorkflow = useWorkflowExecution();
  const { data: workflowRuns = [], isLoading: runsLoading } = useWorkflowRuns(provider);
  const clearPendingRuns = useClearPendingWorkflowRunsForProvider();
  const { generateImageForRun, isGenerating } = useImageGeneration({ provider });

  // Initialize form with default values
  useEffect(() => {
    const defaults: Record<string, any> = {};
    optionFields.forEach((field) => {
      if (field.defaultValue !== undefined) {
        defaults[field.id] = field.defaultValue;
      }
    });
    setFormValues(defaults);
  }, [optionFields]);

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormValues((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleExecute = async () => {
    try {
      // Validate required fields
      const missingFields = optionFields
        .filter((field) => !formValues[field.id] && field.type !== 'number')
        .map((field) => field.label);

      if (missingFields.length > 0) {
        toast.error(`Please fill in: ${missingFields.join(', ')}`);
        return;
      }

      // Create workflow run
      const run = await executeWorkflow.mutateAsync({
        provider,
        workflowType,
        inputs: formValues,
      });

      // For image generation workflows, automatically start generation
      if (workflowType === 'image-generation') {
        await generateImageForRun(run, formValues);
      } else {
        toast.success('Workflow started successfully!');
      }
    } catch (error: any) {
      console.error('Workflow execution error:', error);
      toast.error(error.message || 'Failed to execute workflow');
    }
  };

  const handleClearPending = async () => {
    try {
      await clearPendingRuns.mutateAsync({ provider });
      toast.success('Pending generations cleared');
    } catch (error: any) {
      console.error('Clear pending error:', error);
      toast.error(error.message || 'Failed to clear pending generations');
    }
  };

  const getIcon = () => {
    switch (workflowType) {
      case 'video-generation':
        return <Video className="h-5 w-5" />;
      case 'image-generation':
        return <Image className="h-5 w-5" />;
      default:
        return <Wrench className="h-5 w-5" />;
    }
  };

  const getTitle = () => {
    switch (workflowType) {
      case 'video-generation':
        return 'Video Generation';
      case 'image-generation':
        return 'Image Generation';
      case 'integration':
        return 'Integration Tools';
      case 'app-builder':
        return 'App Builder';
      default:
        return 'Workflow Tools';
    }
  };

  const getDescription = () => {
    switch (workflowType) {
      case 'video-generation':
        return 'Configure and generate videos using AI models';
      case 'image-generation':
        return 'Configure and generate images using AI models';
      case 'integration':
        return 'Configure integration settings and execute actions';
      case 'app-builder':
        return 'Build and deploy applications';
      default:
        return 'Configure and execute custom workflows';
    }
  };

  // Get the most recent run
  const latestRun = workflowRuns.length > 0 ? workflowRuns[0] : null;
  const isArtifactWorkflow = workflowType === 'image-generation' || workflowType === 'video-generation';

  // Check if there are any pending/running runs
  const hasPendingRuns = workflowRuns.some(
    (run) => run.status.__kind__ === 'pending' || run.status.__kind__ === 'running'
  );

  const isExecuting = executeWorkflow.isPending || isGenerating;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            {getIcon()}
            <CardTitle>{getTitle()}</CardTitle>
          </div>
          <CardDescription>{getDescription()}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {optionFields.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No workflow options configured for this provider yet.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              {optionFields.map((field) => (
                <div key={field.id} className="space-y-2">
                  <Label htmlFor={field.id}>{field.label}</Label>
                  {field.type === 'text' && (
                    <Input
                      id={field.id}
                      placeholder={field.placeholder}
                      value={formValues[field.id] || ''}
                      onChange={(e) => handleFieldChange(field.id, e.target.value)}
                    />
                  )}
                  {field.type === 'textarea' && (
                    <Textarea
                      id={field.id}
                      placeholder={field.placeholder}
                      value={formValues[field.id] || ''}
                      onChange={(e) => handleFieldChange(field.id, e.target.value)}
                      rows={4}
                    />
                  )}
                  {field.type === 'number' && (
                    <Input
                      id={field.id}
                      type="number"
                      placeholder={field.placeholder}
                      value={formValues[field.id] ?? field.defaultValue ?? ''}
                      onChange={(e) => handleFieldChange(field.id, parseFloat(e.target.value))}
                    />
                  )}
                  {field.type === 'select' && field.options && (
                    <Select
                      value={formValues[field.id] || field.defaultValue}
                      onValueChange={(value) => handleFieldChange(field.id, value)}
                    >
                      <SelectTrigger id={field.id}>
                        <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              ))}

              <Button
                onClick={handleExecute}
                disabled={isExecuting}
                className="w-full"
              >
                {isExecuting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {workflowType === 'image-generation' ? 'Generating...' : 'Executing...'}
                  </>
                ) : (
                  <>
                    {getIcon()}
                    <span className="ml-2">
                      {workflowType === 'image-generation' ? 'Generate Image' : 
                       workflowType === 'video-generation' ? 'Generate Video' : 'Execute'}
                    </span>
                  </>
                )}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Current Generation Result */}
      {latestRun && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Current Generation</h3>
          </div>
          {isArtifactWorkflow ? (
            <GenerationResult run={latestRun} provider={provider} workflowType={workflowType} />
          ) : (
            <ExecutionResultPanel run={latestRun} />
          )}
        </div>
      )}

      {/* Generation History */}
      {workflowRuns.length > 1 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">History</h3>
            {provider === 'fal-ai' && hasPendingRuns && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearPending}
                disabled={clearPendingRuns.isPending}
              >
                {clearPendingRuns.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                    Clearing...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-3 w-3" />
                    Clear Pending
                  </>
                )}
              </Button>
            )}
          </div>
          {isArtifactWorkflow ? (
            <GenerationHistory
              runs={workflowRuns.slice(1)}
              provider={provider}
              workflowType={workflowType}
            />
          ) : (
            <div className="space-y-2">
              {workflowRuns.slice(1).map((run) => (
                <ExecutionResultPanel key={run.id} run={run} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
