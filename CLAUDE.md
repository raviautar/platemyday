# PlateMyDay

AI-powered meal planning app built with Next.js 16.

## Tech Stack

- **Framework:** Next.js 16 (App Router, TypeScript, Tailwind CSS v4)
- **Database:** Supabase (PostgreSQL)
- **Auth:** Clerk (`@clerk/nextjs`) with anonymous user support
- **AI:** Vercel AI SDK (`ai` + `@ai-sdk/google`) — Google Gemini models
- **Drag & Drop:** `@hello-pangea/dnd`
- **Schema Validation:** Zod
- **Icons:** `lucide-react`
- **Analytics:** PostHog (`posthog-js` client, `posthog-node` server)

## Dev Commands

```bash
bun run dev          # Start dev server (Turbopack)
bun run build        # Production build (uses --webpack flag)
bun run start        # Start production server
bun run lint         # ESLint
```

## Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── recipes/page.tsx            # Recipe library
│   ├── meal-plan/page.tsx          # Weekly meal planning
│   ├── customize/page.tsx          # Settings
│   ├── upgrade/page.tsx            # Premium features
│   └── api/
│       ├── generate-recipe/        # Single recipe generation (Gemini 3 Flash)
│       ├── generate-meal-plan/     # Full meal plan generation (Gemini 3 Flash, streaming)
│       ├── regenerate-meal/        # Single meal replacement (Gemini 2.5 Flash Lite)
│       └── consolidate-shopping-list/ # Shopping list consolidation (Gemini 2.5 Flash Lite)
├── components/
│   ├── layout/                     # AppShell, Sidebar, BottomNav, TopBanner
│   ├── recipes/                    # RecipeForm, RecipeList, RecipeCard, RecipeDetail, AIRecipeGenerator
│   ├── meal-plan/                  # WeekView, DayColumn, MealCard, MealDetail, MealPlanHistory, etc.
│   └── ui/                         # Modal, Button, Input, Textarea, Toast, LoadingSpinner, GeneratingAnimation, NutritionGrid, PieChartIcon
├── contexts/
│   ├── RecipeContext.tsx            # Recipes CRUD (Supabase-backed)
│   ├── MealPlanContext.tsx          # Meal plan state + history (Supabase-backed)
│   └── SettingsContext.tsx          # User settings (Supabase-backed)
├── hooks/
│   ├── useUserIdentity.ts          # Clerk user + anonymous ID resolution
│   ├── useAnalytics.ts             # PostHog tracking hook with identity enrichment
│   └── useMealPlanGeneration.ts    # Meal plan generation logic (streaming, parsing, state)
├── lib/
│   ├── ai.ts                       # Zod schemas for AI output
│   ├── ai-guardrails.ts            # Request validation, rate limiting, API route helpers
│   ├── constants.ts                # Default settings, day/meal constants, MEAL_TYPE_COLORS
│   ├── tag-colors.ts               # Tag color utilities (getTagDotColor, getTagBadgeColor)
│   ├── diet-icons.ts               # DIET_ICON_MAP for dietary type icons
│   ├── anonymous-id.ts             # Anonymous user ID management
│   ├── analytics/
│   │   ├── events.ts               # All PostHog event name constants
│   │   ├── posthog-client.ts       # Client-side PostHog init
│   │   └── posthog-server.ts       # Server-side PostHog for API routes
│   └── supabase/
│       ├── client.ts               # Browser Supabase client
│       ├── server.ts               # Server Supabase client
│       └── db.ts                   # Database helper functions
├── types/
│   └── index.ts                    # All TypeScript interfaces
supabase/
└── migrations/                     # SQL migration files (001-005)
```

## Key Patterns

- **Tailwind v4:** Custom colors defined via `@theme inline` in `globals.css` (not tailwind.config)
- **Color palette:** primary=#4CAF50, secondary=#FFD54F, accent=#F48FB1, bg=#FAFFF5
- **AI routes:** Use `generateText()` with `Output.object({ schema })` for structured output. All routes use `validateAndRateLimit()` from `ai-guardrails.ts` for request parsing, validation, and rate limiting
- **Models:** Main generation uses `gemini-3-flash-preview`, single meal regen uses `gemini-2.5-flash-lite`
- **Auth flow:** Anonymous users get a UUID stored in localStorage. On Clerk sign-in, anonymous data migrates to the authenticated user via `migrateAnonymousData()`
- **Persistence:** All data stored in Supabase. Contexts fetch on mount using `useUserIdentity()` hook
- **Meal plan history:** All generated plans are saved. Users can view and restore past plans

## Analytics (PostHog)

PostHog tracks 5 high-level product metrics. **When adding new features or modifying existing user flows, always consider whether analytics events need to be added or updated.**

### How to add tracking
- **Client-side:** Use the `useAnalytics()` hook → `const { track } = useAnalytics()` then `track(EVENTS.EVENT_NAME, { properties })`
- **Server-side (API routes):** Use `trackServerEvent(eventName, userId, anonymousId, properties)` from `@/lib/analytics/posthog-server`
- **Event names:** Add new constants to `src/lib/analytics/events.ts` — never use raw strings

### The 5 metrics and when to add events
1. **AI Generation Success Rate** — Any new AI-powered feature needs started/completed/failed events
2. **User Activation Rate** — Any change to onboarding or "first time" flows needs tracking
3. **Weekly Active Engagement** — New content creation or viewing actions should be tracked
4. **Feature Depth** — New secondary features (tools, views, interactions) need usage events
5. **Conversion Funnel** — Changes to auth, upgrade, or signup flows need tracking

### Checklist for new features
- [ ] Does this feature have a user action worth tracking? Add a client-side event
- [ ] Does this feature call an API route? Add server-side tracking for success/failure
- [ ] Is this a new AI generation feature? Track started/completed/failed
- [ ] Does this change onboarding or activation? Update activation events
- [ ] Add the event constant to `src/lib/analytics/events.ts`

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
GOOGLE_GENERATIVE_AI_API_KEY=
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=
```
