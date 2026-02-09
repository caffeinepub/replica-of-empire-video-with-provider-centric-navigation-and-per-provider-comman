import { getProviderById } from '@/providers/providers';
import { useCustomProviderMetadata } from './useCustomProviderMetadata';

export function useResolvedProviderDisplayName(providerId: string): string {
  const provider = getProviderById(providerId);
  const { data: metadata } = useCustomProviderMetadata(providerId);

  if (!provider) return providerId;

  if (provider.isCustomSlot && metadata?.displayName) {
    return metadata.displayName;
  }

  return provider.displayName;
}
