# Login and Upgrade UAT Playwright Test Instructions

This document provides instructions for the agent to create Playwright UAT tests covering the authentication and upgrade flows. 

## Goals

1.  **Verification**: 
    - Sign in via email → navigate to `/upgrade` → should see checkout button immediately (no flash of "Sign in to Purchase")
    - Sign in via Google OAuth → callback → redirect → should see authenticated state
    - On `/upgrade`, click "Get Lifetime Premium" → complete Stripe checkout → redirect back to `/upgrade?success=true` → should see "Payment successful" / celebration, not "Sign in to Purchase"
    - While signed in, manually navigate to `/login` → should redirect to `/meal-plan`
    - While signed out, navigate to `/upgrade` → should see "Sign in to Purchase" (correct behavior)

## Playwright Test Approach

The Playwright test (to be written in `tests/uat/login_upgrade.spec.ts` or similar) should follow these scenarios mimicking the real user experience:

### Scenario 1: New Account & Upgrade Checkout Flow (The Happy Path)
- **Setup**: Start a fresh browser context.
- **Action**: Navigate to `http://localhost:3000/login`.
- **Action**: Switch to the "Sign Up" tab.
- **Action**: Fill in a unique email (e.g., `test_{timestamp}@example.com`) and password, and create an account.
- **Verification**: Ensure the user is redirected to `/meal-plan`.
- **Action**: Manually navigate to `http://localhost:3000/upgrade`.
- **Verification**: The "Get Lifetime Premium" button should be visible immediately. The "Sign in to Purchase" button should NOT be present.
- **Action**: Click the "Get Lifetime Premium" button.
- **Action**: Fill in the Stripe Checkout details:
  - Email: Pre-filled or use the generated test email.
  - Card Number: `4242 4242 4242 4242`
  - Expiry: `12/26` (or any future date)
  - CVC: `123`
  - Name: `Test User`
- **Action**: Submit the payment.
- **Verification**: Ensure the page redirects back to `http://localhost:3000/upgrade?success=true`.
- **Verification**: The page must display a "Payment successful!" message (or a similar celebration UI). Crucially, the "Sign in to Purchase" button must NOT be present on this success screen.

### Scenario 2: Unauthenticated Upgrade Attempt
- **Setup**: Start a fresh browser context (no cookies/localStorage).
- **Action**: Navigate directly to `http://localhost:3000/upgrade`.
- **Verification**: The page must show a "Sign in to Purchase" button instead of the direct payment button.
- **Action**: Click "Sign in to Purchase".
- **Verification**: Ensure redirection to the login page (`/login`).

### Scenario 3: Logged-in Redirection
- **Setup**: Use the authenticated state from Scenario 1 or create a new user.
- **Action**: While signed in, navigate to `http://localhost:3000/login`.
- **Verification**: Ensure the app redirects the user back to `/meal-plan` automatically.

### Scenario 4: Sign Out Verification
- **Setup**: Use an authenticated session.
- **Action**: Open the user profile menu (top right).
- **Action**: Click "Sign out".
- **Action**: Navigate to `http://localhost:3000/upgrade`.
- **Verification**: Ensure the session is cleared by checking that the "Sign in to Purchase" button is displayed again.

### Scenario 5: Google OAuth Flow (Stubbed / Verification)
- **Note**: Fully automating Google OAuth in Playwright is often fragile due to CAPTCHAs and 2FA. 
- **Action**: Navigate to `/login`.
- **Action**: Click "Continue with Google".
- **Verification**: Ensure the page redirects to `https://accounts.google.com/...` with the correct `auth/callback` redirect URI parameter.

## Implementation Details
- Ensure appropriate `page.waitForURL()` and `page.waitForSelector()` are used, especially for network-bound transitions like Supabase auth and Stripe checkout.
- Clear up test users from the database if a teardown script/API is available.
