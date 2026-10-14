import { z } from "zod";

const E164 = /^\+[1-9]\d{6,14}$/;
const optionalText = (max) => z.string().trim().max(max, `At most ${max} characters`).optional();

export const passwordConfirmSchema = z.object({
  password: z.string().min(1, "Enter your current password"),
});

export const identifierChangeSchema = z
  .object({
    kind: z.enum(["email", "phone"]),
    email: z.string().trim().optional(),
    phone: z.string().trim().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.kind === "email" && !z.string().email().safeParse(value.email ?? "").success) {
      ctx.addIssue({ code: "custom", path: ["email"], message: "Enter a valid email" });
    }
    if (value.kind === "phone" && !E164.test((value.phone ?? "").replace(/[\s-]/g, ""))) {
      ctx.addIssue({ code: "custom", path: ["phone"], message: "Use international format, e.g. +9779812345678" });
    }
  });

/** Mirrors `AddressBodyRequest` limits in Sukilo-Api. */
export const addressSchema = z
  .object({
    recipient_name: z.string().trim().min(1, "Recipient name is required").max(160),
    phone: z.string().trim().min(3, "Phone number is required").max(64),
    address_line_1: z.string().trim().min(1, "Address is required").max(255),
    address_line_2: optionalText(255),
    landmark: optionalText(255),
    city_text: optionalText(120),
    postal_code: optionalText(32),
    address_type: z.enum(["HOME", "OFFICE", "OTHER"]),
    is_shipping: z.boolean(),
    is_billing: z.boolean(),
  })
  .refine((v) => v.is_shipping || v.is_billing, {
    message: "Use the address for shipping, billing or both",
    path: ["is_billing"],
  });

export const revokeReasonSchema = z.object({
  reason: z.string().trim().min(1, "A reason is required").max(255),
});
