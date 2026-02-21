# UAT Plan: Anonymous User to Signed-in User Onboarding Persistence

## Scenario Context
In PlateMyDay, anonymous users interact with the app via an anonymous session. When an anonymous user goes through the onboarding flow and subsequently converts into a new signed-in user, their onboarding completion state must persist. They should not be forced to go through the onboarding flow again or see the onboarding page's "Get Started" button after their successful signup/login. Instead, they should see the homepage in the state that reflects they have already completed onboarding.

## Pre-requisites
- **CRITICAL DEPENDENCY**: This test requires a COMPLETELY new user that has never been registered in the database before, one who successfully converts from an anonymous session to a signed-in state.
- Ensure the application is running locally (e.g., `bun run dev`).
- Test in an incognito or private browsing window, or clear local storage and cookies to ensure a clean state before starting.
- Use a brand new, unique email address for the signup step (one not currently in the Supabase database) or a fresh Google OAuth login.

## Test Workflow

### Step 1: Initial Anonymous State
1. Open the application landing page.
2. Verify that you are not logged in (anonymous state).
3. Verify that the "Get Started" button (or the beginning of the onboarding flow) is visible on the page.

### Step 2: Complete Onboarding as Anonymous User
1. Click the "Get Started" button.
2. Progress through and complete all the required steps of the onboarding flow (e.g., dietary preferences, household size, etc.).
3. Once completed, verify that you land on the main homepage/meal plan view and that the "Get Started" button is no longer visible.

### Step 3: Convert to a Signed-in User
1. Navigate to the sign-up or log-in page (`/signup` or `/login`).
2. Create a new account using a new email address and password, or use Google OAuth to sign up.
3. Wait for the authentication and redirection process to complete. (Under the hood, `migrateAnonymousData()` should be called).

### Step 4: Verify Onboarding Persistence
1. After landing on the authenticated view, observe the UI.
2. **Expected Result:** You MUST NOT see the "Get Started" onboarding page or prompt.
3. **Expected Result:** You MUST see the normal homepage / meal planner view as a user who has already completed onboarding.
4. **Expected Result:** Any settings or preferences chosen during the anonymous onboarding should be preserved in the user's current settings/profile.

### Step 5: Refresh the Application
1. Perform a hard refresh of the browser (Cmd+Shift+R or Ctrl+F5).
2. **Expected Result:** When the application reloads and hydrates the user identity, it should still recognize that the onboarding is completed. The onboarding flow must not randomly reappear.

## Acceptance Criteria
- [ ] Onboarding state is correctly saved for the anonymous user.
- [ ] Upon account creation, the `onboardingCompleted` status (along with other anonymous data) is successfully migrated to the new authenticated user's record in Supabase.
- [ ] The user is seamlessly transitioned to the main app view without being prompted to repeat onboarding.
- [ ] The state persists reliably across page refreshes after authentication.
