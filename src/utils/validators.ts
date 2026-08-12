import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const signupSchema = z
  .object({
    first_name: z.string().min(2, 'First name is required'),
    last_name: z.string().min(2, 'Last name is required'),
    email: z.string().email('Enter a valid email address'),
    phone_number: z.string().optional(),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Include at least one uppercase letter')
      .regex(/[a-z]/, 'Include at least one lowercase letter')
      .regex(/[0-9]/, 'Include at least one number')
      .regex(/[^A-Za-z0-9]/, 'Include at least one symbol'),
    account_type: z.enum(['user', 'vendor']),
    store_name: z.string().optional(),
    description: z.string().optional(),
    current_sales_channel: z.string().optional(),
    agree_to_terms: z.literal(true, { message: 'You must accept the terms to continue' }),
  })
  .superRefine((data, ctx) => {
    if (data.account_type === 'vendor' && (!data.store_name || data.store_name.trim().length < 2)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['store_name'],
        message: 'Store name is required for vendor accounts',
      });
    }
  });

export type SignupFormValues = z.infer<typeof signupSchema>;

export const otpSchema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Enter a valid email address'),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Include at least one uppercase letter')
      .regex(/[a-z]/, 'Include at least one lowercase letter')
      .regex(/[0-9]/, 'Include at least one number')
      .regex(/[^A-Za-z0-9]/, 'Include at least one symbol'),
    confirm: z.string(),
  })
  .refine((data) => data.password === data.confirm, {
    message: 'Passwords do not match',
    path: ['confirm'],
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
