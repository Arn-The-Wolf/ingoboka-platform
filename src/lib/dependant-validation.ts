/** Returns true when date of birth indicates age 18 or older. */
export function isDependantTooOld(dateOfBirth: string): boolean {
  if (!dateOfBirth) return false;
  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) return false;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age -= 1;
  }
  return age >= 18;
}

export const DEPENDANT_AGE_ERROR = 'Dependants must be under 18 years old';
