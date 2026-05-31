import { z } from "zod";

// Phone validation pattern for Indian mobile numbers
const phoneRegex = /^[6-9]\d{9}$/;

export const guestSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  phone: z.string().regex(phoneRegex, "Must be a valid 10-digit mobile number starting with 6-9."),
  address: z.string().min(5, "Address must be at least 5 characters."),
  village: z.string().min(2, "Village/Area must be at least 2 characters."),
  city: z.string().min(2, "City must be at least 2 characters."),
  state: z.string().default("Andhra Pradesh"),
  pincode: z.string().length(6, "Pincode must be exactly 6 digits."),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  notes: z.string().optional(),
  status: z.enum(["Pending", "Assigned", "Distributed"]).default("Pending"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address."),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters."),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters."),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

export const userRegistrationSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters."),
  email: z.string().email("Invalid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  role: z.enum(["Admin", "Distributor"]).default("Distributor"),
});

export type GuestFormData = z.infer<typeof guestSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegistrationFormData = z.infer<typeof userRegistrationSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
