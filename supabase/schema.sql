-- WeddingPlan Database Schema
-- Supabase PostgreSQL with Row Level Security (RLS)

-- ===========================================
-- Tasks Table
-- ===========================================
CREATE TABLE IF NOT EXISTS weddingplan_tasks (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id TEXT NOT NULL,
  category_id TEXT NOT NULL,
  phase_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped')),
  recommended_timing TEXT NOT NULL DEFAULT '',
  months_before INTEGER NOT NULL DEFAULT 0,
  calculated_deadline TEXT,
  subtasks JSONB NOT NULL DEFAULT '[]',
  notes JSONB NOT NULL DEFAULT '[]',
  budget_estimate_min NUMERIC NOT NULL DEFAULT 0,
  budget_estimate_max NUMERIC NOT NULL DEFAULT 0,
  actual_cost NUMERIC,
  memo TEXT NOT NULL DEFAULT '',
  completed_at TEXT,
  updated_at TEXT NOT NULL DEFAULT now()::TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast user queries
CREATE INDEX IF NOT EXISTS idx_weddingplan_tasks_user_id ON weddingplan_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_weddingplan_tasks_status ON weddingplan_tasks(user_id, status);
CREATE INDEX IF NOT EXISTS idx_weddingplan_tasks_phase ON weddingplan_tasks(user_id, phase_id);
CREATE INDEX IF NOT EXISTS idx_weddingplan_tasks_category ON weddingplan_tasks(user_id, category_id);

-- RLS
ALTER TABLE weddingplan_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tasks"
  ON weddingplan_tasks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tasks"
  ON weddingplan_tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks"
  ON weddingplan_tasks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks"
  ON weddingplan_tasks FOR DELETE
  USING (auth.uid() = user_id);

-- ===========================================
-- Prenup Items Table
-- ===========================================
CREATE TABLE IF NOT EXISTS weddingplan_prenup_items (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  section_id TEXT NOT NULL CHECK (section_id IN ('assets', 'debts', 'income', 'property', 'housework', 'lifestyle', 'communication', 'family', 'career_life', 'other')),
  label TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  completed BOOLEAN NOT NULL DEFAULT false,
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_weddingplan_prenup_user_id ON weddingplan_prenup_items(user_id);

-- RLS
ALTER TABLE weddingplan_prenup_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own prenup items"
  ON weddingplan_prenup_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own prenup items"
  ON weddingplan_prenup_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own prenup items"
  ON weddingplan_prenup_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own prenup items"
  ON weddingplan_prenup_items FOR DELETE
  USING (auth.uid() = user_id);

-- ===========================================
-- Profiles Table (Settings)
-- ===========================================
CREATE TABLE IF NOT EXISTS weddingplan_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  wedding_date TEXT,
  partner1_name TEXT NOT NULL DEFAULT '',
  partner2_name TEXT NOT NULL DEFAULT '',
  language TEXT NOT NULL DEFAULT 'ja' CHECK (language IN ('ja', 'en')),
  total_budget NUMERIC NOT NULL DEFAULT 3500000,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE weddingplan_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON weddingplan_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON weddingplan_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON weddingplan_profiles FOR UPDATE
  USING (auth.uid() = user_id);
