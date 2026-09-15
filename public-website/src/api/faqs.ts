import api from './client';
import type { FAQ } from '../types/content';

export const faqApi = {
  async getActiveFAQs() {
    const { data } = await api.get('/public/faqs');
    return data.data as FAQ[];
  },
};
