import { useInternetIdentity } from './useInternetIdentity';
import { useQuery } from '@tanstack/react-query';
import { type backendInterface } from '../backend';
import { createActorWithConfig } from '../config';
import { getSecretParameter } from '../utils/urlParams';

export interface BackendActorState {
  actor: backendInterface | null;
  isConnecting: boolean;
  isReady: boolean;
  error: Error | null;
  retry: () => void;
}

const BACKEND_ACTOR_QUERY_KEY = 'backendActor';

export function useBackendActor(): BackendActorState {
  const { identity, isInitializing } = useInternetIdentity();

  const actorQuery = useQuery<backendInterface>({
    queryKey: [BACKEND_ACTOR_QUERY_KEY, identity?.getPrincipal().toString()],
    queryFn: async () => {
      const isAuthenticated = !!identity;

      if (!isAuthenticated) {
        // Return anonymous actor if not authenticated
        return await createActorWithConfig();
      }

      const actorOptions = {
        agentOptions: {
          identity
        }
      };

      const actor = await createActorWithConfig(actorOptions);
      
      // Only initialize with admin token if one is actually present
      const adminToken = getSecretParameter('caffeineAdminToken');
      if (adminToken && adminToken.trim().length > 0) {
        await actor._initializeAccessControlWithSecret(adminToken);
      }
      
      return actor;
    },
    staleTime: Infinity,
    enabled: !isInitializing,
    retry: 2,
    retryDelay: 1000,
  });

  return {
    actor: actorQuery.data || null,
    isConnecting: actorQuery.isLoading || actorQuery.isFetching || isInitializing,
    isReady: !!actorQuery.data && !actorQuery.isLoading && !actorQuery.isFetching,
    error: actorQuery.error as Error | null,
    retry: () => actorQuery.refetch(),
  };
}
