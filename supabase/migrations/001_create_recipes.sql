-- Create recipes table
CREATE TABLE IF NOT EXISTS recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,
  anonymous_id TEXT,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  ingredients TEXT[] NOT NULL DEFAULT '{}',
  instructions TEXT[] NOT NULL DEFAULT '{}',
  servings INTEGER NOT NULL DEFAULT 4,
  prep_time_minutes INTEGER NOT NULL DEFAULT 0,
  cook_time_minutes INTEGER NOT NULL DEFAULT 0,
  tags TEXT[] NOT NULL DEFAULT '{}',
  is_ai_generated BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for efficient lookups
CREATE INDEX idx_recipes_user_id ON recipes(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_recipes_anonymous_id ON recipes(anonymous_id) WHERE anonymous_id IS NOT NULL;
