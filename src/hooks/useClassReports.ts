import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { classReportsApi } from '../services/api';
import { queryKeys } from './queryKeys';
import { toastError, toastSuccess } from '../store/toastStore';
import type { ClassReport, QueryParams } from '../types';

export function useClassReports(params: QueryParams) {
  return useQuery({
    queryKey: queryKeys.classReports(params),
    queryFn: () => classReportsApi.getAll(params),
  });
}

export function useAllClassReports() {
  return useQuery({
    queryKey: ['classReports', 'all'],
    queryFn: () => classReportsApi.getAllRaw(),
  });
}

export function useCreateClassReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<ClassReport, 'id' | 'createdAt' | 'updatedAt'>) => classReportsApi.createReport(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classReports'] });
      toastSuccess('Class report submitted successfully.');
    },
    onError: (error: Error) => toastError('Could not submit report', error.message),
  });
}

export function useUpdateClassReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<ClassReport> }) => classReportsApi.update(id, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classReports'] });
      toastSuccess('Class report updated successfully.');
    },
    onError: (error: Error) => toastError('Could not update report', error.message),
  });
}

export function useDeleteClassReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => classReportsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classReports'] });
      toastSuccess('Class report deleted successfully.');
    },
    onError: (error: Error) => toastError('Could not delete report', error.message),
  });
}
