import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { attendanceApi } from '../services/api';
import { queryKeys } from './queryKeys';
import { toastError, toastSuccess } from '../store/toastStore';
import type { AttendanceRecord } from '../types';

export function useAttendanceByStudent(studentId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.attendanceByStudent(studentId ?? ''),
    queryFn: () => attendanceApi.getByStudent(studentId as string),
    enabled: Boolean(studentId),
  });
}

export function useAllAttendance() {
  return useQuery({
    queryKey: ['attendance', 'all'],
    queryFn: () => attendanceApi.getAllRaw(),
  });
}

export function useAttendanceByBatchDate(batchId: string, date: string) {
  return useQuery({
    queryKey: queryKeys.attendanceByBatchDate(batchId, date),
    queryFn: () => attendanceApi.getByBatchAndDate(batchId, date),
    enabled: Boolean(batchId && date),
  });
}

export function useMarkBulkAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      batchId,
      date,
      marks,
    }: {
      batchId: string;
      date: string;
      marks: Array<{ studentId: string; status: AttendanceRecord['status'] }>;
    }) => attendanceApi.markBulk(batchId, date, marks),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toastSuccess('Attendance saved successfully.');
    },
    onError: (error: Error) => toastError('Could not save attendance', error.message),
  });
}
