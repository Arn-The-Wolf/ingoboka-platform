import { apiClient } from './client';
import type { ApiError } from '@/types';

function getErrorStatus(error: unknown): number | undefined {
  if (typeof error === 'object' && error !== null && 'status' in error) {
    return (error as ApiError).status;
  }
  return undefined;
}

/** Status codes where we try the compat alias path (Rodin often returns 500 for missing routes). */
const FALLBACK_STATUSES = new Set([403, 404, 405, 500, 502, 503]);

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
    const status = getErrorStatus(error);
    if (status !== undefined && FALLBACK_STATUSES.has(status)) {
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
