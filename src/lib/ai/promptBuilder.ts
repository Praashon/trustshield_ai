export type ScanPromptInput = {
  input: string;
  input_type: 'url' | 'text' | 'email';
};

export const SYSTEM_PROMPT = `
You are a cybersecurity analyst specializing in phishing detection.
Analyze user-provided content and return a structured JSON response only.
Do not include any explanatory text outside the JSON block.
Be concise, accurate, and avoid hallucination.
`.trim();

export function buildScanPrompt(data: ScanPromptInput): string {
  return `
Analyze the following ${data.input_type} for phishing indicators.

INPUT:
"""
${data.input}
"""

Respond ONLY with valid JSON in exactly this format:
{
  "risk": "safe" | "suspicious" | "dangerous",
  "score": <integer 0-100>,
  "reasons": ["<reason 1>", "<reason 2>"],
  "explanation": "<2-3 sentence plain-English summary>",
  "advice": ["<action 1>", "<action 2>"]
}
  `.trim();
}

export function buildQuizFeedbackPrompt(
  content: string,
  isPhishing: boolean,
  userAnswer: boolean
): string {
  const isCorrect = userAnswer === isPhishing;
  return `
The user was shown the following content and asked if it was a phishing attempt:

CONTENT:
"""
${content}
"""

The correct answer is: ${isPhishing ? 'Yes, this IS phishing' : 'No, this is NOT phishing'}.
The user answered: ${userAnswer ? 'Yes (phishing)' : 'No (not phishing)'}.
The user was ${isCorrect ? 'CORRECT' : 'INCORRECT'}.

Provide a brief, educational explanation (2-3 sentences) about why this ${isPhishing ? 'is' : 'is not'} phishing. ${!isCorrect ? 'Help the user understand what they missed.' : 'Reinforce what they noticed correctly.'}

Respond with plain text only, no JSON.
  `.trim();
}
