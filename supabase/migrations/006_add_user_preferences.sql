-- Add preferences column to user_settings table
ALTER TABLE user_settings
ADD COLUMN preferences JSONB DEFAULT '{
  "dietaryType": null,
  "allergies": [],
  "servings": 2,
  "macroGoals": {},
  "onboardingCompleted": false,
  "onboardingDismissed": false
}'::jsonb;

-- Add index for querying onboarding status
CREATE INDEX idx_user_settings_onboarding
ON user_settings((preferences->>'onboardingCompleted'));
