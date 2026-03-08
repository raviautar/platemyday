-- Add estimated_nutrition JSONB column to recipes table
-- so that saved recipes can store nutrition data from AI generation/editing

ALTER TABLE recipes
ADD COLUMN IF NOT EXISTS estimated_nutrition JSONB DEFAULT NULL;
