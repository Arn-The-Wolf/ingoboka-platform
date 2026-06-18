import { z } from 'zod';

export const phoneSchema = z
  .string()
  .min(10, 'Phone number is required')
  .regex(/^07\d{8}$/, 'Use format 07XXXXXXXX');

export const loginSchema = z.object({
  identifier: z.string().min(1, 'Phone or email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z
  .object({
    fullName: z.string().min(2, 'Full name is required'),
    phone: phoneSchema,
    nationalId: z.string().min(16, 'National ID must be 16 digits').max(16),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const otpSchema = z.object({
  code: z
    .string()
    .length(6, 'Code must be 6 digits')
    .regex(/^\d{6}$/, 'Code must be numeric'),
});

export const consentSchema = z.object({
  dataProcessing: z.literal(true, {
    errorMap: () => ({ message: 'Data processing consent is required' }),
  }),
  marketing: z.boolean().optional(),
  termsAccepted: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the terms' }),
  }),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type OtpFormData = z.infer<typeof otpSchema>;
export type ConsentFormData = z.infer<typeof consentSchema>;
