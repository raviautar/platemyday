# UAT Plan: Anonymous User to Signed-in User Onboarding Persistence

## Scenario Context
In PlateMyDay, anonymous users interact with the app via an anonymous session. When an anonymous user goes through the onboarding flow and subsequently converts into a new signed-in user, their onboarding completion state must persist. They should not be forced to go through the onboarding flow again or see the onboarding page's "Get Started" button after their successful signup/login. Instead, they should see the homepage in the state that reflects they have already completed onboarding.

## Pre-requisites
- **CRITICAL DEPENDENCY**: This test requires a COMPLETELY new user that has never been registered in the database before, one who successfully converts from an anonymous session to a signed-in state.
- Ensure the application is running locally (e.g., `bun run dev`).
- Test in an incognito or private browsing window, or clear local storage and cookies to ensure a clean state before starting.
- **Unique Fake Email + Service Role Cleanup Pattern**:
  - Generate a unique test email using a timestamp (e.g. `test+${Date.now()}@test.com`) for signup instead of real accounts.
  - Ensure `ENABLE_EMAIL_CONFIRMATION` is set to `false` in Supabase config or the testing environment.
  - Run the cleanup API script (`/api/admin/teardown-user`) with your `SUPABASE_SERVICE_ROLE_KEY` after the test to restore a clean state.

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
2. Create a new account using the generated fake email (e.g., `test+123456789@test.com`) and a default password.
3. Wait for the authentication and redirection process to complete. (Under the hood, `migrateAnonymousData()` should be called and the user logged in directly since email confirmation is disabled).


### Step 4: Verify Onboarding Persistence
1. After landing on the authenticated view, observe the UI.
2. **Expected Result:** You MUST NOT see the "Get Started" onboarding page or prompt.
3. **Expected Result:** You MUST see the normal homepage / meal planner view as a user who has already completed onboarding.
4. **Expected Result:** Any settings or preferences chosen during the anonymous onboarding should be preserved in the user's current settings/profile.

### Step 5: Refresh the Application
1. Perform a hard refresh of the browser (Cmd+Shift+R or Ctrl+F5).
2. **Expected Result:** When the application reloads and hydrates the user identity, it should still recognize that the onboarding is completed. The onboarding flow must not randomly reappear.

### Step 6: Teardown (Cleanup)
1. Send a POST request to `/api/admin/teardown-user` with the fake email used in step 3.
2. Verify that the user along with their data is successfully deleted from Supabase.

## Acceptance Criteria
- [ ] Onboarding state is correctly saved for the anonymous user.
- [ ] Upon account creation, the `onboardingCompleted` status (along with other anonymous data) is successfully migrated to the new authenticated user's record in Supabase.
- [ ] The user is seamlessly transitioned to the main app view without being prompted to repeat onboarding.
- [ ] The state persists reliably across page refreshes after authentication.
- [ ] Test user account is cleanly deleted using the admin teardown route.
