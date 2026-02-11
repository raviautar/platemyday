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
│       ├── generate-meal-plan/     # Full meal plan generation (Gemini 3 Flash)
│       └── regenerate-meal/        # Single meal replacement (Gemini 2.5 Flash Lite)
├── components/
│   ├── layout/                     # AppShell, Sidebar, BottomNav, TopBanner
│   ├── recipes/                    # RecipeForm, RecipeList, RecipeCard, RecipeDetail, AIRecipeGenerator
│   ├── meal-plan/                  # WeekView, DayColumn, MealCard, MealDetail, MealPlanHistory, etc.
│   └── ui/                         # Modal, Button, Input, Textarea, Toast, LoadingSpinner, GeneratingAnimation
├── contexts/
│   ├── RecipeContext.tsx            # Recipes CRUD (Supabase-backed)
│   ├── MealPlanContext.tsx          # Meal plan state + history (Supabase-backed)
│   └── SettingsContext.tsx          # User settings (Supabase-backed)
├── hooks/
│   └── useUserIdentity.ts          # Clerk user + anonymous ID resolution
├── lib/
│   ├── ai.ts                       # Zod schemas for AI output
│   ├── constants.ts                # Default settings, day/meal constants
│   ├── anonymous-id.ts             # Anonymous user ID management
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
- **AI routes:** Use `generateText()` with `Output.object({ schema })` for structured output
- **Models:** Main generation uses `gemini-3-flash-preview`, single meal regen uses `gemini-2.5-flash-lite`
- **Auth flow:** Anonymous users get a UUID stored in localStorage. On Clerk sign-in, anonymous data migrates to the authenticated user via `migrateAnonymousData()`
- **Persistence:** All data stored in Supabase. Contexts fetch on mount using `useUserIdentity()` hook
- **Meal plan history:** All generated plans are saved. Users can view and restore past plans

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
GOOGLE_GENERATIVE_AI_API_KEY=
```
