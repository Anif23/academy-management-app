import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { tasksApi } from '../services/api';
import { queryKeys } from './queryKeys';
import { toastError, toastSuccess } from '../store/toastStore';
import type { QueryParams, StudentTask } from '../types';

export function useTasks(params: QueryParams) {
  return useQuery({
    queryKey: queryKeys.tasks(params),
    queryFn: () => tasksApi.getAll(params),
  });
}

export function useTasksByStudent(studentId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.tasksByStudent(studentId ?? ''),
    queryFn: () => tasksApi.getByStudent(studentId as string),
    enabled: Boolean(studentId),
  });
}

export function useAllTasks() {
  return useQuery({
    queryKey: ['tasks', 'all'],
    queryFn: () => tasksApi.getAllRaw(),
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<StudentTask, 'id' | 'createdAt' | 'updatedAt'>) => tasksApi.createTask(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toastSuccess('Task assigned successfully.');
    },
    onError: (error: Error) => toastError('Could not assign task', error.message),
  });
}

export function useCreateBatchTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<StudentTask, 'id' | 'studentId' | 'createdAt' | 'updatedAt' | 'batchAssignmentId'> & { batchId: string }) =>
      tasksApi.createBatchTask(input),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toastSuccess('Batch task assigned successfully.', `Individual task records created for ${created.length} student(s).`);
    },
    onError: (error: Error) => toastError('Could not assign batch task', error.message),
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<StudentTask> }) => tasksApi.update(id, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toastSuccess('Task updated successfully.');
    },
    onError: (error: Error) => toastError('Could not update task', error.message),
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tasksApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toastSuccess('Task deleted successfully.');
    },
    onError: (error: Error) => toastError('Could not delete task', error.message),
  });
}
