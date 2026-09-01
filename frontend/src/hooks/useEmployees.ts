import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { employeesApi } from '../services/api';
import { queryKeys } from './queryKeys';
import { toastError, toastSuccess } from '../store/toastStore';
import type { Employee, QueryParams } from '../types';

export function useEmployees(params: QueryParams) {
  return useQuery({
    queryKey: queryKeys.employees(params),
    queryFn: () => employeesApi.getAll(params),
  });
}

export function useAllEmployees() {
  return useQuery({
    queryKey: queryKeys.employeesAll(),
    queryFn: () => employeesApi.getAllRaw(),
  });
}

export function useEmployee(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.employee(id ?? ''),
    queryFn: () => employeesApi.getById(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<Employee, 'id' | 'employeeId' | 'createdAt' | 'updatedAt' | 'assignedBatchIds'>) =>
      employeesApi.createEmployee(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toastSuccess('Employee added successfully.');
    },
    onError: (error: Error) => toastError('Could not add employee', error.message),
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Employee> }) => employeesApi.update(id, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toastSuccess('Employee updated successfully.');
    },
    onError: (error: Error) => toastError('Could not update employee', error.message),
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => employeesApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toastSuccess('Employee removed successfully.');
    },
    onError: (error: Error) => toastError('Could not remove employee', error.message),
  });
}
