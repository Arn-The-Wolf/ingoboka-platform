import { normalizeCitizenPhone } from '@/lib/auth/phone';

const STORAGE_KEY = 'ingoboka:pending-verification';

export interface PendingVerification {
  phone: string;
  email: string | null;
  verifyHint: string | null;
}

export function savePendingVerification(data: PendingVerification): void {
  if (typeof sessionStorage === 'undefined') return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function readPendingVerification(): PendingVerification | null {
  if (typeof sessionStorage === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingVerification;
    if (parsed?.phone) return parsed;
  } catch {
    /* ignore corrupt storage */
  }
  return null;
}

export function clearPendingVerification(): void {
  if (typeof sessionStorage === 'undefined') return;
  sessionStorage.removeItem(STORAGE_KEY);
}

/** Resolve phone from URL query and sessionStorage when in-memory store was cleared by a reload. */
export function resolvePendingVerificationFromUrl(
  phoneParam: string | null
): PendingVerification | null {
  const stored = readPendingVerification();

  if (phoneParam) {
    const phone = normalizeCitizenPhone(phoneParam);
    return {
      phone,
      email: stored?.email ?? null,
      verifyHint: stored?.verifyHint ?? null,
    };
  }

  return stored;
}
