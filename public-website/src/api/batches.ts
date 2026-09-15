import api from './client';
import type { Batch } from '../types';

export const batchApi = {
  async getByCourseId(courseId: string) {
    const { data } = await api.get(`/public/courses/${courseId}/batches`);
    return data.data as Batch[];
  },
};
