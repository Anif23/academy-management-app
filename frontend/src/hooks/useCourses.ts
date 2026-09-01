import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { coursesApi } from '../services/api';
import { toastError, toastSuccess } from '../store/toastStore';
import type { CourseRecord, QueryParams } from '../types';

export function useCourses(params: QueryParams) {
  return useQuery({
    queryKey: ['courses', params],
    queryFn: () => coursesApi.getAll(params),
  });
}

export function useAllCourses() {
  return useQuery({
    queryKey: ['courses', 'all'],
    queryFn: () => coursesApi.getAllRaw(),
  });
}

export function useCreateCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<CourseRecord, 'id' | 'createdAt' | 'updatedAt'>) => coursesApi.createCourse(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toastSuccess('Course created successfully.');
    },
    onError: (error: Error) => toastError('Could not create course', error.message),
  });
}

export function useUpdateCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<CourseRecord> }) => coursesApi.update(id, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      queryClient.invalidateQueries({ queryKey: ['walkIns'] });
      toastSuccess('Course updated successfully.');
    },
    onError: (error: Error) => toastError('Could not update course', error.message),
  });
}

export function useDeleteCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => coursesApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toastSuccess('Course deleted successfully.');
    },
    onError: (error: Error) => toastError('Could not delete course', error.message),
  });
}
