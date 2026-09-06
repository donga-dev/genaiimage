import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  companyName: z.string().trim().min(2, "Company name is required").max(120),
  email: z.string().trim().email("Enter a valid email").toLowerCase(),
  phone: z
    .string()
    .trim()
    .transform((value) => value.replace(/\s+/g, ""))
    .refine((value) => /^(\+91)?[6-9]\d{9}$/.test(value), "Enter a valid Indian mobile number"),
  password: z.string().min(8, "Password must be at least 8 characters").max(72),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email").toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

export const profileSchema = z.object({
  name: z.string().trim().min(2).max(80),
  companyName: z.string().trim().min(2).max(120),
  phone: z
    .string()
    .trim()
    .transform((value) => value.replace(/\s+/g, ""))
    .refine((value) => /^(\+91)?[6-9]\d{9}$/.test(value), "Enter a valid Indian mobile number"),
});

export const purchaseSchema = z.object({
  planId: z.string().min(1, "Plan is required"),
});

export const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

export const creditLookupSchema = z.object({
  adminId: z.string().min(1, "adminId is required"),
  adminEmail: z.string().trim().email("adminEmail must be a valid email").toLowerCase(),
});

export const deductSchema = creditLookupSchema.extend({
  userEmail: z.string().trim().email("userEmail must be a valid email").toLowerCase(),
  source: z.string().trim().max(80).optional(),
});

export const apiKeyNameSchema = z.object({
  name: z.string().trim().min(1).max(40).optional(),
});

export const chatSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().trim().min(1).max(4000),
      }),
    )
    .min(1)
    .max(20),
});
