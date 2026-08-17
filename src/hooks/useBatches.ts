import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { batchesApi } from '../services/api';
import { queryKeys } from './queryKeys';
import { toastError, toastSuccess } from '../store/toastStore';
import type { Batch, QueryParams } from '../types';

export function useBatches(params: QueryParams) {
  return useQuery({
    queryKey: queryKeys.batches(params),
    queryFn: () => batchesApi.getAll(params),
  });
}

export function useAllBatches() {
  return useQuery({
    queryKey: queryKeys.batchesAll(),
    queryFn: () => batchesApi.getAllRaw(),
  });
}

export function useBatch(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.batch(id ?? ''),
    queryFn: () => batchesApi.getById(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateBatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<Batch, 'id' | 'createdAt' | 'updatedAt' | 'studentIds'>) => batchesApi.createBatch(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toastSuccess('Batch created successfully.');
    },
    onError: (error: Error) => toastError('Could not create batch', error.message),
  });
}

export function useUpdateBatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Batch> }) => batchesApi.update(id, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      toastSuccess('Batch updated successfully.');
    },
    onError: (error: Error) => toastError('Could not update batch', error.message),
  });
}

export function useDeleteBatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => batchesApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toastSuccess('Batch deleted successfully.');
    },
    onError: (error: Error) => toastError('Could not delete batch', error.message),
  });
}
