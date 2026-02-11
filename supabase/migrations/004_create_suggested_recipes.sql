-- Create suggested recipes table (AI-generated recipes attached to meal plans)
CREATE TABLE IF NOT EXISTS suggested_recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_plan_id UUID NOT NULL REFERENCES meal_plans(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  ingredients TEXT[] NOT NULL DEFAULT '{}',
  instructions TEXT[] NOT NULL DEFAULT '{}',
  servings INTEGER NOT NULL DEFAULT 4,
  prep_time_minutes INTEGER NOT NULL DEFAULT 0,
  cook_time_minutes INTEGER NOT NULL DEFAULT 0,
  tags TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_suggested_recipes_plan ON suggested_recipes(meal_plan_id);
