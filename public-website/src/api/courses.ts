import api from './client';
import type { Course } from '../types';

export const courseApi = {
  async getAll() {
    const { data } = await api.get('/public/courses');
    return data.data as Course[];
  },

  async getById(id: string) {
    const { data } = await api.get(`/public/courses/${id}`);
    return data.data as Course;
  },
};
