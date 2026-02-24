-- Wedding Roadmap Database Schema
-- Supabase PostgreSQL with Row Level Security (RLS)

-- ===========================================
-- Tasks Table
-- ===========================================
CREATE TABLE IF NOT EXISTS weddingroadmap_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id TEXT NOT NULL,
  category_id TEXT NOT NULL,
  phase_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped')),
  recommended_timing TEXT NOT NULL DEFAULT '',
  months_before INTEGER NOT NULL DEFAULT 0,
  calculated_deadline DATE,
  subtasks JSONB NOT NULL DEFAULT '[]',
  notes JSONB NOT NULL DEFAULT '[]',
  budget_estimate_min INTEGER NOT NULL DEFAULT 0,
  budget_estimate_max INTEGER NOT NULL DEFAULT 0,
  actual_cost INTEGER,
  memo TEXT NOT NULL DEFAULT '',
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Composite indexes cover single-column user_id lookups
CREATE INDEX IF NOT EXISTS idx_weddingroadmap_tasks_status ON weddingroadmap_tasks(user_id, status);
CREATE INDEX IF NOT EXISTS idx_weddingroadmap_tasks_phase ON weddingroadmap_tasks(user_id, phase_id);
CREATE INDEX IF NOT EXISTS idx_weddingroadmap_tasks_category ON weddingroadmap_tasks(user_id, category_id);

-- RLS
ALTER TABLE weddingroadmap_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tasks"
  ON weddingroadmap_tasks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tasks"
  ON weddingroadmap_tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks"
  ON weddingroadmap_tasks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks"
  ON weddingroadmap_tasks FOR DELETE
  USING (auth.uid() = user_id);

-- ===========================================
-- Prenup Items Table
-- ===========================================
CREATE TABLE IF NOT EXISTS weddingroadmap_prenup_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  section_id TEXT NOT NULL CHECK (section_id IN ('assets', 'debts', 'income', 'property', 'housework', 'lifestyle', 'communication', 'family', 'career_life', 'other')),
  label TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  completed BOOLEAN NOT NULL DEFAULT false,
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Composite index for user + section queries
CREATE INDEX IF NOT EXISTS idx_weddingroadmap_prenup_user_section ON weddingroadmap_prenup_items(user_id, section_id);

-- RLS
ALTER TABLE weddingroadmap_prenup_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own prenup items"
  ON weddingroadmap_prenup_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own prenup items"
  ON weddingroadmap_prenup_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own prenup items"
  ON weddingroadmap_prenup_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own prenup items"
  ON weddingroadmap_prenup_items FOR DELETE
  USING (auth.uid() = user_id);

-- ===========================================
-- Profiles Table (Settings)
-- ===========================================
CREATE TABLE IF NOT EXISTS weddingroadmap_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  wedding_date DATE,
  partner1_name TEXT NOT NULL DEFAULT '',
  partner2_name TEXT NOT NULL DEFAULT '',
  language TEXT NOT NULL DEFAULT 'ja' CHECK (language IN ('ja', 'en')),
  total_budget INTEGER NOT NULL DEFAULT 3500000,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_premium BOOLEAN NOT NULL DEFAULT false,
  stripe_customer_id TEXT,
  stripe_payment_id TEXT,
  premium_activated_at TIMESTAMPTZ
);

-- RLS
ALTER TABLE weddingroadmap_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON weddingroadmap_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON weddingroadmap_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update own profile but NOT premium-related columns
-- (service_role used by Stripe webhook bypasses RLS entirely)
CREATE POLICY "Users can update own profile"
  ON weddingroadmap_profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND is_premium IS NOT DISTINCT FROM (SELECT p.is_premium FROM weddingroadmap_profiles p WHERE p.user_id = auth.uid())
    AND stripe_customer_id IS NOT DISTINCT FROM (SELECT p.stripe_customer_id FROM weddingroadmap_profiles p WHERE p.user_id = auth.uid())
    AND stripe_payment_id IS NOT DISTINCT FROM (SELECT p.stripe_payment_id FROM weddingroadmap_profiles p WHERE p.user_id = auth.uid())
    AND premium_activated_at IS NOT DISTINCT FROM (SELECT p.premium_activated_at FROM weddingroadmap_profiles p WHERE p.user_id = auth.uid())
  );

-- Auto-update updated_at on profile changes
CREATE OR REPLACE FUNCTION update_weddingroadmap_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_weddingroadmap_profiles_updated_at
  BEFORE UPDATE ON weddingroadmap_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_weddingroadmap_profiles_updated_at();
