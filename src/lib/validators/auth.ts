import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const signupSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  display_name: z.string().min(2, 'Display name must be at least 2 characters'),
});

export type ValidatedLogin = z.infer<typeof loginSchema>;
export type ValidatedSignup = z.infer<typeof signupSchema>;
