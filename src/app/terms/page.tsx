import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service - PlateMyDay',
  description: 'Terms of Service for PlateMyDay meal planning application',
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-12 md:py-20">
        <Link href="/" className="text-primary hover:underline underline-offset-4 text-sm font-medium mb-8 inline-block">
          &larr; Back to PlateMyDay
        </Link>

        <h1 className="text-3xl md:text-4xl font-bold font-[family-name:var(--font-outfit)] text-foreground mb-2">
          Terms of Service
        </h1>
        <p className="text-muted-foreground text-sm mb-10">Last updated: February 21, 2026</p>

        <div className="prose prose-neutral max-w-none space-y-8 text-foreground/90 text-[15px] leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing or using PlateMyDay (&quot;the Service&quot;), operated by Ravilution (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;),
              you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not
              use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">2. Description of Service</h2>
            <p>
              PlateMyDay is a meal planning application that generates personalized weekly meal plans and recipes
              based on your dietary preferences. The Service uses artificial intelligence to create content
              tailored to your needs.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">3. Accounts</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>You may use the Service without creating an account (as an anonymous user) with limited functionality.</li>
              <li>To access all features, including premium plans, you must create an account using a valid email address or Google sign-in.</li>
              <li>You are responsible for maintaining the security of your account credentials.</li>
              <li>You must provide accurate information when creating your account.</li>
              <li>You must be at least 13 years old to use the Service.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">4. Free and Premium Plans</h2>

            <h3 className="text-lg font-medium text-foreground mt-4 mb-2">Free Plan</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>All users (anonymous and authenticated) receive 10 lifetime meal plan generation credits.</li>
              <li>Recipe generation and single meal regeneration are free and unlimited.</li>
            </ul>

            <h3 className="text-lg font-medium text-foreground mt-4 mb-2">Premium Plans</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Premium plans (Monthly, Annual, Lifetime) provide unlimited meal plan generation.</li>
              <li>Subscription plans renew automatically at the end of each billing period unless canceled.</li>
              <li>The Lifetime plan is a one-time purchase granting permanent unlimited access.</li>
              <li>All prices are displayed in Euros (&euro;) and include applicable taxes.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">5. Payments and Refunds</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>All payments are processed securely through Stripe.</li>
              <li>You can cancel your subscription at any time through the subscription management portal.</li>
              <li>Upon cancellation, you retain access to premium features until the end of your current billing period.</li>
              <li>Refund requests may be considered on a case-by-case basis within 14 days of purchase. Contact us to request a refund.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">6. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Use the Service for any unlawful purpose</li>
              <li>Attempt to gain unauthorized access to any part of the Service</li>
              <li>Interfere with or disrupt the Service or its infrastructure</li>
              <li>Use automated means (bots, scrapers) to access the Service without our permission</li>
              <li>Circumvent any rate limiting or usage restrictions</li>
              <li>Share your account credentials with others</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">7. Generated Content</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Meal plans and recipes are generated using artificial intelligence and are provided for informational purposes only.</li>
              <li>We do not guarantee the nutritional accuracy, safety, or suitability of generated content for your specific health conditions.</li>
              <li>Always consult a healthcare professional or registered dietitian for specific dietary or medical advice.</li>
              <li>Generated content may contain allergens or ingredients that are unsuitable for you, even if you have set preferences. Always review recipes before preparation.</li>
              <li>You retain ownership of any custom recipes you create manually.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">8. Intellectual Property</h2>
            <p>
              The Service, including its design, code, logos, and branding, is owned by Ravilution and protected
              by intellectual property laws. You may not copy, modify, distribute, or create derivative works
              based on the Service without our written permission.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">9. Disclaimer of Warranties</h2>
            <p>
              The Service is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind, either express
              or implied. We do not warrant that the Service will be uninterrupted, error-free, or free of
              harmful components.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">10. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, Ravilution shall not be liable for any indirect, incidental,
              special, consequential, or punitive damages arising from your use of the Service, including but not
              limited to health issues resulting from following generated meal plans or recipes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">11. Termination</h2>
            <p>
              We reserve the right to suspend or terminate your account if you violate these Terms. You may
              delete your account at any time by contacting us. Upon termination, your right to use the Service
              will immediately cease.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">12. Changes to Terms</h2>
            <p>
              We may update these Terms from time to time. We will notify you of significant changes by
              posting the new terms on this page. Your continued use of the Service after changes constitutes
              acceptance of the updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">13. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the Netherlands,
              without regard to conflict of law principles.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">14. Contact Us</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            <p className="mt-2">
              <strong>Ravilution</strong><br />
              Email: <a href="mailto:ravilutionary@gmail.com" className="text-primary hover:underline">legal@ravilution.ai</a><br />
              Website: <a href="https://ravilution.ai" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">ravilution.ai</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
