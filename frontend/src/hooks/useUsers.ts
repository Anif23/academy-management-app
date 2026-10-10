import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { httpClient, toErrorMessage } from '../services/httpClient';
import { toastError, toastSuccess } from '../store/toastStore';
import type { PaginatedResult, QueryParams } from '../types';

export interface ManagedUser {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'STAFF' | 'COUNSELLOR' | 'STUDENT';
  department: string;
  phone: string;
  status: 'Active' | 'Inactive';
  employeeId: string | null;
  studentId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'STAFF' | 'COUNSELLOR' | 'STUDENT';
  department?: string;
  phone?: string;
  employeeId?: string;
  studentId?: string;
}

async function unwrap<T>(promise: Promise<{ data: { data: T } }>): Promise<T> {
  try {
    const response = await promise;
    return response.data.data;
  } catch (error) {
    throw new Error(toErrorMessage(error));
  }
}

export function useUsers(params: QueryParams) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: async (): Promise<PaginatedResult<ManagedUser>> => {
      const response = await httpClient.get('/users', { params });
      const { data, total, page, pageSize, totalPages } = response.data;
      return { data, total, page, pageSize, totalPages };
    },
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateUserInput) => unwrap<ManagedUser>(httpClient.post('/users', input)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toastSuccess('User account created successfully.');
    },
    onError: (error: Error) => toastError('Could not create user', error.message),
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<ManagedUser> }) =>
      unwrap<ManagedUser>(httpClient.patch(`/users/${id}`, patch)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toastSuccess('User updated successfully.');
    },
    onError: (error: Error) => toastError('Could not update user', error.message),
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      try {
        await httpClient.delete(`/users/${id}`);
      } catch (error) {
        throw new Error(toErrorMessage(error));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toastSuccess('User deleted successfully.');
    },
    onError: (error: Error) => toastError('Could not delete user', error.message),
  });
}
