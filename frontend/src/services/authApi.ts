import { httpClient, toErrorMessage } from './httpClient';
import type { AuthUser } from '../types';

export const DEMO_CREDENTIALS = {
  email: 'admin@academypro.com',
  password: 'admin123',
};

export const authApi = {
  async login(email: string, password: string): Promise<AuthUser> {
    try {
      const response = await httpClient.post('/auth/login', { email, password });
      return response.data.data;
    } catch (error) {
      throw new Error(toErrorMessage(error));
    }
  },
  async logout(): Promise<void> {
    try {
      await httpClient.post('/auth/logout');
    } catch {
      // Logging out should never block the UI even if the network call fails —
      // the client-side session is cleared regardless.
    }
  },
  async me(): Promise<AuthUser> {
    const response = await httpClient.get('/auth/me');
    return response.data.data;
  },
  async updateProfile(patch: Partial<Pick<AuthUser, 'name' | 'role' | 'department' | 'phone'>>): Promise<AuthUser> {
    try {
      const response = await httpClient.patch('/auth/me', patch);
      return response.data.data;
    } catch (error) {
      throw new Error(toErrorMessage(error));
    }
  },
};
