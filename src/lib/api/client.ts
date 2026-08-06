import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import type { ApiError } from '@/types';
import { getApiBaseUrl } from '@/lib/api/config';

const API_BASE_URL = getApiBaseUrl();

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

let accessToken: string | null = null;
let onUnauthorized: (() => void) | null = null;
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
    return Promise.reject(normalizeApiError(error));
  }
);

function normalizeApiError(
  error: AxiosError<ApiError & { success?: boolean; detail?: string; title?: string }>
): ApiError {
  const body = error.response?.data;
  const message = body?.message?.trim() || body?.detail?.trim() || body?.title?.trim();
  if (message) {
    return {
      message,
      code: body?.code,
      status: error.response?.status,
    };
  }
  if (error.code === 'ECONNABORTED') {
    return { message: 'Request timed out', status: 408 };
  }
  if (!error.response) {
    return { message: 'Network error — is the API running?', status: 0 };
  }
  return {
    message: error.message || 'Unexpected error',
    status: error.response.status,
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
