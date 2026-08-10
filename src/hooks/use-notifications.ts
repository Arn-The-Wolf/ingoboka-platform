'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationApi } from '@/lib/api/notifications';

export const NOTIFICATIONS_QUERY_KEY = ['notifications', 'me'] as const;
export const NOTIFICATIONS_SUMMARY_KEY = ['notifications', 'summary'] as const;

export function useNotificationSummary() {
  return useQuery({
    queryKey: NOTIFICATIONS_SUMMARY_KEY,
    queryFn: () => notificationApi.getSummary(),
    refetchInterval: 60_000,
  });
}

export function useNotifications(page = 0, size = 10) {
  return useQuery({
    queryKey: [...NOTIFICATIONS_QUERY_KEY, page, size],
    queryFn: () => notificationApi.listMine(page, size),
  });
}

export function useUrgentNotifications() {
  return useQuery({
    queryKey: [...NOTIFICATIONS_QUERY_KEY, 'urgent'],
    queryFn: async () => {
      const page = await notificationApi.listMine(0, 20, 'IN_APP');
      return page.content.filter((item) => !item.readAt && (item.priority ?? 0) >= 1);
    },
    refetchInterval: 30_000,
  });
}

function invalidateNotifications(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
  queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_SUMMARY_KEY });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationApi.markRead(id),
    onSuccess: () => invalidateNotifications(queryClient),
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationApi.markAllRead(),
    onSuccess: () => invalidateNotifications(queryClient),
  });
}

export function useClearReadNotifications() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationApi.clearRead(),
    onSuccess: () => invalidateNotifications(queryClient),
  });
}
