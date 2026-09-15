import { useQuery } from '@tanstack/react-query';
import { batchApi } from '../api/batches';

export function useBatches(courseId: string) {
  return useQuery({
    queryKey: ['batches', courseId],
    queryFn: () => batchApi.getByCourseId(courseId),
    enabled: !!courseId,
  });
}
