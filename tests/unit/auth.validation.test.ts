import { describe, expect, it } from "vitest";
import {
  validateLoginInput,
  validateRegistrationInput
} from "../../server/services/auth.validation";

describe("validateRegistrationInput", () => {
  it("accepts a complete registration", () => {
    expect(
      validateRegistrationInput({
        name: "Sarah",
        email: "sarah@example.com",
        password: "cabin-password",
        passwordConfirmation: "cabin-password"
      })
    ).toEqual([]);
  });

  it("rejects short or mismatched passwords", () => {
    expect(
      validateRegistrationInput({
        name: "Sarah",
        email: "sarah@example.com",
        password: "short",
        passwordConfirmation: "different"
      })
    ).toEqual([
      "Password must be at least 8 characters",
      "Passwords must match"
    ]);
  });
});

describe("validateLoginInput", () => {
  it("requires an email and password", () => {
    expect(validateLoginInput({})).toEqual([
      "A valid email is required",
      "Password is required"
    ]);
  });
});
