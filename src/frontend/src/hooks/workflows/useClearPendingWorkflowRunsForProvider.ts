import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useBackendActor } from '../useBackendActor';
import { getUserFriendlyErrorMessage, sanitizeErrorForLogging } from '@/utils/backendErrorMessages';

interface ClearPendingParams {
  provider: string;
}

export function useClearPendingWorkflowRunsForProvider() {
  const { actor, isReady } = useBackendActor();
  const queryClient = useQueryClient();

  return useMutation<void, Error, ClearPendingParams>({
    mutationFn: async ({ provider }) => {
      if (!actor || !isReady) {
        throw new Error('Backend is not ready. Please wait a moment and try again.');
      }

      await actor.cancelPendingWorkflowRunsForProvider(provider);
    },
    onSuccess: (_, variables) => {
      // Invalidate and refetch workflow runs for this provider
      queryClient.invalidateQueries({ queryKey: ['workflowRuns', variables.provider] });
    },
    onError: (error) => {
      console.error('Clear pending runs error:', sanitizeErrorForLogging(error));
    },
  });
}
