import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { walkInsApi } from '../services/api';
import { queryKeys } from './queryKeys';
import { toastError, toastSuccess } from '../store/toastStore';
import type { QueryParams, WalkIn } from '../types';

export function useWalkIns(params: QueryParams) {
  return useQuery({
    queryKey: queryKeys.walkIns(params),
    queryFn: () => walkInsApi.getAll(params),
  });
}

export function useAllWalkIns() {
  return useQuery({
    queryKey: ['walkIns', 'all'],
    queryFn: () => walkInsApi.getAllRaw(),
  });
}

export function useWalkIn(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.walkIn(id ?? ''),
    queryFn: () => walkInsApi.getById(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateWalkIn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<WalkIn, 'id' | 'createdAt' | 'updatedAt' | 'courseInterested'>) => walkInsApi.createWalkIn(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['walkIns'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toastSuccess('Walk-in enquiry created successfully.');
    },
    onError: (error: Error) => toastError('Could not create enquiry', error.message),
  });
}

export function useUpdateWalkIn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<WalkIn> }) => walkInsApi.update(id, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['walkIns'] });
      toastSuccess('Walk-in updated successfully.');
    },
    onError: (error: Error) => toastError('Could not update enquiry', error.message),
  });
}

export function useDeleteWalkIn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => walkInsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['walkIns'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toastSuccess('Walk-in deleted successfully.');
    },
    onError: (error: Error) => toastError('Could not delete enquiry', error.message),
  });
}
