import { useQuery } from '@tanstack/react-query';
import { courseApi } from '../api/courses';

export function useCourses() {
  return useQuery({
    queryKey: ['courses'],
    queryFn: courseApi.getAll,
  });
}

export function useCourse(id: string) {
  return useQuery({
    queryKey: ['course', id],
    queryFn: () => courseApi.getById(id),
    enabled: !!id,
  });
}
