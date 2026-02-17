# Stripe Webhooks

## Why Webhooks?

When a user pays through Stripe Checkout, the payment happens entirely on Stripe's servers. Our app redirects the user to Stripe, they enter card details, and Stripe processes the payment. The problem: **our server never directly sees the payment succeed**. We only know the user was redirected back to `/upgrade?success=true`, but that URL parameter alone isn't proof of payment — anyone could type it in.

Webhooks solve this. After a payment event occurs, Stripe sends an HTTP POST request to our server with the event details. Our webhook handler (`/api/webhooks/stripe`) receives this, verifies it's genuinely from Stripe, and updates the `user_billing` table in Supabase. Only then does the user's plan change from "free" to their purchased plan.

## How It Works

```
User → Stripe Checkout → Pays → Stripe processes payment
                                      ↓
                              Stripe sends webhook POST
                                      ↓
                        /api/webhooks/stripe receives it
                                      ↓
                         Verifies signature (STRIPE_WEBHOOK_SECRET)
                                      ↓
                        Updates user_billing in Supabase
                                      ↓
                  Upgrade page polling detects plan change → Shows success
```

## Webhook Signing Secret

Every webhook POST from Stripe includes a `stripe-signature` header. Our server uses the `STRIPE_WEBHOOK_SECRET` to verify this signature, ensuring:

1. The request actually came from Stripe (not spoofed)
2. The payload wasn't tampered with in transit

**Important:** The signing secret is different for local development vs. production. They are generated independently and are not interchangeable.

## Events We Handle

| Event | When it fires | What we do |
|---|---|---|
| `checkout.session.completed` | User completes Stripe Checkout | Upsert `user_billing` with plan + subscription info |
| `customer.subscription.created` | New subscription is created | Upsert `user_billing` (backup for checkout event) |
| `customer.subscription.updated` | Subscription changes (upgrade/downgrade) | Update plan in `user_billing` |
| `customer.subscription.deleted` | Subscription is canceled | Reset plan to "free" |
| `invoice.payment_failed` | Recurring payment fails | Set status to "past_due" |

## Local Development Setup

In local development, Stripe can't reach `localhost`. The Stripe CLI solves this by creating a tunnel.

### 1. Install Stripe CLI

```bash
brew install stripe/stripe-cli/stripe
```

### 2. Login to Stripe

```bash
stripe login
```

This opens a browser for authentication. You only need to do this once.

### 3. Forward webhooks to your local server

```bash
stripe listen --forward-to localhost:3001/api/webhooks/stripe
```

This outputs something like:

```
> Ready! Your webhook signing secret is whsec_abc123def456...
```

### 4. Set the signing secret

Copy the `whsec_...` value and set it in your `.env.local`:

```
STRIPE_WEBHOOK_SECRET=whsec_abc123def456...
```

**Note:** The CLI generates a new signing secret each time you run `stripe listen`. If you restart the CLI, you need to update `STRIPE_WEBHOOK_SECRET` to match.

### 5. Keep it running

`stripe listen` must be running in a separate terminal whenever you test payment flows. Without it, webhooks won't reach your server, and plans won't activate after checkout.

### Quick test

You can trigger a test webhook to verify everything is connected:

```bash
stripe trigger checkout.session.completed
```

You should see output in both the `stripe listen` terminal and your Next.js server logs.

## Production Setup (Vercel)

In production, Stripe sends webhooks directly to your deployed URL. No CLI needed.

### 1. Create a webhook endpoint in Stripe Dashboard

1. Go to [Stripe Dashboard → Developers → Webhooks](https://dashboard.stripe.com/webhooks)
2. Click **Add endpoint**
3. Set the endpoint URL: `https://your-domain.com/api/webhooks/stripe`
4. Select these events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
5. Click **Add endpoint**

### 2. Get the signing secret

After creating the endpoint:

1. Click on the endpoint in the Webhooks list
2. Under **Signing secret**, click **Reveal**
3. Copy the `whsec_...` value

### 3. Set the environment variable

In Vercel (or your hosting provider), add:

```
STRIPE_WEBHOOK_SECRET=whsec_... (the production signing secret from step 2)
```

This is different from the local CLI secret. Each environment has its own.

### 4. Verify it's working

1. Make a test purchase on your production site
2. In Stripe Dashboard → Webhooks → your endpoint → **Recent deliveries**
3. You should see successful (200) deliveries for the events above
4. If you see failures, click into them to see the error response

## Troubleshooting

### Plan stays "free" after payment

1. **Is `stripe listen` running?** (local dev only) — Check your terminal
2. **Does `STRIPE_WEBHOOK_SECRET` match?** — The secret from `stripe listen` output must match `.env.local`. Restart `stripe listen` and update the env var if needed
3. **Is the webhook endpoint correct?** — Must point to `/api/webhooks/stripe` (note: not `/api/webhook/stripe`)
4. **Check Stripe Dashboard** — Go to Webhooks → Recent deliveries. Look for failed deliveries and their error messages

### Webhook signature verification failed

This means `STRIPE_WEBHOOK_SECRET` doesn't match the secret that signed the webhook. Common causes:
- You restarted `stripe listen` but didn't update `.env.local`
- You're using the production secret locally (or vice versa)
- The env var has extra whitespace

### Webhook received but plan not updating

Check the server logs for Supabase errors. The `user_billing` upsert requires that:
- The `user_id` column has a unique constraint (for `onConflict: 'user_id'` to work)
- The `clerk_user_id` metadata is present in the checkout session (set in `create-checkout-session`)
