import { useQuery } from '@tanstack/react-query';
import {
  getCourseDistribution,
  getDashboardStats,
  getLeadFunnel,
  getRevenueSeries,
  getStudentDashboardStats,
} from '../services/api';
import { queryKeys } from './queryKeys';

export function useDashboardStats(enabled: boolean = true) {
  return useQuery({ queryKey: queryKeys.dashboardStats(), queryFn: getDashboardStats, enabled });
}

export function useRevenueSeries() {
  return useQuery({ queryKey: queryKeys.dashboardRevenue(), queryFn: getRevenueSeries });
}

export function useCourseDistribution() {
  return useQuery({ queryKey: queryKeys.dashboardCourses(), queryFn: getCourseDistribution });
}

export function useLeadFunnel() {
  return useQuery({ queryKey: queryKeys.dashboardFunnel(), queryFn: getLeadFunnel });
}

export function useStudentDashboardStats(studentId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.studentDashboard(studentId ?? ''),
    queryFn: () => getStudentDashboardStats(studentId as string),
    enabled: Boolean(studentId),
  });
}
