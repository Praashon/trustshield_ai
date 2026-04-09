export type UserRole = 'user' | 'admin';
export type InputType = 'url' | 'text' | 'email';
export type RiskLevel = 'safe' | 'suspicious' | 'dangerous';
export type ContentType = 'example' | 'simulation' | 'tip';
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';
export type AdminActionType = 'ban_user' | 'add_content' | 'delete_scan' | 'adjust_quota';

export interface User {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  scan_quota: number;
  scans_today: number;
  quota_reset_at: string;
  created_at: string;
  updated_at: string;
}

export interface Scan {
  id: string;
  user_id: string;
  input: string;
  input_type: InputType;
  risk_level: RiskLevel;
  rule_flags: string[];
  ai_explanation: string | null;
  raw_ai_output: Record<string, unknown> | null;
  is_saved: boolean;
  created_at: string;
}

export interface AnalysisResult {
  id: string;
  scan_id: string;
  risk_score: number;
  reasons: string[];
  explanation: string;
  advice: string[];
  model_used: string;
  latency_ms: number;
  created_at: string;
}

export interface LearningContent {
  id: string;
  title: string;
  content_type: ContentType;
  body: string;
  is_phishing: boolean;
  difficulty: Difficulty;
  created_by: string;
  created_at: string;
}

export interface QuizAttempt {
  id: string;
  user_id: string;
  content_id: string;
  user_answer: boolean;
  is_correct: boolean;
  ai_feedback: string | null;
  time_taken_ms: number;
  created_at: string;
}

export interface AdminAction {
  id: string;
  admin_id: string;
  action_type: AdminActionType;
  target_id: string | null;
  target_type: string | null;
  note: string | null;
  created_at: string;
}

export interface ScanWithAnalysis extends Scan {
  analysis_result: AnalysisResult | null;
}

export interface UserWithStats extends User {
  scan_count: number;
}
