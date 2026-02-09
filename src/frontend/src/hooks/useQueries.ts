import { useQuery } from '@tanstack/react-query';
import { useBackendActor } from './useBackendActor';
import type { UserProfile } from '@/backend';

export function useGetCallerUserProfile() {
  const { actor, isConnecting, isReady } = useBackendActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) {
        throw new Error('Backend connection not ready');
      }
      return actor.getCallerUserProfile();
    },
    enabled: isReady && !!actor,
    retry: false,
  });

  return {
    ...query,
    isLoading: isConnecting || query.isLoading,
    isFetched: isReady && query.isFetched,
  };
}

export function useIsCallerAdmin() {
  const { actor, isConnecting, isReady } = useBackendActor();

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: isReady && !!actor,
    retry: false,
  });
}
