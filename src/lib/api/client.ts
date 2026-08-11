import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import type { ApiError } from '@/types';
import { getApiErrorMessage } from '@/lib/api/integration-helpers';
import { getApiBaseUrl } from '@/lib/api/config';
import { DEFAULT_API_TIMEOUT_MS } from '@/lib/api/timeouts';

const API_BASE_URL = getApiBaseUrl();

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Must stay below Vercel rewrite/proxy limits when using `/api/v1` (typically 60s Hobby, up to 300s Pro).
  timeout: DEFAULT_API_TIMEOUT_MS,
});

let accessToken: string | null = null;
let onUnauthorized: (() => void) | null = null;
let onForbidden: ((error: ApiError) => void) | null = null;
let refreshAccessToken: (() => Promise<string | null>) | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
  if (token) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common.Authorization;
  }
}

export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler;
}

export function setForbiddenHandler(handler: (error: ApiError) => void) {
  onForbidden = handler;
}

export function setTokenRefreshHandler(handler: () => Promise<string | null>) {
  refreshAccessToken = handler;
}

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (accessToken && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    const body = response.data as Record<string, unknown> | undefined;
    if (
      body &&
      typeof body === 'object' &&
      'success' in body &&
      'data' in body
    ) {
      response.data = body.data;
    }
    return response;
  },
  async (error: AxiosError<ApiError>) => {
    const config = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    const status = error.response?.status;

    if (status === 401 && config && !config._retry && refreshAccessToken) {
      config._retry = true;
      try {
        const newToken = await refreshAccessToken();
        if (newToken) {
          config.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(config);
        }
      } catch {
        /* fall through to logout */
      }
    }

    if (status === 401) {
      onUnauthorized?.();
    }
    if (status === 403) {
      const normalized = normalizeApiError(error);
      onForbidden?.(normalized);
    }
    return Promise.reject(normalizeApiError(error));
  }
);

function normalizeApiError(
  error: AxiosError<
    ApiError & {
      success?: boolean;
      detail?: string;
      title?: string;
      fieldErrors?: Record<string, string>;
      errors?: Record<string, string>;
    }
  >
): ApiError {
  const body = error.response?.data;
  const fieldErrors = body?.fieldErrors ?? body?.errors;
  const rawMessage = body?.message?.trim() || body?.detail?.trim() || body?.title?.trim();
  const status = error.response?.status;

  if (rawMessage || fieldErrors || body?.code) {
    const interim: ApiError = {
      message: rawMessage || 'Request failed',
      code: body?.code,
      status,
      fieldErrors,
      errors: body?.errors,
    };
    return {
      ...interim,
      message: getApiErrorMessage(interim) ?? interim.message,
    };
  }
  if (error.code === 'ECONNABORTED' || error.message.toLowerCase().includes('timeout')) {
    return {
      message:
        'The request is taking longer than expected. Your action may still have succeeded — please refresh or check your list before trying again.',
      code: 'ECONNABORTED',
      status: 408,
    };
  }
  if (!error.response) {
    return { message: 'Network error — is the API running?', status: 0 };
  }
  const interim: ApiError = {
    message: error.message || 'Unexpected error',
    status,
  };
  return {
    ...interim,
    message: getApiErrorMessage(interim) ?? interim.message,
  };
}

export function isNetworkError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    (error as ApiError).status === 0
  );
}

export function isTimeoutError(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) return false;
  const apiError = error as ApiError & { code?: string };
  return apiError.status === 408 || apiError.code === 'ECONNABORTED';
}
