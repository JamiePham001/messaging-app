import { object, string } from "zod";

export const signInSchema = object({
  email: string({ error: "Email is required" })
    .min(1, "Email is required")
    .email("Invalid email"),
  password: string({ error: "Password is required" })
    .min(1, "Password is required")
    .min(8, "Password must be more than 8 characters")
    .max(32, "Password must be less than 32 characters"),
});

export const registerSchema = object({
  email: string({ error: "Email is required" })
    .min(1, "Email is required")
    .email("Invalid email"),
  displayName: string()
    .max(16, "Display Name must be less than 16 characters")
    .regex(
      /^[a-zA-Z0-9_\-\s]+$/,
      "Display Name can only contain letters, numbers, underscores, hyphens, and spaces",
    ),
  username: string({ error: "Username is required" })
    .min(1, "Username is required")
    .max(16, "Username must be less than 16 characters")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Username can only contain letters, numbers, and underscores",
    )
    .refine((val) => !/^\d/.test(val), {
      message: "Username cannot start with a number",
    })
    .regex(/^\S+$/, "Username cannot contain spaces"),
  password: string({ error: "Password is required" })
    .min(1, "Password is required")
    .min(8, "Password must be 8 characters or more")
    .max(32, "Password must be less than 32 characters")
    .refine((val) => /^[A-Z]/.test(val), {
      message: "Password must start with an uppercase letter",
    })
    .refine((val) => /[!@#$%^&*(),.?":{}|<>]/.test(val), {
      message: "Password must include at least one special character",
    })
    .refine((val) => /[0-9]/.test(val), {
      message: "Password must include at least one number",
    }),
});
