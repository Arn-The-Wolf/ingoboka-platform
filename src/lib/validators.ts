import { z } from 'zod';

export const phoneSchema = z
  .string()
  .min(10, 'Phone number is required')
  .regex(/^07\d{8}$/, 'Use format 07XXXXXXXX');

export const loginSchema = z
  .object({
    loginMethod: z.enum(['phone', 'email']),
    phone: z.string(),
    email: z.string(),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  })
  .superRefine((data, ctx) => {
    if (data.loginMethod === 'phone') {
      const result = phoneSchema.safeParse(data.phone);
      if (!result.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: result.error.errors[0]?.message ?? 'Invalid phone number',
          path: ['phone'],
        });
      }
    } else {
      const result = emailSchema.safeParse(data.email);
      if (!result.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: result.error.errors[0]?.message ?? 'Invalid email',
          path: ['email'],
        });
      }
    }
  });

export const emailSchema = z.string().email('Enter a valid email address');

export function createRegisterSchema(requiresEmail: boolean) {
  const optionalEmail = z
    .string()
    .trim()
    .refine((v) => v === '' || emailSchema.safeParse(v).success, {
      message: 'Enter a valid email address',
    });

  return z
    .object({
      firstName: z.string().trim().min(2, 'First name is required'),
      lastName: z.string().trim().min(2, 'Last name is required'),
      phone: phoneSchema,
      email: requiresEmail ? emailSchema : optionalEmail,
      nationalId: z
        .string()
        .regex(/^\d{16}$/, 'National ID must be 16 digits'),
      province: z.string().min(1, 'Province is required'),
      district: z.string().min(1, 'District is required'),
      sector: z.string().min(1, 'Sector is required'),
      cell: z.string().min(1, 'Cell is required'),
      village: z.string().min(1, 'Village is required'),
      password: z.string().min(8, 'Password must be at least 8 characters'),
      confirmPassword: z.string(),
      profilePictureUrl: z
        .string()
        .trim()
        .optional()
        .refine((v) => !v || v.startsWith('http://') || v.startsWith('https://'), {
          message: 'Profile picture URL must start with http:// or https://',
        }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    });
}

/** Default: email required (no SMS budget). */
export const registerSchema = createRegisterSchema(true);

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
export type RegisterFormData = z.infer<ReturnType<typeof createRegisterSchema>>;
export type OtpFormData = z.infer<typeof otpSchema>;
export type ConsentFormData = z.infer<typeof consentSchema>;
