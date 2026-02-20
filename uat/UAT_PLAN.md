# PlateMyDay UAT Plan (Mobile-Only)

## Overview
This document defines the User Acceptance Testing (UAT) journeys for PlateMyDay, an AI-powered meal planning application. The goal is to traverse all core user journeys on a **mobile-sized screen** to identify errors, UX bugs, edge cases, and areas for improvement.

*Target Environment:* Mobile viewport (e.g., 390x844) on `http://localhost:3001`

## User Journeys & Edge Cases

### Journey 1: Landing Page & Onboarding
1. Navigate to the landing page (`/`).
2. Verify UI elements, copy, and responsiveness on a mobile screen.
3. Initiate the onboarding or "Get Started" flow.
4. **Edge Case:** Try to bypass step validations by submitting empty or extremely long inputs.
5. **Edge Case:** Refresh the page midway through onboarding to see if state persists.

### Journey 2: Meal Plan Generation & Management
1. Navigate to the Meal Plan view (`/meal-plan`).
2. Generate a new weekly meal plan.
3. Verify the mobile layout of the WeekView, DayColumn, and MealCards.
4. **Edge Case:** Attempt to generate a plan with conflicting or no dietary preferences set.
5. **Edge Case:** Rapidly click the generate or swap meal buttons to check for race conditions or multiple API calls.
6. Verify shopping list consolidation, ensuring the UI is usable on small screens.

### Journey 3: Recipe Library
1. Navigate to the Recipe Library (`/recipes`).
2. View the list of saved or generated recipes. Check scrollability.
3. Click into a recipe to view details (`RecipeDetail`).
4. **Edge Case:** Try generating a recipe using the AI recipe generator with an absurd prompt or extremely long ingredient list.
5. **Edge Case:** Add a recipe with no ingredients or instructions to see how the UI handles empty states.

### Journey 4: Customization & Preferences
1. Navigate to the Customization / Settings page (`/customize`).
2. Review and update meal preferences and dietary restrictions.
3. **Edge Case:** Deselect all preferences and attempt to save.
4. **Edge Case:** Select maximum possible preferences to see if the UI breaks or API rejects.
5. Verify changes persist and reflect in subsequent meal plans.

## Execution Strategy
- The browser subagent MUST resize its viewport to a standard mobile size (e.g., width: 390, height: 844) before beginning tests.
- Execute these journeys step by step against `http://localhost:3001`.
- Do NOT test the premium/upgrade flows.
- Compile a final report categorizing findings into:
  - **Errors/Console Logs**
  - **UX Bugs (Mobile Specific)**
  - **Feature/Design Improvements**
