import { AI_TIMEOUT_MS } from '@/lib/utils/constants';
import { AppError } from '@/lib/utils/errors';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL = 'meta-llama/llama-3.3-70b-instruct:free';

interface OpenRouterResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export async function callOpenRouter(
  systemPrompt: string,
  userPrompt: string,
  model: string = DEFAULT_MODEL
): Promise<{ content: string; model: string; latencyMs: number }> {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new AppError('AI_SERVICE_UNAVAILABLE', 'OpenRouter API key not configured.');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);
  const startTime = Date.now();

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'X-Title': 'TrustShield AI',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.2,
        max_tokens: 512,
      }),
      signal: controller.signal,
    });

    const latencyMs = Date.now() - startTime;

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('[OpenRouter] API error:', response.status, errorBody);
      throw new AppError('AI_SERVICE_UNAVAILABLE', `OpenRouter returned ${response.status}`);
    }

    const data: OpenRouterResponse = await response.json();

    if (!data.choices?.[0]?.message?.content) {
      throw new AppError('AI_PARSE_FAILURE', 'Empty response from OpenRouter.');
    }

    return {
      content: data.choices[0].message.content,
      model,
      latencyMs,
    };
  } catch (error) {
    if (error instanceof AppError) throw error;

    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new AppError('AI_TIMEOUT', 'AI request timed out after 10 seconds.');
    }

    console.error('[OpenRouter] Unexpected error:', error);
    throw new AppError('AI_SERVICE_UNAVAILABLE', 'Failed to reach AI service.');
  } finally {
    clearTimeout(timeout);
  }
}
