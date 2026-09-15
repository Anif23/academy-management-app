import api from './client';
import type { RegistrationRequest } from '../types';

export const registrationApi = {
  async register(data: RegistrationRequest) {
    const { data: response } = await api.post('/public/register', data);
    return response;
  },
};
