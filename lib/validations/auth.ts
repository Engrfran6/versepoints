import {z} from "zod";

const passwordRules = {
  minLength: 8,
  maxLength: 20,
  upper: /[A-Z]/,
  lower: /[a-z]/,
  number: /[0-9]/,
};

export const passwordRequirements = [
  {test: (p: string) => p.length >= passwordRules.minLength, label: "At least 8 characters"},
  // {
  //   test: (p: string) => p.length <= passwordRules.maxLength,
  //   label: "Password must be less than 20 characters",
  // },
  {
    test: (p: string) => passwordRules.upper.test(p),
    label: "contain at least one uppercase letter",
  },
  {
    test: (p: string) => passwordRules.lower.test(p),
    label: "contain at least one lowercase letter",
  },
  {test: (p: string) => passwordRules.number.test(p), label: "contain at least one number"},
  {
    test: (p: string) => /[^a-zA-Z0-9]/.test(p),
    label: "Special characters allowed (recommended)",
    optional: true,
  },
];

export const passwordSchema = z
  .string()
  .min(passwordRules.minLength, "Password must be at least 8 characters")
  .regex(passwordRules.upper, "Must contain an uppercase letter")
  .regex(passwordRules.lower, "Must contain a lowercase letter")
  .regex(passwordRules.number, "Must contain a number");

export const signUpSchema = z
  .object({
    email: z.string().trim().email("Please enter a valid email address").toLowerCase(),

    username: z
      .string()
      .trim()
      .min(3, "Username must be at least 3 characters")
      .max(20, "Username must be at most 20 characters")
      .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, and underscores"),

    password: passwordSchema,

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
