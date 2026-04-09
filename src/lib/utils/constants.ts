export const APP_NAME = 'TrustShield AI';
export const APP_DESCRIPTION = 'AI-Powered Phishing Detection and Awareness Platform';

export const DEFAULT_SCAN_QUOTA = 10;
export const MAX_INPUT_LENGTH = 2000;
export const AI_TIMEOUT_MS = 10000;
export const DEBOUNCE_TYPING_MS = 600;
export const SCAN_CACHE_SIZE = 20;

export const RISK_COLORS = {
  safe: { bg: 'hsl(142, 71%, 45%)', text: '#166534' },
  suspicious: { bg: 'hsl(45, 93%, 47%)', text: '#92400e' },
  dangerous: { bg: 'hsl(0, 84%, 60%)', text: '#991b1b' },
} as const;

export const SCAN_STEPS = [
  'Validating input',
  'Checking domain structure',
  'Running rule engine',
  'Sending to AI',
  'Parsing AI response',
  'Storing result',
] as const;

export const LINK_SHORTENERS = [
  'bit.ly',
  'tinyurl.com',
  't.co',
  'goo.gl',
  'ow.ly',
  'is.gd',
  'buff.ly',
  'j.mp',
  'rb.gy',
  'cutt.ly',
  'shorturl.at',
  'tiny.cc',
];

export const PHISHING_KEYWORDS = [
  'urgent',
  'verify',
  'account',
  'confirm',
  'suspend',
  'login',
  'bank',
  'update',
  'password',
  'security',
  'alert',
  'locked',
  'expire',
  'immediately',
  'click here',
  'act now',
  'limited time',
  'unusual activity',
  'unauthorized',
  'validate',
];
