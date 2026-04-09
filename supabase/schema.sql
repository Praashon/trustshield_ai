-- TrustShield AI Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  scan_quota INT NOT NULL DEFAULT 10,
  scans_today INT NOT NULL DEFAULT 0,
  quota_reset_at TIMESTAMPTZ DEFAULT (now() + interval '1 day'),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Scans table
CREATE TABLE public.scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  input TEXT NOT NULL,
  input_type TEXT NOT NULL CHECK (input_type IN ('url', 'text', 'email')),
  risk_level TEXT NOT NULL CHECK (risk_level IN ('safe', 'suspicious', 'dangerous')),
  rule_flags JSONB DEFAULT '[]'::jsonb,
  ai_explanation TEXT,
  raw_ai_output JSONB,
  is_saved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_scans_user_created ON public.scans (user_id, created_at DESC);
CREATE INDEX idx_scans_risk_level ON public.scans (risk_level);

-- Analysis Results table
CREATE TABLE public.analysis_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id UUID NOT NULL UNIQUE REFERENCES public.scans(id) ON DELETE CASCADE,
  risk_score INT NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
  reasons JSONB NOT NULL DEFAULT '[]'::jsonb,
  explanation TEXT NOT NULL,
  advice JSONB NOT NULL DEFAULT '[]'::jsonb,
  model_used TEXT NOT NULL,
  latency_ms INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Learning Content table
CREATE TABLE public.learning_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('example', 'simulation', 'tip')),
  body TEXT NOT NULL,
  is_phishing BOOLEAN NOT NULL DEFAULT false,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Quiz Attempts table
CREATE TABLE public.quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES public.learning_content(id) ON DELETE CASCADE,
  user_answer BOOLEAN NOT NULL,
  is_correct BOOLEAN NOT NULL,
  ai_feedback TEXT,
  time_taken_ms INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_quiz_user_created ON public.quiz_attempts (user_id, created_at DESC);

-- Admin Actions table (append-only)
CREATE TABLE public.admin_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES public.users(id),
  action_type TEXT NOT NULL CHECK (action_type IN ('ban_user', 'add_content', 'delete_scan', 'adjust_quota')),
  target_id UUID,
  target_type TEXT,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to handle new user creation from auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NULL)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Row Level Security Policies

-- Users: users can read/update their own profile
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all users"
  ON public.users FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update all users"
  ON public.users FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Scans: users can CRUD their own scans
ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own scans"
  ON public.scans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scans"
  ON public.scans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scans"
  ON public.scans FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all scans"
  ON public.scans FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Analysis Results: inherit access from scans
ALTER TABLE public.analysis_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own analysis results"
  ON public.analysis_results FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.scans WHERE scans.id = analysis_results.scan_id AND scans.user_id = auth.uid())
  );

CREATE POLICY "Users can insert analysis results for own scans"
  ON public.analysis_results FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.scans WHERE scans.id = analysis_results.scan_id AND scans.user_id = auth.uid())
  );

CREATE POLICY "Admins can view all analysis results"
  ON public.analysis_results FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Learning Content: readable by all, writable by admins
ALTER TABLE public.learning_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view learning content"
  ON public.learning_content FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert learning content"
  ON public.learning_content FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update learning content"
  ON public.learning_content FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Quiz Attempts: users can CRUD their own attempts
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own attempts"
  ON public.quiz_attempts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own attempts"
  ON public.quiz_attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all attempts"
  ON public.quiz_attempts FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Admin Actions: admins only, append-only (no delete)
ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view admin actions"
  ON public.admin_actions FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can insert admin actions"
  ON public.admin_actions FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Seed initial learning content
INSERT INTO public.learning_content (title, content_type, body, is_phishing, difficulty) VALUES
  ('Legitimate Bank Email', 'example', 'Dear Customer, Your monthly statement for March 2026 is now available. You can view it by logging into your account at bankofamerica.com. If you have any questions, please call us at 1-800-432-1000. Regards, Bank of America', false, 'beginner'),
  ('Suspicious Password Reset', 'example', 'URGENT: Your account has been compromised! Click here IMMEDIATELY to verify your identity and reset your password: http://secure-bank-login.tk/reset?id=38291. Failure to act within 24 hours will result in permanent account suspension.', true, 'beginner'),
  ('PayPal Phishing Email', 'example', 'We noticed unusual activity in your PayP@l account. Please confirm your identity by clicking the link below: http://paypa1-secure.com/verify. If you do not verify within 12 hours, your account will be limited.', true, 'intermediate'),
  ('Legitimate Shipping Notification', 'example', 'Your order #29384 has shipped via UPS. Tracking number: 1Z999AA10123456784. Expected delivery: April 15, 2026. Track your package at ups.com/track. Thank you for shopping with us.', false, 'beginner'),
  ('CEO Fraud Attempt', 'example', 'Hi, this is the CEO. I need you to urgently transfer $5,000 to this account for a confidential business deal. Do not tell anyone about this. Wire the money to: Account 29384728, Routing 110000. Reply ASAP.', true, 'advanced'),
  ('Legitimate Newsletter', 'example', 'This week in tech: AI advances in cybersecurity, new open-source tools for developers, and a recap of the latest conference talks. Unsubscribe anytime at the bottom of this email. -- TechWeekly Newsletter', false, 'intermediate'),
  ('Fake Prize Notification', 'example', 'Congratulations! You have been selected as the winner of our $1,000,000 sweepstakes! To claim your prize, click the link below and provide your full name, address, and bank details: http://bit.ly/claim-prize-now', true, 'beginner'),
  ('Spotting URL Red Flags', 'tip', 'Always check the domain in a URL before clicking. Phishing URLs often use misspellings (gooogle.com), extra subdomains (login.secure.bank.fakesite.com), or IP addresses instead of domain names. Hover over links to preview the actual destination.', false, 'beginner'),
  ('Understanding Social Engineering', 'tip', 'Phishing attacks exploit human psychology: urgency ("act now!"), authority ("this is IT support"), and fear ("your account will be deleted"). Recognize these emotional triggers and pause before acting on them.', false, 'intermediate'),
  ('Advanced: Homoglyph Attacks', 'tip', 'Attackers can use characters from other alphabets that look identical to Latin letters. For example, the Cyrillic "a" looks the same as the Latin "a" but is a different character. This makes URLs like "paypal.com" look legitimate when they actually point to a different domain.', false, 'advanced');
