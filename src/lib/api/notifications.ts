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
  async listMine(page = 0, size = 30) {
    const { data } = await apiClient.get<{ content?: Record<string, unknown>[] }>(
      '/notifications/me',
      { params: { page, size } }
    );
    const content = unwrapPage(data).map((row) => mapNotification(row as Record<string, unknown>));
    return { content, totalElements: content.length };
  },

  async markRead(notificationId: string) {
    const { data } = await apiClient.patch<Record<string, unknown>>(
      `/notifications/${notificationId}/read`
    );
    return mapNotification(data);
  },
};
