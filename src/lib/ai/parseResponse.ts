import { z } from 'zod';
import type { AIAnalysisResult } from '@/types/scan';

const AIResultSchema = z.object({
  risk: z.enum(['safe', 'suspicious', 'dangerous']),
  score: z.number().int().min(0).max(100),
  reasons: z.array(z.string()).min(1).max(5),
  explanation: z.string().min(10),
  advice: z.array(z.string()).min(1).max(4),
});

export function parseAIResponse(raw: string): AIAnalysisResult {
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('AI_PARSE_FAILURE');
  }

  const cleaned = jsonMatch[0]
    .replace(/:\s*"safe"\s*\|\s*"suspicious"\s*\|\s*"dangerous"/g, ': "suspicious"')
    .replace(/"risk"\s*:\s*"([^"]*?)"\s*\|\s*"([^"]*?)"\s*\|\s*"([^"]*?)"/g, '"risk": "$1"')
    .replace(/<[^>]+>/g, '');

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    const riskMatch = raw.match(/"risk"\s*:\s*"(safe|suspicious|dangerous)"/);
    const scoreMatch = raw.match(/"score"\s*:\s*(\d+)/);
    const reasonsMatch = raw.match(/"reasons"\s*:\s*\[([\s\S]*?)\]/);
    const explanationMatch = raw.match(/"explanation"\s*:\s*"([\s\S]*?)"/);
    const adviceMatch = raw.match(/"advice"\s*:\s*\[([\s\S]*?)\]/);

    if (!riskMatch || !scoreMatch) {
      throw new Error('AI_PARSE_FAILURE');
    }

    parsed = {
      risk: riskMatch[1],
      score: parseInt(scoreMatch[1], 10),
      reasons: reasonsMatch
        ? reasonsMatch[1].match(/"([^"]+)"/g)?.map((s) => s.replace(/"/g, '')) || ['Analysis completed']
        : ['Analysis completed'],
      explanation: explanationMatch?.[1] || 'Analysis completed successfully.',
      advice: adviceMatch
        ? adviceMatch[1].match(/"([^"]+)"/g)?.map((s) => s.replace(/"/g, '')) || ['Exercise caution']
        : ['Exercise caution'],
    };
  }

  return AIResultSchema.parse(parsed);
}
