import { useQuery } from '@tanstack/react-query';
import { academyApi } from '../api/academy';

export const useAcademyInfo = () => {
  return useQuery({
    queryKey: ['academyInfo'],
    queryFn: () => academyApi.getInfo(),
  });
};
