import { useQuery } from '@tanstack/react-query';
import { announcementsApi } from '../api/announcements';
export type { Announcement } from '../api/announcements';

export const useAnnouncements = () =>
  useQuery({
    queryKey: ['announcements'],
    queryFn: announcementsApi.getActive,
    staleTime: 60_000,
    // Offers can change (or expire on a schedule) without a deploy, so poll gently.
    refetchInterval: 5 * 60_000,
  });
