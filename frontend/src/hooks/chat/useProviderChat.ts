import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useBackendActor } from '../useBackendActor';
import { getUserFriendlyErrorMessage, sanitizeErrorForLogging } from '@/utils/backendErrorMessages';
import type { ChatMessage } from '@/backend';

export function useProviderChat(provider: string) {
  const { actor, isConnecting, isReady } = useBackendActor();
  const queryClient = useQueryClient();

  const messagesQuery = useQuery<ChatMessage[]>({
    queryKey: ['chatMessages', provider],
    queryFn: async () => {
      if (!actor) {
        throw new Error('Backend connection not ready');
      }
      return actor.streamChatMessages(provider, BigInt(100));
    },
    enabled: isReady && !!actor,
    retry: false,
  });

  const sendMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!actor || !isReady) {
        throw new Error('Still connecting to the backend. Please try again in a moment.');
      }
      
      try {
        await actor.addChatMessage(provider, content);
      } catch (error) {
        // Log the full error for debugging
        console.error('Send chat message error:', sanitizeErrorForLogging(error));
        
        // Throw user-friendly error
        const friendlyMessage = getUserFriendlyErrorMessage(error, true);
        throw new Error(friendlyMessage);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatMessages', provider] });
    },
  });

  return {
    messages: messagesQuery.data || [],
    isLoading: messagesQuery.isLoading || isConnecting,
    isReady,
    sendMessage: sendMutation.mutate,
    isSending: sendMutation.isPending,
    error: messagesQuery.error || sendMutation.error,
  };
}
