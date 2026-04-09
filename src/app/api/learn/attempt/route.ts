import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse } from '@/lib/utils/apiResponse';
import { quizAttemptSchema } from '@/lib/validators/learn';
import { callOpenRouter } from '@/lib/ai/openrouter';
import { buildQuizFeedbackPrompt, SYSTEM_PROMPT } from '@/lib/ai/promptBuilder';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return errorResponse('UNAUTHORIZED', undefined, 401);
    }

    const body = await request.json();
    const parsed = quizAttemptSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse('INVALID_INPUT', parsed.error.issues[0]?.message);
    }

    const { content_id, user_answer } = parsed.data;

    const { data: content, error: contentError } = await supabase
      .from('learning_content')
      .select('*')
      .eq('id', content_id)
      .single();

    if (contentError || !content) {
      return errorResponse('NOT_FOUND', 'Learning content not found.', 404);
    }

    const isCorrect = user_answer === content.is_phishing;

    let aiFeedback = isCorrect
      ? 'Correct! You identified this content accurately.'
      : 'Incorrect. Review the content carefully for phishing indicators.';

    try {
      const prompt = buildQuizFeedbackPrompt(content.body, content.is_phishing, user_answer);
      const aiResponse = await callOpenRouter(SYSTEM_PROMPT, prompt);
      aiFeedback = aiResponse.content;
    } catch (err) {
      console.error('[Quiz] AI feedback failed:', err);
    }

    await supabase.from('quiz_attempts').insert({
      user_id: user.id,
      content_id,
      user_answer,
      is_correct: isCorrect,
      ai_feedback: aiFeedback,
      time_taken_ms: 0,
    });

    return successResponse({
      is_correct: isCorrect,
      ai_feedback: aiFeedback,
    });
  } catch (err) {
    console.error('[Quiz] Error:', err);
    return errorResponse('INTERNAL_ERROR', undefined, 500);
  }
}
