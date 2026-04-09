import type { LearningContent } from '@/types/database';
import type { QuizAnswerResponse } from '@/types/learn';

const BASE_URL = '/api/learn';

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error?.message || 'An unknown error occurred');
  }
  return data.data;
}

export async function getLearningContent(
  params: { difficulty?: string; type?: string } = {},
  signal?: AbortSignal
): Promise<LearningContent[]> {
  const searchParams = new URLSearchParams();
  if (params.difficulty) searchParams.set('difficulty', params.difficulty);
  if (params.type) searchParams.set('type', params.type);

  const response = await fetch(`${BASE_URL}/content?${searchParams}`, { signal });
  return handleResponse<LearningContent[]>(response);
}

export async function submitQuizAttempt(
  contentId: string,
  userAnswer: boolean,
  signal?: AbortSignal
): Promise<QuizAnswerResponse> {
  const response = await fetch(`${BASE_URL}/attempt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content_id: contentId, user_answer: userAnswer }),
    signal,
  });
  return handleResponse<QuizAnswerResponse>(response);
}
