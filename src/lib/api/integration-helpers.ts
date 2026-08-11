import { apiClient, isTimeoutError } from './client';
import type { ApiError } from '@/types';

export { isTimeoutError };

const GENERIC_SERVER_MESSAGE = 'Something went wrong. Please try again in a moment.';
const GENERIC_VALIDATION_MESSAGE = 'Please check the highlighted fields and try again.';

/** Extract a human-readable message from a rejected API call. */
export function getApiErrorMessage(error: unknown): string | undefined {
  if (typeof error !== 'object' || error === null) return undefined;
  const apiError = error as ApiError & { detail?: string; title?: string };

  if (typeof apiError.message === 'string' && apiError.message.trim()) {
    const msg = apiError.message.trim();
    if (isRawHttpMessage(msg)) {
      return messageForStatus(apiError.status) ?? GENERIC_SERVER_MESSAGE;
    }
    return msg;
  }
  if (typeof apiError.detail === 'string' && apiError.detail.trim()) {
    return apiError.detail.trim();
  }
  if (typeof apiError.title === 'string' && apiError.title.trim()) {
    return apiError.title.trim();
  }
  if (apiError.status !== undefined) {
    return messageForStatus(apiError.status);
  }
  return undefined;
}

/** Field-level validation errors from the API (`fieldErrors` or legacy `errors`). */
export function getApiFieldErrors(error: unknown): Record<string, string> {
  if (typeof error !== 'object' || error === null) return {};
  const apiError = error as ApiError;
  const merged = { ...(apiError.errors ?? {}), ...(apiError.fieldErrors ?? {}) };
  return Object.fromEntries(
    Object.entries(merged).filter(([, value]) => typeof value === 'string' && value.trim())
  ) as Record<string, string>;
}

/** Apply API field errors to a react-hook-form `setError` helper. */
export function applyApiFieldErrors<TFieldValues extends Record<string, unknown>>(
  error: unknown,
  setError: (
    name: keyof TFieldValues & string,
    error: { type: string; message: string }
  ) => void
): boolean {
  const fieldErrors = getApiFieldErrors(error);
  const entries = Object.entries(fieldErrors);
  if (entries.length === 0) return false;
  for (const [field, message] of entries) {
    setError(field as keyof TFieldValues & string, { type: 'server', message });
  }
  return true;
}

export function isApiError(error: unknown): error is ApiError {
  return typeof error === 'object' && error !== null && 'message' in error;
}

function isRawHttpMessage(message: string): boolean {
  return /^\d{3}\s/.test(message) || /internal server error/i.test(message);
}

function messageForStatus(status?: number): string | undefined {
  switch (status) {
    case 400:
      return GENERIC_VALIDATION_MESSAGE;
    case 401:
      return 'Your session expired. Please sign in again.';
    case 403:
      return 'You do not have permission to perform this action.';
    case 404:
      return 'The requested resource was not found.';
    case 408:
      return 'The request is taking longer than expected. Your action may still have succeeded — please refresh or check your list before trying again.';
    case 409:
      return 'This action conflicts with existing data.';
    case 500:
    case 502:
    case 503:
      return GENERIC_SERVER_MESSAGE;
    default:
      return status && status >= 500 ? GENERIC_SERVER_MESSAGE : undefined;
  }
}

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
