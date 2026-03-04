import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useBackendActor } from '../useBackendActor';
import type { Link } from '@/backend';
import { toast } from 'sonner';

export function useGetAllLinks() {
  const { actor, isConnecting, isReady } = useBackendActor();

  return useQuery<Link[]>({
    queryKey: ['links'],
    queryFn: async () => {
      if (!actor) {
        throw new Error('Backend connection not ready');
      }
      return actor.getAllLinks();
    },
    enabled: isReady && !!actor,
    retry: 1,
  });
}

export function useAddLink() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (link: Link) => {
      if (!actor) {
        throw new Error('Backend connection not ready. Please wait a moment and try again.');
      }
      return actor.addLink(link);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links'] });
      toast.success('Link saved successfully');
    },
    onError: (error: any) => {
      console.error('Failed to add link:', error);
      const message = error?.message || 'Failed to save link. Please try again.';
      toast.error(message);
    },
  });
}

export function useUpdateLink() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ index, link }: { index: number; link: Link }) => {
      if (!actor) {
        throw new Error('Backend connection not ready. Please wait a moment and try again.');
      }
      return actor.updateLink(BigInt(index), link);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links'] });
      toast.success('Link updated successfully');
    },
    onError: (error: any) => {
      console.error('Failed to update link:', error);
      const message = error?.message || 'Failed to update link. Please try again.';
      toast.error(message);
    },
  });
}

export function useDeleteLink() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (index: number) => {
      if (!actor) {
        throw new Error('Backend connection not ready. Please wait a moment and try again.');
      }
      return actor.deleteLink(BigInt(index));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links'] });
      toast.success('Link deleted successfully');
    },
    onError: (error: any) => {
      console.error('Failed to delete link:', error);
      const message = error?.message || 'Failed to delete link. Please try again.';
      toast.error(message);
    },
  });
}
