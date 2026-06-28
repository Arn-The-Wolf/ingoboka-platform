import { apiClient } from './client';

/** Try primary path, then optional compat alias (for gradual backend rollout). */
export async function getWithFallback<T>(
  primaryPath: string,
  fallbackPath: string,
  params?: Record<string, string | number>
): Promise<T> {
  try {
    const { data } = await apiClient.get<T>(primaryPath, { params });
    return data;
  } catch (error) {
    const status = (error as { status?: number }).status;
    if (status === 404 || status === 405 || status === 403) {
      const { data } = await apiClient.get<T>(fallbackPath, { params });
      return data;
    }
    throw error;
  }
}

/** Map frontend queue filter to backend ApplicationStatus values. */
export function mapApplicationStatusFilter(status: string): string | undefined {
  if (status === 'PENDING') return undefined;
  if (status === 'APPROVE') return 'APPROVED';
  if (status === 'REJECT') return 'REJECTED';
  return status;
}

export const PENDING_APPLICATION_STATUSES = new Set(['SUBMITTED', 'UNDER_REVIEW']);
