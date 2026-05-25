const SPECIAL = /[!@#$%^&*(),.?":{}|<>_\-\[\]\\;/+=`~]/

export type PasswordRule = { id: string; label: string; test: (value: string) => boolean }

export const PASSWORD_RULES: PasswordRule[] = [
  { id: 'length', label: 'At least 8 characters', test: (v) => v.length >= 8 },
  { id: 'upper', label: 'One uppercase letter', test: (v) => /[A-Z]/.test(v) },
  { id: 'lower', label: 'One lowercase letter', test: (v) => /[a-z]/.test(v) },
  { id: 'digit', label: 'One number', test: (v) => /\d/.test(v) },
  { id: 'special', label: 'One special character', test: (v) => SPECIAL.test(v) },
]

export function isPasswordValid(password: string): boolean {
  return PASSWORD_RULES.every((r) => r.test(password))
}

export function passwordValidationMessage(password: string): string | null {
  const failed = PASSWORD_RULES.find((r) => !r.test(password))
  return failed ? failed.label : null
}
