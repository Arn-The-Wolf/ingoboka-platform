const STORAGE_KEY = 'ingoboka:pending-password-reset';

export interface PendingPasswordReset {
  email: string;
  resetToken: string | null;
}

export function savePendingPasswordReset(data: PendingPasswordReset): void {
  if (typeof sessionStorage === 'undefined') return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function readPendingPasswordReset(): PendingPasswordReset | null {
  if (typeof sessionStorage === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingPasswordReset;
    if (parsed?.email) return parsed;
  } catch {
    /* ignore corrupt storage */
  }
  return null;
}

export function clearPendingPasswordReset(): void {
  if (typeof sessionStorage === 'undefined') return;
  sessionStorage.removeItem(STORAGE_KEY);
}

export function resolvePendingPasswordResetFromUrl(
  emailParam: string | null
): PendingPasswordReset | null {
  const stored = readPendingPasswordReset();

  if (emailParam) {
    const email = emailParam.trim().toLowerCase();
    return {
      email,
      resetToken: stored?.resetToken ?? null,
    };
  }

  return stored;
}
