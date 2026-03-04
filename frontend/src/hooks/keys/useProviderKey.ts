import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useBackendActor } from '../useBackendActor';
import { getUserFriendlyErrorMessage, sanitizeErrorForLogging } from '@/utils/backendErrorMessages';

export function useProviderKey(provider: string) {
  const { actor, isConnecting, isReady } = useBackendActor();

  return useQuery<boolean>({
    queryKey: ['providerKey', provider],
    queryFn: async () => {
      if (!actor) {
        throw new Error('Backend connection not ready. Please wait a moment and try again.');
      }
      return actor.providerKeyExists(provider);
    },
    enabled: isReady && !!actor,
    retry: false,
  });
}

export function useSaveProviderKey() {
  const { actor, isReady } = useBackendActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ provider, key }: { provider: string; key: string }) => {
      if (!actor || !isReady) {
        throw new Error('Still connecting to the backend. Please try again in a moment.');
      }
      
      try {
        await actor.addOrUpdateAPIKey(provider, key);
      } catch (error) {
        // Log the full error for debugging
        console.error('Save API key error:', sanitizeErrorForLogging(error));
        
        // Throw user-friendly error
        const friendlyMessage = getUserFriendlyErrorMessage(error, true);
        throw new Error(friendlyMessage);
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['providerKey', variables.provider] });
    },
  });
}
