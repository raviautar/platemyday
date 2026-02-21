import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy - PlateMyDay',
  description: 'Privacy Policy for PlateMyDay meal planning application',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-12 md:py-20">
        <Link href="/" className="text-primary hover:underline underline-offset-4 text-sm font-medium mb-8 inline-block">
          &larr; Back to PlateMyDay
        </Link>

        <h1 className="text-3xl md:text-4xl font-bold font-[family-name:var(--font-outfit)] text-foreground mb-2">
          Privacy Policy
        </h1>
        <p className="text-muted-foreground text-sm mb-10">Last updated: February 21, 2026</p>

        <div className="prose prose-neutral max-w-none space-y-8 text-foreground/90 text-[15px] leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">1. Introduction</h2>
            <p>
              PlateMyDay (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is a meal planning application operated by Ravilution.
              This Privacy Policy explains how we collect, use, and protect your personal information when you use our
              application at platemyday.com (the &quot;Service&quot;).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">2. Information We Collect</h2>

            <h3 className="text-lg font-medium text-foreground mt-4 mb-2">Account Information</h3>
            <p>When you create an account, we collect:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Email address</li>
              <li>Authentication credentials (securely managed by Supabase Auth)</li>
              <li>If you sign in with Google: your Google profile name and email</li>
            </ul>

            <h3 className="text-lg font-medium text-foreground mt-4 mb-2">Usage Data</h3>
            <p>We collect information about how you use the Service:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Recipes you create or generate</li>
              <li>Meal plans you generate</li>
              <li>Dietary preferences, allergies, and cuisine preferences you set</li>
              <li>Feature usage patterns (via PostHog analytics)</li>
            </ul>

            <h3 className="text-lg font-medium text-foreground mt-4 mb-2">Anonymous Users</h3>
            <p>
              If you use the Service without creating an account, we assign a random anonymous identifier
              stored in your browser&apos;s local storage. This allows us to save your data locally without
              linking it to any personal information. If you later create an account, your anonymous data
              is migrated to your authenticated account.
            </p>

            <h3 className="text-lg font-medium text-foreground mt-4 mb-2">Payment Information</h3>
            <p>
              If you purchase a premium plan, payment processing is handled entirely by Stripe.
              We do not store your credit card number, bank account details, or other payment credentials.
              We receive from Stripe only your customer ID and subscription status.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">3. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Provide and maintain the Service</li>
              <li>Generate personalized meal plans and recipes based on your preferences</li>
              <li>Process payments and manage subscriptions</li>
              <li>Improve and develop new features</li>
              <li>Analyze usage patterns to enhance user experience</li>
              <li>Communicate with you about your account or the Service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">4. Third-Party Services</h2>
            <p>We use the following third-party services:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Supabase</strong> — Database hosting and authentication</li>
              <li><strong>Google Gemini (via Vercel AI SDK)</strong> — Meal plan and recipe generation</li>
              <li><strong>Stripe</strong> — Payment processing</li>
              <li><strong>PostHog</strong> — Product analytics</li>
              <li><strong>Vercel</strong> — Application hosting</li>
            </ul>
            <p className="mt-2">
              Each third-party service has its own privacy policy governing their use of your data.
              We encourage you to review their policies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">5. Data Storage and Security</h2>
            <p>
              Your data is stored securely in Supabase (PostgreSQL) with row-level security policies
              ensuring users can only access their own data. We use HTTPS for all data transmission
              and follow industry-standard security practices.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">6. Data Retention</h2>
            <p>
              We retain your data for as long as your account is active. If you delete your account,
              we will delete your personal data within 30 days, except where we are required to retain
              it for legal or regulatory purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">7. Your Rights</h2>
            <p>Depending on your location, you may have the right to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Object to or restrict processing of your data</li>
              <li>Request data portability</li>
            </ul>
            <p className="mt-2">
              To exercise any of these rights, please contact us at the email address below.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">8. Cookies</h2>
            <p>
              We use essential cookies to manage your authentication session. We also use analytics
              cookies (PostHog) to understand how the Service is used. You can disable non-essential
              cookies in your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">9. Children&apos;s Privacy</h2>
            <p>
              The Service is not intended for children under the age of 13. We do not knowingly collect
              personal information from children under 13.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes
              by posting the new policy on this page and updating the &quot;Last updated&quot; date.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">11. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <p className="mt-2">
              <strong>Ravilution</strong><br />
              Email: <a href="mailto:ravilutionary@gmail.com" className="text-primary hover:underline">privacy@ravilution.ai</a><br />
              Website: <a href="https://ravilution.ai" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">ravilution.ai</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
