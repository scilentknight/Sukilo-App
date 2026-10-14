import { z } from "zod";

/** Mirrors the API's password policy (12–128 characters). */
const password = z
  .string()
  .min(12, "Password must be at least 12 characters")
  .max(128, "Password must be at most 128 characters");

const E164 = /^\+[1-9]\d{6,14}$/;

const otpCode = z.string().regex(/^\d{6}$/, "Enter the 6-digit code");

export const loginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, "Email or phone number is required")
    .refine(
      (v) => z.string().email().safeParse(v).success || E164.test(v.replace(/[\s-]/g, "")),
      "Enter a valid email or a phone number like +9779812345678",
    ),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email"),
  phone: z
    .string()
    .trim()
    .optional()
    .refine(
      (v) => !v || E164.test(v.replace(/[\s-]/g, "")),
      "Use international format, e.g. +9779812345678",
    ),
  password,
  countryCode: z.string().regex(/^[A-Za-z]{2}$/, "Choose a market"),
  localeCode: z.string().trim().min(2, "Choose a language").max(32, "Choose a language"),
});

export const otpSchema = z.object({ code: otpCode });

export const forgotPasswordSchema = z.object({
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email"),
});

export const resetPasswordSchema = z
  .object({
    code: otpCode,
    password,
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

/** Strips spaces/dashes from phone input so the API receives strict E.164. */
export function normalizePhone(value) {
  return value ? value.replace(/[\s-]/g, "") : value;
}
