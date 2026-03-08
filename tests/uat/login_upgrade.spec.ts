import { test, expect } from '@playwright/test';

test.describe('Login and Upgrade UAT', () => {
    test('Scenario 1: New Account & Upgrade Checkout Flow', async ({ browser }) => {
        // Generate a unique email
        const uniqueEmail = `test_${Date.now()}@example.com`;
        const password = 'TestPassword123!';

        // Setup fresh browser context
        const context = await browser.newContext();
        const page = await context.newPage();

        // Navigate to login
        await page.goto('/login');

        // Switch to Sign Up tab and fill details
        await page.click('text=Sign Up');
        await page.fill('input[type="email"]', uniqueEmail);
        await page.fill('input[type="password"]', password);
        await page.click('button:has-text("Create Account")');

        // Verify redirection to /meal-plan
        await page.waitForURL('**/meal-plan');
        expect(page.url()).toContain('/meal-plan');

        // Navigate to upgrade page manually
        await page.goto('/upgrade');

        // Verify "Get Lifetime Premium" is visible and "Sign in to Purchase" is NOT
        await expect(page.locator('button:has-text("Get Lifetime Premium")')).toBeVisible();
        await expect(page.locator('button:has-text("Sign in to Purchase")')).not.toBeVisible();

        // Click to start Stripe Checkout
        await page.click('button:has-text("Get Lifetime Premium")');

        // Wait for Stripe Checkout to load
        await page.waitForURL('**/checkout.stripe.com/**');

        // NOTE: In a real test, automating Stripe Checkout involves interacting with external frames.
        // For this UAT test, we assume the environment is properly configured for Stripe test mode.
        // Given the complexity of Stripe interactions, this is a placeholder for filling card details.
        // In many UAT tests, we can also use Stripe CLI or API to create successful payments directly.
        /*
        await page.fill('[name="cardNumber"]', '4242 4242 4242 4242');
        await page.fill('[name="cardExpiry"]', '12/26');
        await page.fill('[name="cardCvc"]', '123');
        await page.fill('[name="billingName"]', 'Test User');
        await page.click('button:has-text("Pay")');
        */

        // As completing Stripe checkout completely within Playwright can be flaky,
        // ensure you handle it carefully according to Stripe testing best practices.
    });

    test('Scenario 2: Unauthenticated Upgrade Attempt', async ({ page }) => {
        await page.goto('/upgrade');

        // Should see "Sign in to Purchase"
        const signInBtn = page.locator('button:has-text("Sign in to Purchase")');
        await expect(signInBtn).toBeVisible();

        // Redirect to login on click
        await signInBtn.click();
        await page.waitForURL('**/login');
    });

    test('Scenario 3: Logged-in Redirection', async ({ page }) => {
        const uniqueEmail = `test_redirect_${Date.now()}@example.com`;

        // First sign up/in
        await page.goto('/login');
        await page.click('text=Sign Up');
        await page.fill('input[type="email"]', uniqueEmail);
        await page.fill('input[type="password"]', 'TestPassword123!');
        await page.click('button:has-text("Create Account")');
        await page.waitForURL('**/meal-plan');

        // Now try to go to /login again
        await page.goto('/login');

        // Should be redirected back to /meal-plan automatically
        await page.waitForURL('**/meal-plan');
    });

    test('Scenario 4: Sign Out Verification', async ({ page }) => {
        const uniqueEmail = `test_signout_${Date.now()}@example.com`;

        // Sign up
        await page.goto('/login');
        await page.click('text=Sign Up');
        await page.fill('input[type="email"]', uniqueEmail);
        await page.fill('input[type="password"]', 'TestPassword123!');
        await page.click('button:has-text("Create Account")');
        await page.waitForURL('**/meal-plan');

        // Open User Menu (assuming standard avatar/name button)
        // Find a button that might open the user dropdown, it's typically the avatar
        // The exact selector depends on your UI implementation.
        // Here we assume it has an aria-label or specific test id, or we just click standard nav.
        // For now we click a generic user menu button.
        // await page.click('[aria-label="User Menu"]'); 

        // Find the Sign out button
        await page.click('button:has-text("Sign out")');

        // Wait for the redirect home or cleanup state
        await page.waitForTimeout(1000); // Wait briefly for state to clear

        // Navigate to upgrade to verify signed out state
        await page.goto('/upgrade');
        await expect(page.locator('button:has-text("Sign in to Purchase")')).toBeVisible();
    });
});
