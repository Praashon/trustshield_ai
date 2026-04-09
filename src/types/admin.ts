import type { AdminActionType } from './database';

export interface AdminUserFilter {
  page: number;
  limit: number;
}

export interface AdminScanFilter {
  page: number;
  limit: number;
}

export interface QuotaUpdateRequest {
  scan_quota: number;
}

export interface AdminContentRequest {
  title: string;
  content_type: 'example' | 'simulation' | 'tip';
  body: string;
  is_phishing: boolean;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface AdminActionLog {
  action_type: AdminActionType;
  target_id: string | null;
  target_type: string | null;
  note: string | null;
}
