import type { InputType, RiskLevel } from './database';

export interface AIAnalysisResult {
  risk: RiskLevel;
  score: number;
  reasons: string[];
  explanation: string;
  advice: string[];
}

export interface ScanPromptInput {
  input: string;
  input_type: InputType;
}

export interface ScanRequest {
  input: string;
  input_type: InputType;
  use_pure_js?: boolean;
  client_ai_result?: {
    explanation: string;
    risk: RiskLevel;
    score: number;
    reasons: string[];
    advice: string[];
    modelUsed: string;
    latencyMs: number;
  };
}

export interface ScanResponse {
  scan_id: string;
  risk_level: RiskLevel;
  rule_flags: string[];
  ai_explanation: string | null;
}

export interface ScanProgressEvent {
  step: string;
  percent: number;
}

export interface ScanCompleteEvent {
  scan_id: string;
  risk_level: RiskLevel;
  summary: string;
}

export interface ScanErrorEvent {
  code: string;
  message: string;
}

export interface ScanHintEvent {
  flags: string[];
  severity: 'low' | 'medium' | 'high';
}

export interface RuleEngineResult {
  flags: string[];
  severity: 'low' | 'medium' | 'high';
  risk_level: RiskLevel;
  risk_score: number;
}
