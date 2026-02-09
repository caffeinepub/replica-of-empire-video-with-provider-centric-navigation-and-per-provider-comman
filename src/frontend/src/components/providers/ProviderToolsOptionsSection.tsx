import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Video, Image, Wrench, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { WorkflowType, OptionField } from '@/providers/providers';
import type { WorkflowRun } from '@/backend';
import { useWorkflowExecution } from '@/hooks/workflows/useWorkflowExecution';
import { useWorkflowRuns } from '@/hooks/workflows/useWorkflowRuns';
import { useBackendActor } from '@/hooks/useBackendActor';
import GenerationResult from '@/components/workflows/GenerationResult';
import ExecutionResultPanel from '@/components/workflows/ExecutionResultPanel';
import GenerationHistory from '@/components/workflows/GenerationHistory';
import { getUserFriendlyErrorMessage } from '@/utils/backendErrorMessages';

interface ProviderToolsOptionsSectionProps {
  providerId: string;
  providerName: string;
  workflowType: WorkflowType;
  optionFields?: OptionField[];
}

export default function ProviderToolsOptionsSection({
  providerId,
  providerName,
  workflowType,
  optionFields = [],
}: ProviderToolsOptionsSectionProps) {
  const { isReady, isConnecting } = useBackendActor();
  const executeWorkflow = useWorkflowExecution();
  const { data: runs = [], isLoading: runsLoading } = useWorkflowRuns(providerId);

  const [formValues, setFormValues] = useState<Record<string, string | number>>(() => {
    const initial: Record<string, string | number> = {};
    optionFields.forEach((field) => {
      if (field.defaultValue !== undefined) {
        initial[field.id] = field.defaultValue;
      }
    });
    return initial;
  });

  const [currentRun, setCurrentRun] = useState<WorkflowRun | null>(null);

  // Update current run when runs change
  useEffect(() => {
    if (currentRun && runs.length > 0) {
      const updated = runs.find(r => r.id === currentRun.id);
      if (updated) {
        setCurrentRun(updated);
      }
    }
  }, [runs, currentRun]);

  const handleFieldChange = (fieldId: string, value: string | number) => {
    setFormValues((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleExecute = async () => {
    if (!isReady) {
      toast.error('Backend is not ready. Please wait a moment.');
      return;
    }

    try {
      const run = await executeWorkflow.mutateAsync({
        provider: providerId,
        workflowType,
        inputs: formValues,
      });
      
      setCurrentRun(run);
      toast.success('Workflow started successfully');
    } catch (error: any) {
      const message = getUserFriendlyErrorMessage(error);
      toast.error(message);
    }
  };

  const handleReuseRun = (run: WorkflowRun) => {
    try {
      const inputs = JSON.parse(run.inputs);
      setFormValues(inputs);
      toast.success('Parameters loaded');
    } catch (e) {
      toast.error('Failed to load parameters');
    }
  };

  const renderField = (field: OptionField) => {
    const value = formValues[field.id] || '';

    switch (field.type) {
      case 'text':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>{field.label}</Label>
            <Input
              id={field.id}
              type="text"
              placeholder={field.placeholder}
              value={value as string}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
            />
          </div>
        );

      case 'textarea':
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

      case 'select':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>{field.label}</Label>
            <Select
              value={value as string}
              onValueChange={(val) => handleFieldChange(field.id, val)}
            >
              <SelectTrigger id={field.id}>
                <SelectValue placeholder={field.placeholder || 'Select...'} />
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

      case 'number':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>{field.label}</Label>
            <Input
              id={field.id}
              type="number"
              placeholder={field.placeholder}
              value={value as number}
              onChange={(e) => handleFieldChange(field.id, parseFloat(e.target.value) || 0)}
            />
          </div>
        );

      default:
        return null;
    }
  };

  const getCardIcon = () => {
    switch (workflowType) {
      case 'video-generation':
        return <Video className="h-5 w-5" />;
      case 'image-generation':
        return <Image className="h-5 w-5" />;
      default:
        return <Wrench className="h-5 w-5" />;
    }
  };

  const getCardTitle = () => {
    switch (workflowType) {
      case 'video-generation':
        return 'Video Generation';
      case 'image-generation':
        return 'Image Generation';
      case 'integration':
        return 'Integration Tools';
      case 'app-builder':
        return 'App Builder';
      case 'custom':
        return 'Custom Workflow';
      default:
        return 'Workflow Tools';
    }
  };

  const getCardDescription = () => {
    switch (workflowType) {
      case 'video-generation':
        return `Create videos with ${providerName}`;
      case 'image-generation':
        return `Create images with ${providerName}`;
      case 'integration':
        return `Execute ${providerName} integration workflows`;
      case 'app-builder':
        return `Build applications with ${providerName}`;
      case 'custom':
        return `Execute custom workflows with ${providerName}`;
      default:
        return `Execute workflows with ${providerName}`;
    }
  };

  const isExecuting = executeWorkflow.isPending || 
    (currentRun && (currentRun.status.__kind__ === 'pending' || currentRun.status.__kind__ === 'running'));

  const canExecute = isReady && !isExecuting;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getCardIcon()}
            {getCardTitle()}
          </CardTitle>
          <CardDescription>{getCardDescription()}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Connection status */}
          {isConnecting && (
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription>Connecting to backend...</AlertDescription>
            </Alert>
          )}

          {!isReady && !isConnecting && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Backend is not available. Please check your connection and try again.
              </AlertDescription>
            </Alert>
          )}

          {/* Option fields */}
          {optionFields.map((field) => renderField(field))}

          {/* Execute button */}
          <Button
            onClick={handleExecute}
            disabled={!canExecute}
            className="w-full"
          >
            {isExecuting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                {getCardIcon()}
                <span className="ml-2">
                  {workflowType === 'image-generation' && 'Generate Image'}
                  {workflowType === 'video-generation' && 'Generate Video'}
                  {workflowType === 'integration' && 'Execute Integration'}
                  {workflowType === 'app-builder' && 'Build App'}
                  {workflowType === 'custom' && 'Execute Workflow'}
                  {workflowType === 'chat' && 'Start Chat'}
                </span>
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Current run result */}
      {currentRun && (
        <div className="space-y-4">
          {(workflowType === 'image-generation' || workflowType === 'video-generation') ? (
            <GenerationResult run={currentRun} onReuse={() => handleReuseRun(currentRun)} />
          ) : (
            <ExecutionResultPanel run={currentRun} onReuse={() => handleReuseRun(currentRun)} />
          )}
        </div>
      )}

      {/* History for image/video workflows */}
      {(workflowType === 'image-generation' || workflowType === 'video-generation') && (
        <GenerationHistory
          runs={runs}
          onReuseRun={handleReuseRun}
          isLoading={runsLoading}
        />
      )}
    </div>
  );
}
