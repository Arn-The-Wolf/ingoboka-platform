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
  priority?: number;
  referenceType?: string;
  referenceId?: string;
}

export interface NotificationSummary {
  unreadCount: number;
  urgentUnreadCount: number;
}

const CLAIM_TEMPLATE_CODES = new Set([
  'CLAIM_SUBMITTED',
  'CLAIM_DECISION',
  'CLAIM_STATUS_CHANGE',
  'CLAIM_UPDATED',
  'PAYOUT_READY',
]);

export function isClaimNotification(notification: UserNotification): boolean {
  if (notification.referenceType === 'CLAIM') return true;
  return notification.templateCode ? CLAIM_TEMPLATE_CODES.has(notification.templateCode) : false;
}

export function isUrgentNotification(notification: UserNotification): boolean {
  return (notification.priority ?? 0) >= 1 || isClaimNotification(notification);
}

export function getNotificationActionHref(notification: UserNotification): string | null {
  if (notification.referenceType === 'CLAIM' && notification.referenceId) {
    return `/claims/${notification.referenceId}`;
  }
  return null;
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
    priority: raw.priority != null ? Number(raw.priority) : 0,
    referenceType: raw.referenceType ? String(raw.referenceType) : undefined,
    referenceId: raw.referenceId ? String(raw.referenceId) : undefined,
  };
}

function mapSummary(raw: Record<string, unknown>): NotificationSummary {
  return {
    unreadCount: Number(raw.unreadCount ?? 0),
    urgentUnreadCount: Number(raw.urgentUnreadCount ?? 0),
  };
}

export const notificationApi = {
  async listMine(page = 0, size = 10, channel = 'IN_APP') {
    const { data } = await apiClient.get<{
      content?: Record<string, unknown>[];
      totalElements?: number;
      totalPages?: number;
      page?: number;
      size?: number;
    }>('/notifications/me', { params: { page, size, channel } });
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

  async getSummary() {
    const { data } = await apiClient.get<Record<string, unknown>>('/notifications/me/summary');
    return mapSummary(data);
  },

  async markRead(notificationId: string) {
    const { data } = await apiClient.patch<Record<string, unknown>>(
      `/notifications/${notificationId}/read`
    );
    return mapNotification(data);
  },

  async markAllRead() {
    const { data } = await apiClient.patch<{ updated?: number }>('/notifications/read-all');
    return data.updated ?? 0;
  },

  async clearRead() {
    const { data } = await apiClient.delete<{ deleted?: number }>('/notifications/read');
    return data.deleted ?? 0;
  },
};
