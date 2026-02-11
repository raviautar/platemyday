-- Create user settings table
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,
  anonymous_id TEXT,
  recipe_system_prompt TEXT,
  meal_plan_system_prompt TEXT,
  unit_system TEXT NOT NULL DEFAULT 'metric',
  week_start_day TEXT NOT NULL DEFAULT 'Monday',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_user_settings_user ON user_settings(user_id) WHERE user_id IS NOT NULL;
CREATE UNIQUE INDEX idx_user_settings_anonymous ON user_settings(anonymous_id) WHERE anonymous_id IS NOT NULL;
