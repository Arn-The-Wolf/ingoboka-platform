import type { User } from '@/types';

export function userNeedsEmailVerification(user: Pick<User, 'requiresEmailVerification' | 'emailVerified' | 'status'> | null | undefined): boolean {
  if (!user) return false;
  return Boolean(
    user.requiresEmailVerification ||
      user.emailVerified === false ||
      user.status === 'PENDING_EMAIL_VERIFICATION'
  );
}

export function userNeedsPasswordChange(user: Pick<User, 'mustChangePassword' | 'status'> | null | undefined): boolean {
  if (!user) return false;
  return Boolean(user.mustChangePassword || user.status === 'PENDING_PASSWORD_CHANGE');
}

/** Locale-agnostic onboarding path (caller adds locale prefix). */
export function resolveOnboardingPath(user: User | null | undefined): string | null {
  if (!user) return null;
  if (userNeedsPasswordChange(user)) return '/change-password';
  if (userNeedsEmailVerification(user)) return '/verify-email';
  return null;
}
