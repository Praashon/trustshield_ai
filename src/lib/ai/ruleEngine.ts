import type { RuleEngineResult } from '@/types/scan';
import type { InputType } from '@/types/database';
import { LINK_SHORTENERS, PHISHING_KEYWORDS } from '@/lib/utils/constants';

const HOMOGLYPH_MAP: Record<string, string> = {
  '\u0430': 'a', '\u0435': 'e', '\u043e': 'o', '\u0440': 'p',
  '\u0441': 'c', '\u0443': 'y', '\u0445': 'x', '\u043d': 'h',
  '\u0456': 'i', '\u0458': 'j', '\u0455': 's', '\u0412': 'B',
  '\u041d': 'H', '\u041c': 'M', '\u0422': 'T', '\u041a': 'K',
};

function checkHomoglyphs(input: string): string[] {
  const flags: string[] = [];
  for (const char of input) {
    if (HOMOGLYPH_MAP[char]) {
      flags.push(`Homoglyph character detected: "${char}" resembles "${HOMOGLYPH_MAP[char]}"`);
      break;
    }
  }
  return flags;
}

function checkUrlStructure(input: string): string[] {
  const flags: string[] = [];

  try {
    const url = new URL(input);

    const ipv4Regex = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
    if (ipv4Regex.test(url.hostname)) {
      flags.push('IP address used instead of domain name');
    }

    if (url.port && !['80', '443', ''].includes(url.port)) {
      flags.push(`Non-standard port number: ${url.port}`);
    }

    const subdomains = url.hostname.split('.');
    if (subdomains.length > 4) {
      flags.push(`Excessive subdomains detected (${subdomains.length} levels)`);
    }

    if (url.href.includes('%') && /%[0-9a-fA-F]{2}/.test(url.href)) {
      const encoded = url.href.match(/%[0-9a-fA-F]{2}/g) || [];
      if (encoded.length > 3) {
        flags.push(`Excessive URL encoding detected (${encoded.length} encoded characters)`);
      }
    }

    if (url.pathname.includes('@')) {
      flags.push('URL contains @ symbol, possibly hiding the real destination');
    }

    const hostname = url.hostname.toLowerCase();
    const isShortener = LINK_SHORTENERS.some((s) => hostname === s || hostname.endsWith(`.${s}`));
    if (isShortener) {
      flags.push(`Link shortener detected: ${url.hostname}`);
    }

    if (url.hostname.includes('-') && url.hostname.split('-').length > 3) {
      flags.push('Suspicious use of multiple hyphens in domain');
    }

    const tld = url.hostname.split('.').pop() || '';
    if (!tld || tld.length < 2) {
      flags.push('Missing or invalid top-level domain');
    }
  } catch {
    flags.push('Invalid or malformed URL structure');
  }

  return flags;
}

function checkKeywords(input: string): string[] {
  const flags: string[] = [];
  const lowerInput = input.toLowerCase();

  const matched = PHISHING_KEYWORDS.filter((kw) => lowerInput.includes(kw));
  if (matched.length > 0) {
    flags.push(`Phishing keywords detected: ${matched.slice(0, 5).join(', ')}`);
  }

  if (matched.length >= 3) {
    flags.push(`High concentration of urgency/phishing keywords (${matched.length} found)`);
  }

  return flags;
}

function checkHtmlMismatch(input: string): string[] {
  const flags: string[] = [];

  const linkRegex = /<a\s[^>]*href=["']([^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match;
  while ((match = linkRegex.exec(input)) !== null) {
    const href = match[1];
    const displayText = match[2].replace(/<[^>]+>/g, '').trim();

    const urlRegex = /https?:\/\/[^\s]+/;
    if (urlRegex.test(displayText) && displayText !== href) {
      flags.push(`Display text URL does not match href: "${displayText}" vs "${href}"`);
    }
  }

  return flags;
}

export function runRuleEngine(input: string, inputType: InputType): RuleEngineResult {
  const flags: string[] = [];

  flags.push(...checkHomoglyphs(input));
  flags.push(...checkKeywords(input));

  if (inputType === 'url') {
    flags.push(...checkUrlStructure(input));
  }

  if (inputType === 'email' || inputType === 'text') {
    flags.push(...checkHtmlMismatch(input));
  }

  let riskScore = 0;
  riskScore += Math.min(flags.length * 15, 80);

  if (flags.some((f) => f.includes('Homoglyph'))) riskScore += 20;
  if (flags.some((f) => f.includes('IP address'))) riskScore += 15;
  if (flags.some((f) => f.includes('Display text URL does not match'))) riskScore += 25;
  if (flags.some((f) => f.includes('High concentration'))) riskScore += 15;

  riskScore = Math.min(riskScore, 100);

  let riskLevel: RuleEngineResult['risk_level'] = 'safe';
  let severity: RuleEngineResult['severity'] = 'low';

  if (riskScore >= 60) {
    riskLevel = 'dangerous';
    severity = 'high';
  } else if (riskScore >= 30) {
    riskLevel = 'suspicious';
    severity = 'medium';
  }

  return {
    flags,
    severity,
    risk_level: riskLevel,
    risk_score: riskScore,
  };
}
