import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useBackendActor } from '../useBackendActor';
import { getUserFriendlyErrorMessage, sanitizeErrorForLogging } from '@/utils/backendErrorMessages';

interface CancelWorkflowRunParams {
  runId: string;
  provider: string;
}

export function useCancelWorkflowRun() {
  const { actor, isReady } = useBackendActor();
  const queryClient = useQueryClient();

  return useMutation<void, Error, CancelWorkflowRunParams>({
    mutationFn: async ({ runId }) => {
      if (!actor || !isReady) {
        throw new Error('Backend is not ready. Please wait a moment and try again.');
      }

      await actor.cancelWorkflowRun(runId);
    },
    onSuccess: (_, variables) => {
      // Invalidate and refetch workflow runs for this provider
      queryClient.invalidateQueries({ queryKey: ['workflowRuns', variables.provider] });
    },
    onError: (error) => {
      console.error('Cancel workflow run error:', sanitizeErrorForLogging(error));
    },
  });
}
