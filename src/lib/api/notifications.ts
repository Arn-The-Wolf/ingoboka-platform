import { apiClient } from './client';
import { unwrapPage } from './mappers';

export interface UserNotification {
  id: string;
  channel: string;
  templateCode?: string;
  subject: string;
  body: string;
  status: string;
  sentAt?: string;
  readAt?: string;
  createdAt: string;
}

function mapNotification(raw: Record<string, unknown>): UserNotification {
  return {
    id: String(raw.id ?? ''),
    channel: String(raw.channel ?? 'IN_APP'),
    templateCode: raw.templateCode ? String(raw.templateCode) : undefined,
    subject: String(raw.subject ?? raw.title ?? 'Notification'),
    body: String(raw.body ?? raw.message ?? ''),
    status: String(raw.status ?? 'PENDING'),
    sentAt: raw.sentAt ? String(raw.sentAt) : undefined,
    readAt: raw.readAt ? String(raw.readAt) : undefined,
    createdAt: String(raw.createdAt ?? raw.sentAt ?? new Date().toISOString()),
  };
}

export const notificationApi = {
  async listMine(page = 0, size = 10) {
    const { data } = await apiClient.get<{
      content?: Record<string, unknown>[];
      totalElements?: number;
      totalPages?: number;
      page?: number;
      size?: number;
    }>('/notifications/me', { params: { page, size } });
    const content = unwrapPage(data).map((row) => mapNotification(row as Record<string, unknown>));
    const totalElements = data.totalElements ?? content.length;
    return {
      content,
      totalElements,
      totalPages: data.totalPages ?? Math.max(1, Math.ceil(totalElements / size)),
      page: data.page ?? page,
      size: data.size ?? size,
    };
  },

  async markRead(notificationId: string) {
    const { data } = await apiClient.patch<Record<string, unknown>>(
      `/notifications/${notificationId}/read`
    );
    return mapNotification(data);
  },
};
