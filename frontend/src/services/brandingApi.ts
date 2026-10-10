import { httpClient, toErrorMessage } from './httpClient';

export interface BrandingSettings {
  appName: string;
  tagline: string;
  logoUrl: string | null;
}

export const brandingApi = {
  async get(): Promise<BrandingSettings> {
    try {
      const response = await httpClient.get('/branding');
      return response.data.data;
    } catch (error) {
      throw new Error(toErrorMessage(error));
    }
  },
  async update(patch: Partial<BrandingSettings>): Promise<BrandingSettings> {
    try {
      const response = await httpClient.patch('/admin/branding', patch);
      return response.data.data;
    } catch (error) {
      throw new Error(toErrorMessage(error));
    }
  },
};
