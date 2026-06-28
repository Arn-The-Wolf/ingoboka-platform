/**
 * Normalize Rwanda MSISDN for Rodin API (stored as E.164: +2507XXXXXXXX).
 * UI may show 0780000001 with a +250 prefix; login must send +250780000001.
 */
export function normalizeCitizenPhone(phone: string): string {
  const trimmed = phone.trim();
  if (!trimmed || trimmed.includes('@')) {
    return trimmed;
  }

  const digits = trimmed.replace(/\D/g, '');

  if (digits.startsWith('250') && digits.length >= 12) {
    return `+${digits.slice(0, 12)}`;
  }

  if (digits.startsWith('0') && digits.length >= 10) {
    return `+250${digits.slice(1, 10)}`;
  }

  if (digits.length === 9 && digits.startsWith('7')) {
    return `+250${digits}`;
  }

  if (trimmed.startsWith('+')) {
    return trimmed;
  }

  return trimmed;
}

/** Mask email for verify screen, e.g. j***@example.com */
export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!local || !domain) return email;
  const visible = local.slice(0, 1);
  return `${visible}${'*'.repeat(Math.max(1, local.length - 1))}@${domain}`;
}
