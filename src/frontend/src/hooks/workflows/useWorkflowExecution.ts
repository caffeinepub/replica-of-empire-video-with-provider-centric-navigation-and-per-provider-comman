import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useBackendActor } from '../useBackendActor';
import { getUserFriendlyErrorMessage, sanitizeErrorForLogging } from '@/utils/backendErrorMessages';
import type { WorkflowRun } from '@/backend';

interface ExecuteWorkflowParams {
  provider: string;
  workflowType: string;
  inputs: Record<string, any>;
}

export function useWorkflowExecution() {
  const { actor, isReady } = useBackendActor();
  const queryClient = useQueryClient();

  return useMutation<WorkflowRun, Error, ExecuteWorkflowParams>({
    mutationFn: async ({ provider, workflowType, inputs }) => {
      if (!actor || !isReady) {
        throw new Error('Backend is not ready. Please wait a moment and try again.');
      }

      const inputsJson = JSON.stringify(inputs);
      const run = await actor.executeWorkflow(provider, workflowType, inputsJson);
      return run;
    },
    onSuccess: (_, variables) => {
      // Invalidate workflow runs for this provider
      queryClient.invalidateQueries({ queryKey: ['workflowRuns', variables.provider] });
    },
    onError: (error) => {
      console.error('Workflow execution failed:', sanitizeErrorForLogging(error));
    },
  });
}

export function useWorkflowRunUpdate() {
  const { actor, isReady } = useBackendActor();
  const queryClient = useQueryClient();

  interface UpdateParams {
    runId: string;
    provider: string;
    status: WorkflowRun['status'];
    outputBlobId?: string;
    durationNanos?: bigint;
  }

  return useMutation<WorkflowRun, Error, UpdateParams>({
    mutationFn: async ({ runId, status, outputBlobId, durationNanos }) => {
      if (!actor || !isReady) {
        throw new Error('Backend is not ready. Please wait a moment and try again.');
      }

      return await actor.updateWorkflowRun(
        runId,
        status,
        outputBlobId || null,
        durationNanos || null
      );
    },
    onSuccess: (_, variables) => {
      // Invalidate workflow runs for this provider
      queryClient.invalidateQueries({ queryKey: ['workflowRuns', variables.provider] });
    },
    onError: (error) => {
      console.error('Workflow run update failed:', sanitizeErrorForLogging(error));
    },
  });
}
