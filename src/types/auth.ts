import type { User } from './database';
import type { Session } from '@supabase/supabase-js';

export interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  email: string;
  password: string;
  display_name: string;
}

export interface AuthResult {
  success: boolean;
  error?: string;
}
