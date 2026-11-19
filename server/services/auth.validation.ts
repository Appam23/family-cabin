export interface RegistrationInput {
  name: string;
  email: string;
  password: string;
  passwordConfirmation: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export function validateRegistrationInput(
  input: Partial<RegistrationInput>
): string[] {
  const errors: string[] = [];

  if (typeof input.name !== "string" || !input.name.trim()) {
    errors.push("Name is required");
  }

  if (
    typeof input.email !== "string" ||
    !input.email.trim() ||
    !input.email.includes("@")
  ) {
    errors.push("A valid email is required");
  }

  if (typeof input.password !== "string" || input.password.length < 8) {
    errors.push("Password must be at least 8 characters");
  }

  if (input.password !== input.passwordConfirmation) {
    errors.push("Passwords must match");
  }

  return errors;
}

export function validateLoginInput(input: Partial<LoginInput>): string[] {
  const errors: string[] = [];

  if (
    typeof input.email !== "string" ||
    !input.email.trim() ||
    !input.email.includes("@")
  ) {
    errors.push("A valid email is required");
  }

  if (typeof input.password !== "string" || !input.password) {
    errors.push("Password is required");
  }

  return errors;
}
