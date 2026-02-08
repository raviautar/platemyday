# PlateMyDay - Cursor Agent Guide

## Project Summary

**PlateMyDay** is an AI-powered meal planning application that helps users create and manage recipes and generate weekly meal plans using Google Gemini AI.

### Core Features
- Recipe management (Create, Read, Update, Delete)
- AI-powered recipe generation
- Weekly meal planning with AI assistance
- Drag-and-drop meal organization
- Customizable AI prompts

### Technology Stack
- **Framework**: Next.js 16 (App Router)
- **Runtime**: Bun (package manager and runtime)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **AI Provider**: Google Gemini (`gemini-3-flash-preview`) via Vercel AI SDK
- **State Management**: React Context API
- **Validation**: Zod v3
- **Drag & Drop**: @hello-pangea/dnd
- **Data Persistence**: Browser localStorage

### Project Structure

```
platemyday/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # API routes for AI generation
│   │   ├── meal-plan/         # Meal planning page
│   │   ├── recipes/           # Recipe management page
│   │   └── settings/          # Settings page
│   ├── components/            # React components
│   │   ├── layout/           # App shell, navigation
│   │   ├── meal-plan/        # Meal plan UI components
│   │   ├── recipes/          # Recipe UI components
│   │   └── ui/               # Reusable UI components
│   ├── contexts/             # React Context providers
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utilities (AI schemas, constants)
│   └── types/                # TypeScript type definitions
└── public/                   # Static assets
```

## Key Files for Agent Navigation

### Core Application
- `src/app/layout.tsx` - Root layout with metadata and font configuration
- `src/components/layout/AppShell.tsx` - App shell with all context providers (Recipe, MealPlan, Settings, Toast)
- `src/components/layout/Sidebar.tsx` - Desktop navigation sidebar
- `src/components/layout/BottomNav.tsx` - Mobile bottom navigation
- `src/app/globals.css` - Global styles and Tailwind CSS configuration

### Recipe Management
- `src/app/recipes/page.tsx` - Recipes page with list, modals, and state management
- `src/contexts/RecipeContext.tsx` - Recipe state management and CRUD operations
- `src/components/recipes/RecipeList.tsx` - Recipe list display with search
- `src/components/recipes/RecipeCard.tsx` - Individual recipe card component
- `src/components/recipes/RecipeForm.tsx` - Recipe create/edit form
- `src/components/recipes/RecipeDetail.tsx` - Recipe detail view modal
- `src/components/recipes/AIRecipeGenerator.tsx` - AI recipe generation modal
- `src/app/api/generate-recipe/route.ts` - API endpoint for AI recipe generation

### Meal Planning
- `src/app/meal-plan/page.tsx` - Meal plan page with generation logic
- `src/contexts/MealPlanContext.tsx` - Meal plan state management
- `src/components/meal-plan/WeekView.tsx` - Week grid with drag-and-drop functionality
- `src/components/meal-plan/DayColumn.tsx` - Individual day column component
- `src/components/meal-plan/MealCard.tsx` - Individual meal card component
- `src/components/meal-plan/MealPlanControls.tsx` - Controls for generating/clearing plans
- `src/app/api/generate-meal-plan/route.ts` - API endpoint for AI meal plan generation

### Settings
- `src/app/settings/page.tsx` - Settings page for customizing AI prompts
- `src/contexts/SettingsContext.tsx` - Settings state management

### Types & Utilities
- `src/types/index.ts` - TypeScript interfaces (Recipe, MealSlot, WeekPlan, etc.)
- `src/lib/ai.ts` - Zod schemas for AI structured outputs
- `src/lib/constants.ts` - Constants (days of week, meal types, storage keys)
- `src/hooks/useLocalStorage.ts` - Custom hook for localStorage persistence

### UI Components
- `src/components/ui/Button.tsx` - Button component
- `src/components/ui/Input.tsx` - Input component
- `src/components/ui/Textarea.tsx` - Textarea component
- `src/components/ui/Toast.tsx` - Toast notification system
- `src/components/ui/Modal.tsx` - Modal component
- `src/components/ui/LoadingSpinner.tsx` - Loading spinner

## Rules & Conventions

### Package Management
- **ALWAYS use `bun` instead of `npm`** for this project
- Install dependencies: `bun install`
- Add packages: `bun add <package-name>`
- Remove packages: `bun remove <package-name>`
- Run dev server: `bun run dev`

### AI Provider
- This project uses **Google Gemini** (NOT Claude/Anthropic)
- Provider package: `@ai-sdk/google`
- Model: `gemini-3-flash-preview`
- Environment variable: `GOOGLE_GENERATIVE_AI_API_KEY`

### Code Style
- **No AI-slop comments**: Only add comments if absolutely necessary and logic is not straightforward
- Use TypeScript for type safety
- Use React Context for state management
- All data is stored in localStorage

### Data Flow
1. User actions trigger context updates (Recipe, MealPlan, Settings)
2. Context updates automatically sync to localStorage via `useLocalStorage` hook
3. Components read from context using custom hooks (`useRecipes`, `useMealPlan`, `useSettings`)
4. AI generation happens via API routes that use Vercel AI SDK with Google provider

### Storage Keys
- Recipes: `platemyday-recipes`
- Meal Plans: `platemyday-meal-plans`
- Settings: `platemyday-settings`

All storage keys are defined in `src/lib/constants.ts`

## Development Workflow

```bash
# Setup
bun install
cp .env.local.example .env.local  # Add your GOOGLE_GENERATIVE_AI_API_KEY

# Development
bun run dev          # Start dev server at http://localhost:3000
bun run build        # Build for production
bun run start        # Start production server
bun run lint         # Run ESLint
```

## Common Tasks

### Adding a New Recipe Property
1. Update `Recipe` interface in `src/types/index.ts`
2. Update `recipeSchema` in `src/lib/ai.ts` if AI-generated
3. Update `RecipeForm` component to include the new field
4. Update `RecipeCard` or `RecipeDetail` to display the new property

### Adding a New Page
1. Create page in `src/app/[page-name]/page.tsx`
2. Add navigation link in `src/components/layout/Sidebar.tsx`
3. Add navigation link in `src/components/layout/BottomNav.tsx`

### Modifying AI Prompts
1. Update default prompts in `src/contexts/SettingsContext.tsx`
2. Users can customize prompts in the Settings page
3. API routes accept custom system prompts in request body

## Architecture Notes

- **Client-side only**: All data is stored in localStorage, no backend database
- **React Server Components**: Pages are server components by default, use `'use client'` for interactivity
- **Context providers**: All wrapped in `AppShell` component
- **Type safety**: Zod schemas validate AI outputs before processing
- **Responsive design**: Mobile-first approach with Tailwind CSS
