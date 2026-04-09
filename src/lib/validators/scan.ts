import { z } from 'zod';

export const scanRequestSchema = z.object({
  input: z
    .string()
    .min(1, 'Input cannot be empty')
    .max(2000, 'Input exceeds 2,000 character limit'),
  input_type: z.enum(['url', 'text', 'email']),
  use_pure_js: z.boolean().optional(),
});

export const saveScanSchema = z.object({
  is_saved: z.boolean(),
});

export type ValidatedScanRequest = z.infer<typeof scanRequestSchema>;
