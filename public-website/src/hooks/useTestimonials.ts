import { useQuery } from '@tanstack/react-query';
import { testmonialsApi } from '../api/testimonials';

export const useTestimonials = () => {
  return useQuery({
    queryKey: ['testimonials'],
    queryFn: testmonialsApi.getTestimonials
  });
};
