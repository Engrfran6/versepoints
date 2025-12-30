import {z} from "zod";

export const passwordRules = {
  minLength: 8,
  upper: /[A-Z]/,
  lower: /[a-z]/,
  number: /[0-9]/,
};

export const signUpSchema = z
  .object({
    email: z.string().trim().email("Please enter a valid email address").toLowerCase(),

    username: z
      .string()
      .trim()
      .min(3, "Username must be at least 3 characters")
      .max(20, "Username must be at most 20 characters")
      .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, and underscores"),

    password: z
      .string()
      .min(passwordRules.minLength, "Password must be at least 8 characters")
      .regex(passwordRules.upper, "Must contain an uppercase letter")
      .regex(passwordRules.lower, "Must contain a lowercase letter")
      .regex(passwordRules.number, "Must contain a number"),

    confirmPassword: z.string(),

    referralCode: z
      .string()
      .trim()
      .toUpperCase()
      .optional()
      .refine((val) => !val || /^[A-Z0-9]{4,12}$/.test(val), "Invalid referral code format"),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        path: ["confirmPassword"],
        message: "Passwords do not match",
        code: z.ZodIssueCode.custom,
      });
    }
  });

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ResetPasswordInput = z.infer<typeof forgotPasswordSchema>;
