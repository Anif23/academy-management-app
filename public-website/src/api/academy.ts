import api from './client';
import type { AcademyInfo } from '../types';

export interface AcademyStats {
  students: number;
  courses: number;
  trainers: number;
  batches: number;
}

export const academyApi = {
  async getInfo() {
    const { data } = await api.get('/public/academy');
    return data.data as AcademyInfo;
  },
  async getStats() {
    const { data } = await api.get('/public/stats');
    return data.data as AcademyStats;
  },
};
