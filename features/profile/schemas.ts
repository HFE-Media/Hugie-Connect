import { z } from "zod";

const mobileNumberPattern = /^\+?[0-9][0-9\s().-]{6,24}$/;

export const profileUpdateSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, "Enter your first name.")
    .max(80, "First name must be 80 characters or fewer."),
  lastName: z
    .string()
    .trim()
    .min(1, "Enter your last name.")
    .max(80, "Last name must be 80 characters or fewer."),
  mobile: z
    .string()
    .trim()
    .max(32, "Mobile number must be 32 characters or fewer.")
    .optional()
    .transform((value) => value || null)
    .refine(
      (value) => !value || mobileNumberPattern.test(value),
      "Enter a valid mobile number.",
    ),
});

export const changePasswordSchema = z
  .object({
    password: z
      .string()
      .min(10, "Use at least 10 characters.")
      .regex(/[a-z]/, "Include a lowercase letter.")
      .regex(/[A-Z]/, "Include an uppercase letter.")
      .regex(/[0-9]/, "Include a number.")
      .regex(/[^A-Za-z0-9]/, "Include a symbol."),
    confirmPassword: z.string(),
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "The password confirmation does not match.",
  });

export type ProfileUpdateValues = z.infer<typeof profileUpdateSchema>;
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;
