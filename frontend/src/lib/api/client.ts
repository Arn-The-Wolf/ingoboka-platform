import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import type { ApiError } from '@/types';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

let accessToken: string | null = null;
let onUnauthorized: (() => void) | null = null;

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

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (accessToken && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    if (error.response?.status === 401) {
      onUnauthorized?.();
    }
    return Promise.reject(normalizeApiError(error));
  }
);

function normalizeApiError(error: AxiosError<ApiError>): ApiError {
  if (error.response?.data?.message) {
    return {
      message: error.response.data.message,
      code: error.response.data.code,
      status: error.response.status,
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
