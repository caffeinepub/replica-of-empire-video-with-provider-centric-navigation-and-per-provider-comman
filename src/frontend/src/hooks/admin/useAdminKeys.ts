import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useBackendActor } from "../useBackendActor";

// These new methods are added to the backend but not yet in the generated
// TypeScript bindings — we cast actor to include them.
interface AdminActor {
  setAdminAPIKey(provider: string, key: string): Promise<void>;
  adminAPIKeyExists(provider: string): Promise<boolean>;
  deleteAdminAPIKey(provider: string): Promise<void>;
  getAllAdminAPIKeyProviders(): Promise<string[]>;
  setGitHubClientId(clientId: string): Promise<void>;
  getGitHubClientId(): Promise<string>;
  setReferralLink(provider: string, url: string): Promise<void>;
  getReferralLink(provider: string): Promise<string | null>;
  getAllReferralLinks(): Promise<Array<[string, string]>>;
  hasEffectiveProviderKey(provider: string): Promise<boolean>;
}

function asAdmin(actor: unknown): AdminActor {
  return actor as AdminActor;
}

export function useAllAdminAPIKeyProviders() {
  const { actor, isReady } = useBackendActor();
  return useQuery<string[]>({
    queryKey: ["adminAPIKeyProviders"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await asAdmin(actor).getAllAdminAPIKeyProviders();
      } catch {
        return [];
      }
    },
    enabled: isReady && !!actor,
    retry: false,
  });
}

export function useSetAdminAPIKey() {
  const { actor, isReady } = useBackendActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      provider,
      key,
    }: { provider: string; key: string }) => {
      if (!actor || !isReady) throw new Error("Backend not ready");
      await asAdmin(actor).setAdminAPIKey(provider, key);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminAPIKeyProviders"] });
    },
  });
}

export function useDeleteAdminAPIKey() {
  const { actor, isReady } = useBackendActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (provider: string) => {
      if (!actor || !isReady) throw new Error("Backend not ready");
      await asAdmin(actor).deleteAdminAPIKey(provider);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminAPIKeyProviders"] });
    },
  });
}

export function useGitHubClientId() {
  const { actor, isReady } = useBackendActor();
  return useQuery<string>({
    queryKey: ["githubClientId"],
    queryFn: async () => {
      if (!actor) return "";
      try {
        return await asAdmin(actor).getGitHubClientId();
      } catch {
        return "";
      }
    },
    enabled: isReady && !!actor,
    retry: false,
  });
}

export function useSetGitHubClientId() {
  const { actor, isReady } = useBackendActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (clientId: string) => {
      if (!actor || !isReady) throw new Error("Backend not ready");
      await asAdmin(actor).setGitHubClientId(clientId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["githubClientId"] });
    },
  });
}

export function useAllReferralLinks() {
  const { actor, isReady } = useBackendActor();
  return useQuery<Array<[string, string]>>({
    queryKey: ["allReferralLinks"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await asAdmin(actor).getAllReferralLinks();
      } catch {
        return [];
      }
    },
    enabled: isReady && !!actor,
    retry: false,
  });
}

export function useSetReferralLink() {
  const { actor, isReady } = useBackendActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      provider,
      url,
    }: { provider: string; url: string }) => {
      if (!actor || !isReady) throw new Error("Backend not ready");
      await asAdmin(actor).setReferralLink(provider, url);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allReferralLinks"] });
    },
  });
}

export function useHasEffectiveProviderKey(provider: string) {
  const { actor, isReady } = useBackendActor();
  return useQuery<boolean>({
    queryKey: ["hasEffectiveProviderKey", provider],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await asAdmin(actor).hasEffectiveProviderKey(provider);
      } catch {
        return false;
      }
    },
    enabled: isReady && !!actor,
    retry: false,
  });
}
