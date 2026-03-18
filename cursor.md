# PlateMyDay - Cursor Agent Guide

> **META**: Keep this file focused on HIGH-IMPACT signals only. No nitty-gritty details. Information here should help agents navigate and understand the project without extensive exploration.

## Critical Rules

1. **ALWAYS use `bun`** (not npm) - `bun install`, `bun add`, `bun run build`
2. **AI Provider**: Google Gemini (`gemini-2.5-flash` / `gemini-2.5-flash-lite`) via `@ai-sdk/google` - NOT Claude/Anthropic
3. **Environment**: `GOOGLE_GENERATIVE_AI_API_KEY` + Supabase keys in `.env.local`
4. **Auth**: Supabase Auth (`@supabase/ssr`) with anonymous user support - app works without login, auth for saving data
5. **No AI-slop comments** - Only comment when logic is non-obvious
6. **Build verification**: Always run `bun run build` after completing new features to verify everything works
7. **NEVER run `bun run dev`** - Dev server is ALWAYS running in background. Only run `bun run build` for verification. Do NOT start dev server unless explicitly requested.

## Project Overview

AI-powered meal planning app with recipe management and weekly meal planning using Google Gemini.

### Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Runtime**: Bun
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Fonts**: Outfit (Google Font) for branding/headers, Geist for body text
- **AI**: Google Gemini via Vercel AI SDK
- **Auth**: Supabase Auth (email/password + Google OAuth, anonymous user support)
- **Database**: Supabase (PostgreSQL)
- **Payments**: Stripe
- **Analytics**: PostHog
- **State**: React Context + Supabase persistence
- **Validation**: Zod v3
- **Icons**: Lucide React
- **Drag & Drop**: @hello-pangea/dnd

## Architecture Essentials

### Design System
- **Brand Font**: Outfit (defined in `layout.tsx` as `--font-outfit`) - playful yet professional
- **Color Scheme**: Emerald/teal gradient (`from-emerald-600 to-teal-600`) for headers and primary actions
- **Header**: `TopBanner.tsx` - Fixed top banner with ChefHat icon, gradient shimmer text effect, animated on hover
- **Floating Action Buttons**: Positioned `bottom-20 md:bottom-8 right-4 md:right-8` (above mobile BottomNav), circular 16x16, gradient background
- **Mobile Navigation**: `BottomNav.tsx` fixed at bottom (h-16), FABs must account for this spacing

### Data Flow
1. **State Management**: React Context (Recipe, MealPlan, Settings, Billing) → auto-syncs to Supabase
2. **AI Generation**:
   - Recipe generation: `generateText` with `Output.object()` → complete recipe object
   - Meal plan generation: `streamText` with `Output.array()` → NDJSON streaming → progressive UI updates
   - API routes: `/api/generate-recipe`, `/api/generate-meal-plan`, `/api/regenerate-meal`, `/api/edit-recipe`
3. **Auth flow**: Anonymous users get a UUID in localStorage. On Supabase Auth sign-in, data migrates via `migrateAnonymousData()` RPC

### Key Entry Points
- **Layout**: `src/app/layout.tsx` - PostHogProvider + UserbackProvider wraps AppShell with context providers
- **Navigation**: `src/components/layout/Sidebar.tsx` (desktop), `BottomNav.tsx` (mobile) + logo at `public/icon.png`
- **Auth**: `src/lib/supabase/auth.ts` - `getAuthUser()` for server-side session
- **Types**: `src/types/index.ts` - Core interfaces (Recipe, MealSlot, WeekPlan, AppSettings, BillingInfo)
- **AI Schemas**: `src/lib/ai.ts` - Zod schemas for AI validation (recipeSchema, mealPlanDaySchema, consolidatedShoppingListSchema)
- **Contexts**: `src/contexts/` - RecipeContext, MealPlanContext, SettingsContext, BillingContext
- **Constants**: `src/lib/constants.ts` - Default prompts, unit system functions

## Common Modification Patterns

### Adding Recipe Property
1. Update `Recipe` in `src/types/index.ts`
2. Update `recipeSchema` in `src/lib/ai.ts` (if AI-generated)
3. Update `RecipeForm` component

### Adding Navigation Page
1. Create `src/app/[page-name]/page.tsx`
2. Add to `src/components/layout/Sidebar.tsx` and `BottomNav.tsx`

### Modifying AI Behavior
- Default prompts: `src/contexts/SettingsContext.tsx`
- User customization: Settings page
- API routes: Accept custom system prompts in request body

### Working with Streaming AI
- Use `streamText` with `Output.array({ element: schema })` for meal plans
- Use `streamObject` with schema for shopping list consolidation
- NDJSON format: one JSON object per line, final line prefixed with "DONE:" or "ERROR:"

## Quick Commands

```bash
bun install                    # Setup dependencies
bun run build                  # Build for production (ALWAYS run after new features)
bun run lint                   # Run ESLint
# bun run dev                  # DO NOT RUN - dev server already running in background
```

## Important Notes

- **Supabase-backed**: All data persisted to Supabase PostgreSQL, not localStorage
- **Server Components**: Use `'use client'` for interactivity
- **Type safety**: Zod validates all AI outputs
- **Responsive**: Mobile-first with Tailwind CSS
- **Billing**: 10 lifetime credits, only meal plan generation costs credits. Stripe for paid plans
- **Never use "AI"** in user-facing text — use "personalized", "tailored", "generated", or "smart" instead
