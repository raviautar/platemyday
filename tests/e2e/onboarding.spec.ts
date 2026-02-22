import { test, expect } from '@playwright/test';

test.describe('Anonymous to Signed-in User Onboarding', () => {
    // Use a fake unique email to avoid conflicts
    const testEmail = `test+${Date.now()}@test.com`;
    const testPassword = 'TestPassword123!';

    test('should complete anonymous onboarding, convert to user, and persist state', async ({ page, request }) => {
        // ----------------------------------------------------------------------
        // Step 1: Complete Onboarding as Anonymous User
        // ----------------------------------------------------------------------
        await page.goto('http://127.0.0.1:3000/');

        // Click 'Let's Plan!' or similar starting button
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000); // Give hydration a moment
        await page.getByRole('button', { name: /let's plan!/i }).click();

        // Should redirect to onboarding
        await page.waitForURL(/.*onboarding.*/, { timeout: 10000 });
        await expect(page).toHaveURL(/.*onboarding.*/);

        // 1. Feature 1 -> Next
        await page.waitForTimeout(500);
        await page.getByRole('button', { name: /Next/i }).click();
        // 2. Feature 2 -> Next
        await page.waitForTimeout(500);
        await page.getByRole('button', { name: /Next/i }).click();
        // 3. Feature 3 -> Continue
        await page.waitForTimeout(500);
        await page.getByText('Continue', { exact: true }).click();

        // 4. Save your progress screen -> Continue without account for now
        await page.getByRole('button', { name: /Continue without account for now/i }).click();

        // Land on meal plan page
        await expect(page).toHaveURL(/.*meal-plan.*/);

        // ----------------------------------------------------------------------
        // Step 2: Convert to Signed-in User
        // ----------------------------------------------------------------------
        // Click on User Menu to sign up
        // Assuming there is a user menu or login link in the AppShell header
        await page.goto('http://127.0.0.1:3000/signup');

        // Fill in signup form
        await page.getByLabel(/email/i).fill(testEmail);
        await page.getByLabel(/password/i).fill(testPassword);

        // Check for "Sign Up" or "Create Account" submit button
        const signupSubmitBtn = page.getByRole('button', { name: /sign up|create account/i });
        await signupSubmitBtn.click();

        // Important: After signup, since ENABLE_EMAIL_CONFIRMATION = false, 
        // it logs us in immediately and redirects to the meal plan.
        await expect(page.getByText(/10 free generations remaining/i)).toBeVisible({ timeout: 10000 });

        // ----------------------------------------------------------------------
        // Step 3: Verify Persistence
        // ----------------------------------------------------------------------
        await page.goto('http://127.0.0.1:3000/');
        await page.getByRole('button', { name: /let's plan!/i }).click();

        // Should redirect directly to meal-plan, NOT onboarding
        await expect(page).toHaveURL(/.*meal-plan.*/);

        // ----------------------------------------------------------------------
        // Step 4: Refresh and Re-verify
        // ----------------------------------------------------------------------
        await page.reload();
        await expect(page).toHaveURL(/.*meal-plan.*/);

    });

    // Cleanup after string testing
    test.afterAll(async ({ request }) => {
        // Call the newly created API route to delete the user using their email
        const teardownRes = await request.post('http://127.0.0.1:3000/api/admin/teardown-user', {
            data: {
                email: testEmail
            }
        });
        const result = await teardownRes.json();
        console.log(`Teardown result for ${testEmail}:`, result);
        expect(teardownRes.ok()).toBeTruthy();
    });
});
