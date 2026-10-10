import { useQuery } from '@tanstack/react-query';
import { academyApi } from '../api/academy';

export const useAcademyStats = () => {
  return useQuery({
    queryKey: ['academyStats'],
    queryFn: () => academyApi.getStats(),
    staleTime: 5 * 60 * 1000,
  });
};
