import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { studentsApi } from '../services/api';
import { queryKeys } from './queryKeys';
import { toastError, toastSuccess } from '../store/toastStore';
import type { QueryParams, Student } from '../types';

export function useStudents(params: QueryParams) {
  return useQuery({
    queryKey: queryKeys.students(params),
    queryFn: () => studentsApi.getAll(params),
  });
}

export function useStudent(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.student(id ?? ''),
    queryFn: () => studentsApi.getById(id as string),
    enabled: Boolean(id),
  });
}

export function useAllStudents() {
  return useQuery({
    queryKey: ['students', 'all'],
    queryFn: () => studentsApi.getAllRaw(),
  });
}

export function useCreateStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<Student, 'id' | 'studentId' | 'createdAt' | 'updatedAt'>) => studentsApi.createStudent(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      queryClient.invalidateQueries({ queryKey: ['walkIns'] });
      queryClient.invalidateQueries({ queryKey: ['fees'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['search'] });
      toastSuccess('Student registered successfully.', 'An admission fee record has been created — you can add payments from the Fees page.');
    },
    onError: (error: Error) => toastError('Could not register student', error.message),
  });
}

export function useUpdateStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Student> }) => studentsApi.update(id, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['search'] });
      toastSuccess('Student updated successfully.');
    },
    onError: (error: Error) => toastError('Could not update student', error.message),
  });
}

export function useDeleteStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => studentsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      queryClient.invalidateQueries({ queryKey: ['fees'] });
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['performance'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['search'] });
      toastSuccess('Student deleted successfully.', 'Related fee, attendance, task, and performance records were also removed.');
    },
    onError: (error: Error) => toastError('Could not delete student', error.message),
  });
}
