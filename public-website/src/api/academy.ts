import api from './client';
import type { AcademyInfo } from '../types';

export const academyApi = {
  async getInfo() {
    const { data } = await api.get('/public/academy');
    return data.data as AcademyInfo;
  },
};
