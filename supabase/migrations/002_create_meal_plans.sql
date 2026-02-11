-- Create meal plans table
CREATE TABLE IF NOT EXISTS meal_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,
  anonymous_id TEXT,
  week_start_date DATE NOT NULL,
  preferences TEXT,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_meal_plans_user_id ON meal_plans(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_meal_plans_anonymous_id ON meal_plans(anonymous_id) WHERE anonymous_id IS NOT NULL;
CREATE INDEX idx_meal_plans_active ON meal_plans(user_id, is_active) WHERE is_active = true;

-- Create meal plan days table
CREATE TABLE IF NOT EXISTS meal_plan_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_plan_id UUID NOT NULL REFERENCES meal_plans(id) ON DELETE CASCADE,
  day_of_week TEXT NOT NULL,
  date DATE NOT NULL,
  day_index INTEGER NOT NULL
);

CREATE INDEX idx_meal_plan_days_plan ON meal_plan_days(meal_plan_id);

-- Create meal plan meals table
CREATE TABLE IF NOT EXISTS meal_plan_meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_id UUID NOT NULL REFERENCES meal_plan_days(id) ON DELETE CASCADE,
  recipe_id UUID REFERENCES recipes(id) ON DELETE SET NULL,
  meal_type TEXT NOT NULL,
  recipe_title_fallback TEXT,
  meal_index INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_meal_plan_meals_day ON meal_plan_meals(day_id);
