/** Normalize Rwanda MSISDN to 07XXXXXXXX (matches backend storage). */
export function normalizeCitizenPhone(phone: string): string {
  const trimmed = phone.trim();
  if (trimmed.startsWith('+250')) {
    return `0${trimmed.slice(4)}`;
  }
  if (trimmed.startsWith('250') && trimmed.length >= 12) {
    return `0${trimmed.slice(3)}`;
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
