-- Add estimated_nutrition JSONB column to suggested_recipes and meal_plan_meals
-- so that nutrition data survives page reloads/navigation

ALTER TABLE suggested_recipes
ADD COLUMN IF NOT EXISTS estimated_nutrition JSONB DEFAULT NULL;

ALTER TABLE meal_plan_meals
ADD COLUMN IF NOT EXISTS estimated_nutrition JSONB DEFAULT NULL;
