import { AppError } from './errors';

const PROMPT_INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?previous\s+instructions/i,
  /ignore\s+(all\s+)?above/i,
  /system\s*:/i,
  /<\|im_start\|>/i,
  /<\|im_end\|>/i,
  /\[INST\]/i,
  /\[\/INST\]/i,
  /<<SYS>>/i,
  /you\s+are\s+now/i,
  /pretend\s+you\s+are/i,
  /act\s+as\s+if/i,
  /disregard\s+(all\s+)?(previous|prior)/i,
  /new\s+instructions:/i,
];

const MAX_INPUT_LENGTH = 2000;

export function sanitizeInput(input: string): string {
  let sanitized = input.trim();

  sanitized = sanitized
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  return sanitized;
}

export function validateInputLength(input: string): void {
  if (!input || input.trim().length === 0) {
    throw new AppError('EMPTY_INPUT', 'Input cannot be empty.');
  }
  if (input.length > MAX_INPUT_LENGTH) {
    throw new AppError('INPUT_TOO_LONG', `Input exceeds ${MAX_INPUT_LENGTH} character limit.`);
  }
}

export function detectPromptInjection(input: string): boolean {
  return PROMPT_INJECTION_PATTERNS.some((pattern) => pattern.test(input));
}

export function validateAndSanitize(input: string): string {
  validateInputLength(input);

  if (detectPromptInjection(input)) {
    throw new AppError('PROMPT_INJECTION', 'Input contains disallowed patterns.');
  }

  return sanitizeInput(input);
}

export function isValidUrl(input: string): boolean {
  try {
    const url = new URL(input);
    return ['http:', 'https:'].includes(url.protocol);
  } catch {
    return false;
  }
}
