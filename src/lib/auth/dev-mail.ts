'use client';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

/** True when the app talks to a local backend (Mailhog catches OTP emails). */
export function isLocalDevApi(): boolean {
  return /localhost|127\.0\.0\.1/.test(API_BASE);
}

export const MAILHOG_INBOX_URL = 'http://localhost:8025';
