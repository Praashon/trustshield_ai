import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse } from '@/lib/utils/apiResponse';
import { scanRequestSchema } from '@/lib/validators/scan';
import { validateAndSanitize } from '@/lib/utils/sanitize';
import { runRuleEngine } from '@/lib/ai/ruleEngine';
import { checkAndIncrementQuota } from '@/lib/ai/quotaGuard';
import { callOpenRouter } from '@/lib/ai/openrouter';
import { buildScanPrompt, SYSTEM_PROMPT } from '@/lib/ai/promptBuilder';
import { parseAIResponse } from '@/lib/ai/parseResponse';
import { AppError } from '@/lib/utils/errors';
import type { RiskLevel } from '@/types/database';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return errorResponse('UNAUTHORIZED', undefined, 401);
    }

    const body = await request.json();
    const parsed = scanRequestSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse('INVALID_INPUT', parsed.error.issues[0]?.message);
    }

    const { input, input_type } = parsed.data;

    let sanitizedInput: string;
    try {
      sanitizedInput = validateAndSanitize(input);
    } catch (err) {
      if (err instanceof AppError) {
        return errorResponse(err.code, err.message);
      }
      return errorResponse('INVALID_INPUT');
    }

    const ruleResult = runRuleEngine(sanitizedInput, input_type);

    let aiExplanation: string | null = null;
    let rawAiOutput: Record<string, unknown> | null = null;
    let finalRiskLevel: RiskLevel = ruleResult.risk_level;
    let finalScore = ruleResult.risk_score;
    let reasons = ruleResult.flags;
    let advice: string[] = [];
    let modelUsed = 'rule-engine';
    let latencyMs = 0;

    try {
      await checkAndIncrementQuota(user.id);

      const prompt = buildScanPrompt({ input: sanitizedInput, input_type });
      const aiResponse = await callOpenRouter(SYSTEM_PROMPT, prompt);
      const aiResult = parseAIResponse(aiResponse.content);

      aiExplanation = aiResult.explanation;
      rawAiOutput = aiResult as unknown as Record<string, unknown>;
      finalRiskLevel = aiResult.risk;
      finalScore = aiResult.score;
      reasons = [...ruleResult.flags, ...aiResult.reasons];
      advice = aiResult.advice;
      modelUsed = aiResponse.model;
      latencyMs = aiResponse.latencyMs;
    } catch (err) {
      if (err instanceof AppError && err.code === 'RATE_LIMIT_EXCEEDED') {
        aiExplanation = 'AI analysis unavailable -- showing rule-based result only. Daily scan limit reached.';
      } else {
        console.error('[Scan API] AI analysis failed:', err);
        aiExplanation = 'AI analysis unavailable -- showing rule-based result only.';
      }
    }

    const { data: scan, error: scanError } = await supabase
      .from('scans')
      .insert({
        user_id: user.id,
        input: sanitizedInput,
        input_type,
        risk_level: finalRiskLevel,
        rule_flags: ruleResult.flags,
        ai_explanation: aiExplanation,
        raw_ai_output: rawAiOutput,
      })
      .select()
      .single();

    if (scanError) {
      console.error('[Scan API] Insert scan failed:', scanError);
      try { require('fs').appendFileSync('api-error.log', JSON.stringify({type: 'scanError', err: scanError}) + '\n'); } catch (e) {}
      return errorResponse('INTERNAL_ERROR', scanError.message || JSON.stringify(scanError), 500);
    }

    await supabase.from('analysis_results').insert({
      scan_id: scan.id,
      risk_score: finalScore,
      reasons,
      explanation: aiExplanation || 'Analysis completed.',
      advice,
      model_used: modelUsed,
      latency_ms: latencyMs,
    });

    return successResponse({
      scan_id: scan.id,
      risk_level: finalRiskLevel,
      rule_flags: ruleResult.flags,
      ai_explanation: aiExplanation,
      score: finalScore,
      reasons,
      advice,
    }, 201);
  } catch (err) {
    console.error('[Scan API] Unexpected error:', err);
    try { require('fs').appendFileSync('api-error.log', JSON.stringify({type: 'unexpected', err: err instanceof Error ? err.stack : err}) + '\n'); } catch (e) {}
    return errorResponse('INTERNAL_ERROR', err instanceof Error ? err.message : JSON.stringify(err), 500);
  }
}
