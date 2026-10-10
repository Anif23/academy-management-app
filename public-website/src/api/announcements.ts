import api from './client';

export interface Announcement {
  id: string;
  message: string;
  link?: string | null;
  tag?: string | null;
  order: number;
}

export const announcementsApi = {
  async getActive(): Promise<Announcement[]> {
    const { data } = await api.get('/public/announcements');
    return data.data as Announcement[];
  },
};
