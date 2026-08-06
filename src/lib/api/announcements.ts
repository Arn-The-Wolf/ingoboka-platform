import { apiClient } from './client';

export interface Announcement {
  id: string;
  title: string;
  body: string;
  source: 'PLATFORM' | 'INSURER';
  organizationId?: string;
  createdAt: string;
  expiresAt?: string;
}

function mapAnnouncement(raw: Record<string, unknown>): Announcement {
  return {
    id: String(raw.id ?? ''),
    title: String(raw.title ?? ''),
    body: String(raw.body ?? ''),
    source: (raw.source as Announcement['source']) ?? 'PLATFORM',
    organizationId: raw.organizationId ? String(raw.organizationId) : undefined,
    createdAt: String(raw.createdAt ?? new Date().toISOString()),
    expiresAt: raw.expiresAt ? String(raw.expiresAt) : undefined,
  };
}

export const announcementApi = {
  async listActive(): Promise<Announcement[]> {
    const { data } = await apiClient.get<Record<string, unknown>[] | { content?: Record<string, unknown>[] }>(
      '/announcements/active'
    );
    const rows = Array.isArray(data) ? data : (data.content ?? []);
    return rows.map((row) => mapAnnouncement(row as Record<string, unknown>));
  },
};
