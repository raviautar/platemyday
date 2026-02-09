# PlateMyDay - Cursor Agent Guide

> **META**: Keep this file focused on HIGH-IMPACT signals only. No nitty-gritty details. Information here should help agents navigate and understand the project without extensive exploration.

## Critical Rules

1. **ALWAYS use `bun`** (not npm) - `bun install`, `bun add`, `bun run build`
2. **AI Provider**: Google Gemini (`gemini-3-flash-preview`) via `@ai-sdk/google` - NOT Claude/Anthropic
3. **Environment**: `GOOGLE_GENERATIVE_AI_API_KEY` + Clerk keys (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`) in `.env.local`
4. **Auth**: Clerk for optional authentication - app works without login, auth only for saving recipes
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
- **AI**: Google Gemini via Vercel AI SDK
- **Auth**: Clerk (optional, for recipe storage)
- **State**: React Context + localStorage
- **Validation**: Zod v3
- **Icons**: Lucide React

## Architecture Essentials

### Data Flow
1. **State Management**: React Context (Recipe, MealPlan, Settings) → auto-syncs to localStorage
2. **AI Generation**: 
   - Recipe generation: `generateText` with `Output.object()` → complete recipe object
   - Meal plan generation: `streamText` with `Output.object()` → Server-Sent Events → progressive UI updates
   - API routes: `/api/generate-recipe`, `/api/generate-meal-plan`
3. **Storage Keys**: `platemyday-recipes`, `platemyday-meal-plans`, `platemyday-settings` (defined in `src/lib/constants.ts`)

### Key Entry Points
- **Layout**: `src/app/layout.tsx` - ClerkProvider wraps app, then AppShell with context providers
- **Navigation**: `src/components/layout/Sidebar.tsx` (desktop), `BottomNav.tsx` (mobile) + logo at `public/logo.png`
- **Auth Middleware**: `src/middleware.ts` - Clerk config (all routes public)
- **Types**: `src/types/index.ts` - Core interfaces (Recipe, MealSlot, WeekPlan, AppSettings, LoadingRecipe)
- **AI Schemas**: `src/lib/ai.ts` - Zod schemas for AI validation (recipeSchema, mealPlanSchema, mealPlanWithDetailsSchema)
- **Contexts**: `src/contexts/` - RecipeContext, MealPlanContext, SettingsContext
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
- Use `streamText` with `Output.object({ schema })` (NOT deprecated `streamObject`)
- Access partial results via `partialOutputStream` (NOT `partialObjectStream`)
- Final result via `.output` property (NOT `.object`)
- Meal plan streaming: Shows loading states, progressive recipe details, cancellation support

## Quick Commands

```bash
bun install                    # Setup dependencies
bun run build                  # Build for production (ALWAYS run after new features)
bun run lint                   # Run ESLint
# bun run dev                  # DO NOT RUN - dev server already running in background
```

## Important Notes

- **Client-side only**: No backend database, all localStorage
- **Server Components**: Use `'use client'` for interactivity
- **Type safety**: Zod validates all AI outputs
- **Responsive**: Mobile-first with Tailwind CSS
- **Streaming UX**: Meal plans stream recipe details progressively with loading states, skeletons, and manual "Add to Library" for new recipes