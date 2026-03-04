import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../useActor';
import type { CustomProviderMetadata } from '@/backend';

export function useCustomProviderMetadata(providerKey: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<CustomProviderMetadata | null>({
    queryKey: ['customProviderMetadata', providerKey],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCustomProviderMetadata(providerKey);
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useSaveCustomProviderMetadata() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ providerKey, displayName }: { providerKey: string; displayName: string }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.setCustomProviderMetadata(providerKey, displayName);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customProviderMetadata', variables.providerKey] });
      queryClient.invalidateQueries({ queryKey: ['customProviderMetadata'] });
    },
  });
}
