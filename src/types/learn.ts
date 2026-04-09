import type { ContentType, Difficulty } from './database';

export interface LearningContentFilter {
  difficulty?: Difficulty;
  type?: ContentType;
}

export interface QuizAnswerRequest {
  content_id: string;
  user_answer: boolean;
}

export interface QuizAnswerResponse {
  is_correct: boolean;
  ai_feedback: string;
}
