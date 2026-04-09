import { z } from 'zod';

export const quizAttemptSchema = z.object({
  content_id: z.string().uuid('Invalid content ID'),
  user_answer: z.boolean(),
});

export const learningContentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content_type: z.enum(['example', 'simulation', 'tip']),
  body: z.string().min(1, 'Body is required'),
  is_phishing: z.boolean(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
});

export type ValidatedQuizAttempt = z.infer<typeof quizAttemptSchema>;
export type ValidatedLearningContent = z.infer<typeof learningContentSchema>;
