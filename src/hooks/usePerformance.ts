import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { performanceApi } from '../services/api';
import { queryKeys } from './queryKeys';
import { toastError, toastSuccess } from '../store/toastStore';
import type { PerformanceRecord } from '../types';

export function usePerformanceByStudent(studentId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.performanceByStudent(studentId ?? ''),
    queryFn: () => performanceApi.getByStudent(studentId as string),
    enabled: Boolean(studentId),
  });
}

export function useAllPerformance() {
  return useQuery({
    queryKey: ['performance', 'all'],
    queryFn: () => performanceApi.getAllRaw(),
  });
}

export function useCreatePerformance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<PerformanceRecord, 'id' | 'createdAt' | 'updatedAt'>) => performanceApi.createRecord(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['performance'] });
      toastSuccess('Performance record saved successfully.');
    },
    onError: (error: Error) => toastError('Could not save performance record', error.message),
  });
}

export function useUpdatePerformance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<PerformanceRecord> }) => performanceApi.update(id, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['performance'] });
      toastSuccess('Performance record updated successfully.');
    },
    onError: (error: Error) => toastError('Could not update record', error.message),
  });
}

export function useDeletePerformance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => performanceApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['performance'] });
      toastSuccess('Performance record deleted successfully.');
    },
    onError: (error: Error) => toastError('Could not delete record', error.message),
  });
}
