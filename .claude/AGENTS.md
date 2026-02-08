# Agent Configuration for PlateMyDay

## Project Setup

### Package Manager
**Always use `bun` instead of `npm` for this project.**

- Install dependencies: `bun install`
- Run dev server: `bun run dev`
- Build project: `bun run build`
- Add packages: `bun add <package-name>`
- Remove packages: `bun remove <package-name>`

### LLM Provider
This project uses **Google Gemini** as the LLM provider (not Claude/Anthropic).

- Provider package: `@ai-sdk/google`
- Model: `gemini-3-flash-preview`
- Environment variable: `GOOGLE_GENERATIVE_AI_API_KEY`

## Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Runtime**: Bun
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **AI SDK**: Vercel AI SDK with Google provider
- **State Management**: React Context
- **Validation**: Zod v3

## Development Commands

```bash
bun install          # Install dependencies
bun run dev          # Start development server
bun run build        # Build for production
bun run start        # Start production server
bun run lint         # Run ESLint
```

## Notes

- This project was migrated from npm to bun for faster package management and runtime performance
- Zod v3 is used for compatibility with @ai-sdk/google
- The project uses local storage for data persistence (recipes, meal plans, settings)
