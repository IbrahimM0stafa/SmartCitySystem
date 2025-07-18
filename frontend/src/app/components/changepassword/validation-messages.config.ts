// validation-messages.config.ts
export const VALIDATION_MESSAGES = {
  PASSWORD_REQUIREMENTS: 'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.', // NOSONAR
  PASSWORDS_MISMATCH: 'Passwords do not match', // NOSONAR
  WEAK_PASSWORD: 'Please use a stronger password' // NOSONAR
} as const;

export type ValidationMessageKey = keyof typeof VALIDATION_MESSAGES;