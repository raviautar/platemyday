# PlateMyDay - Cursor Agent Guide

> **META**: Keep this file focused on HIGH-IMPACT signals only. No nitty-gritty details. Information here should help agents navigate and understand the project without extensive exploration.

## Critical Rules

1. **ALWAYS use `bun`** (not npm) - `bun install`, `bun add`, `bun run dev`
2. **AI Provider**: Google Gemini (`gemini-3-flash-preview`) via `@ai-sdk/google` - NOT Claude/Anthropic
3. **Environment**: `GOOGLE_GENERATIVE_AI_API_KEY` required in `.env.local`
4. **No AI-slop comments** - Only comment when logic is non-obvious
5. **Build verification**: Always run `bun run build` after completing new features to verify everything works

## Project Overview

AI-powered meal planning app with recipe management and weekly meal planning using Google Gemini.

### Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Runtime**: Bun
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **AI**: Google Gemini via Vercel AI SDK
- **State**: React Context + localStorage
- **Validation**: Zod v3

## Architecture Essentials

### Data Flow
1. **State Management**: React Context (Recipe, MealPlan, Settings) → auto-syncs to localStorage
2. **AI Generation**: API routes (`/api/generate-recipe`, `/api/generate-meal-plan`) → Vercel AI SDK → Google Gemini
3. **Storage Keys**: `platemyday-recipes`, `platemyday-meal-plans`, `platemyday-settings` (defined in `src/lib/constants.ts`)

### Key Entry Points
- **Layout**: `src/components/layout/AppShell.tsx` - All context providers wrapped here
- **Navigation**: `src/components/layout/Sidebar.tsx` (desktop) + logo at `public/logo.png`
- **Types**: `src/types/index.ts` - Core interfaces (Recipe, MealSlot, WeekPlan)
- **AI Schemas**: `src/lib/ai.ts` - Zod schemas for AI validation
- **Contexts**: `src/contexts/` - RecipeContext, MealPlanContext, SettingsContext

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

## Quick Commands

```bash
bun install                    # Setup dependencies
bun run dev                    # Start dev server (localhost:3000)
bun run build                  # Build for production (ALWAYS run after new features)
bun run lint                   # Run ESLint
```

## Important Notes

- **Client-side only**: No backend database, all localStorage
- **Server Components**: Use `'use client'` for interactivity
- **Type safety**: Zod validates all AI outputs
- **Responsive**: Mobile-first with Tailwind CSS
