import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { feesApi } from '../services/api';
import { queryKeys } from './queryKeys';
import { toastError, toastSuccess } from '../store/toastStore';
import type { FeeRecord, PaymentEntry, QueryParams } from '../types';

export function useFees(params: QueryParams) {
  return useQuery({
    queryKey: queryKeys.fees(params),
    queryFn: () => feesApi.getAll(params),
  });
}

export function useAllFees() {
  return useQuery({
    queryKey: ['fees', 'all'],
    queryFn: () => feesApi.getAllRaw(),
  });
}

export function useFeeByStudent(studentId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.feeByStudent(studentId ?? ''),
    queryFn: () => feesApi.getByStudent(studentId as string),
    enabled: Boolean(studentId),
  });
}

export function useUpdateFee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<FeeRecord> }) => feesApi.update(id, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fees'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toastSuccess('Fee details updated successfully.');
    },
    onError: (error: Error) => toastError('Could not update fee details', error.message),
  });
}

export function useAddPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ feeId, payment }: { feeId: string; payment: Omit<PaymentEntry, 'id'> }) =>
      feesApi.addPayment(feeId, payment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fees'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toastSuccess('Payment recorded successfully.');
    },
    onError: (error: Error) => toastError('Could not record payment', error.message),
  });
}
