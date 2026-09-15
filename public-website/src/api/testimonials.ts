import api from './client';

export const testmonialsApi = {
  async getTestimonials() {
    const { data } = await api.get('/public/testimonials');
    return data.data as [];
  },
};
