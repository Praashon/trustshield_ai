export type ErrorCode =
  | 'INVALID_INPUT'
  | 'EMPTY_INPUT'
  | 'INPUT_TOO_LONG'
  | 'INVALID_URL'
  | 'AI_TIMEOUT'
  | 'AI_PARSE_FAILURE'
  | 'AI_SERVICE_UNAVAILABLE'
  | 'RATE_LIMIT_EXCEEDED'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'INTERNAL_ERROR'
  | 'PROMPT_INJECTION';

export class AppError extends Error {
  constructor(public code: ErrorCode, message: string) {
    super(message);
    this.name = 'AppError';
  }
}

export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  EMPTY_INPUT: 'Please enter a URL, message, or email to scan.',
  INVALID_INPUT: 'The input you provided is not valid. Please check and try again.',
  INPUT_TOO_LONG: 'Input exceeds the 2,000 character limit. Please shorten it.',
  INVALID_URL: 'That does not look like a valid URL. Check the format and try again.',
  AI_TIMEOUT: 'The AI took too long to respond. Showing rule-based result only.',
  AI_PARSE_FAILURE: 'AI returned an unexpected format. Showing rule-based result only.',
  AI_SERVICE_UNAVAILABLE: 'AI service is currently unavailable. Showing rule-based result only.',
  RATE_LIMIT_EXCEEDED: 'You have reached your daily scan limit. It resets at midnight.',
  UNAUTHORIZED: 'You must be signed in to perform this action.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  INTERNAL_ERROR: 'Something went wrong on our end. Please try again.',
  PROMPT_INJECTION: 'Your input contains disallowed patterns and was rejected.',
};
