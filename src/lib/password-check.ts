// Must match emailAndPassword.minPasswordLength in src/lib/auth.ts.
export const MIN_PASSWORD_LENGTH = 8;

/** Client-side check before a new password is sent; the server still enforces the length. */
export function newPasswordError(password: string, confirm: string): "tooShort" | "mismatch" | null {
  if (password.length < MIN_PASSWORD_LENGTH) return "tooShort";
  if (password !== confirm) return "mismatch";
  return null;
}
