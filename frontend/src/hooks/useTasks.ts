import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { tasksApi } from '../services/api';
import { queryKeys } from './queryKeys';
import { toastError, toastSuccess } from '../store/toastStore';
import type { CreateTaskInput, QueryParams, Task, UploadedFileRef } from '../types';

type EditableTaskFields = Pick<Task, 'title' | 'description' | 'assignedDate' | 'dueDate' | 'priority'>;

export function useTasks(params: QueryParams) {
  return useQuery({
    queryKey: queryKeys.tasks(params),
    queryFn: () => tasksApi.getAll(params),
  });
}

export function useTask(id: string | undefined) {
  return useQuery({
    queryKey: ['tasks', 'detail', id],
    queryFn: () => tasksApi.getById(id as string),
    enabled: Boolean(id),
  });
}

/** The logged-in student's own task list. */
export function useMyTasks() {
  return useQuery({
    queryKey: ['tasks', 'me'],
    queryFn: () => tasksApi.getMine(),
  });
}

/** Admin/Staff viewing one specific student's tasks (e.g. from their profile). */
export function useTasksByStudent(studentId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.tasksByStudent(studentId ?? ''),
    queryFn: () => tasksApi.getByStudent(studentId as string),
    enabled: Boolean(studentId),
  });
}

export function useMySubmission(taskId: string | undefined) {
  return useQuery({
    queryKey: ['tasks', 'me', taskId],
    queryFn: () => tasksApi.getMySubmission(taskId as string),
    enabled: Boolean(taskId),
  });
}

/**
 * Flattened one-row-per-student-submission view of every task, for
 * dashboard charts and the Reports page's Task Report/CSV — those need a
 * flat list rather than the nested Task→submissions[] shape the main
 * getAll() returns.
 */
export interface FlatTaskRow {
  id: string;
  title: string;
  studentId: string;
  batchId: string | null;
  priority: Task['priority'];
  status: string;
  assignedDate: string;
  dueDate: string;
}

export function useAllTasks() {
  return useQuery({
    queryKey: ['tasks', 'all-flat'],
    queryFn: async (): Promise<FlatTaskRow[]> => {
      const result = await tasksApi.getAll({ pageSize: 100 });
      return result.data.flatMap((task) =>
        task.submissions.map((s) => ({
          id: s.id,
          title: task.title,
          studentId: s.studentId,
          batchId: task.batchId ?? null,
          priority: task.priority,
          status: s.status,
          assignedDate: task.assignedDate,
          dueDate: task.dueDate,
        })),
      );
    },
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTaskInput) => tasksApi.createTask(input),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toastSuccess(
        created.assignmentType === 'batch' ? 'Task assigned to the batch.' : 'Task assigned successfully.',
        created.assignmentType === 'batch' ? `${created.submissionCounts.total} student(s) can now see it.` : undefined,
      );
    },
    onError: (error: Error) => toastError('Could not assign task', error.message),
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<EditableTaskFields> }) => tasksApi.update(id, patch),
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

/** Student submits (or resubmits) their work on a task. */
export function useSubmitTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, content, files }: { taskId: string; content: string; files: UploadedFileRef[] }) =>
      tasksApi.submit(taskId, { content, files }),
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['tasks', 'me', taskId] });
      toastSuccess('Task submitted successfully.');
    },
    onError: (error: Error) => toastError('Could not submit task', error.message),
  });
}

/** Trainer/admin approves or sends back a specific student's submission. */
export function useReviewSubmission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      submissionId,
      decision,
      feedback,
    }: {
      submissionId: string;
      decision: 'approve' | 'needs_revision';
      feedback: string;
    }) => tasksApi.review(submissionId, { decision, feedback }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toastSuccess('Review saved.');
    },
    onError: (error: Error) => toastError('Could not save review', error.message),
  });
}
