import { useQuery } from '@tanstack/react-query';
import { useBackendActor } from '../useBackendActor';
import type { WorkflowRun } from '@/backend';

export function useWorkflowRuns(provider: string) {
  const { actor, isReady, isConnecting } = useBackendActor();

  return useQuery<WorkflowRun[]>({
    queryKey: ['workflowRuns', provider],
    queryFn: async () => {
      if (!actor) {
        throw new Error('Actor not available');
      }
      return await actor.getWorkflowRuns(provider);
    },
    enabled: !!actor && isReady && !isConnecting,
    refetchInterval: (query) => {
      // Poll every 3 seconds if there are any pending/running runs
      const data = query.state.data;
      if (data && data.some(run => 
        run.status.__kind__ === 'pending' || run.status.__kind__ === 'running'
      )) {
        return 3000;
      }
      return false;
    },
  });
}
