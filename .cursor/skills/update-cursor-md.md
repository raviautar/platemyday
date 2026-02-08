# Update cursor.md Skill

## Purpose
Automatically update the `cursor.md` file with crucial project information while maintaining focus on high-impact signals only.

## When to Use
- User explicitly asks to update cursor.md
- After major architectural changes
- When new critical patterns or rules are established
- After adding significant new features or dependencies

## Instructions

### 1. Read Current State
Read the current `cursor.md` file to understand existing content.

### 2. Identify What to Update
Determine if any of these HIGH-IMPACT categories need updates:
- **Critical Rules**: Package manager, AI provider, environment variables, coding standards
- **Tech Stack**: Framework, runtime, major dependencies
- **Architecture Essentials**: Data flow, state management, key entry points
- **Common Patterns**: Frequent modification workflows
- **Quick Commands**: Essential development commands

### 3. Apply the "High-Impact Only" Filter
**INCLUDE** information that:
- Prevents common mistakes (e.g., "use bun not npm")
- Saves significant exploration time (e.g., "all contexts in AppShell.tsx")
- Is non-obvious from file structure (e.g., "localStorage keys in constants.ts")
- Affects multiple parts of the codebase (e.g., "Google Gemini not Claude")

**EXCLUDE** information that:
- Can be easily found by reading a single file
- Is standard practice (e.g., "use TypeScript for type safety")
- Is overly detailed (e.g., listing every component file)
- Is self-documenting in code

### 4. Update Structure
Maintain this structure:
```markdown
# [Project Name] - Cursor Agent Guide

> **META**: Keep this file focused on HIGH-IMPACT signals only...

## Critical Rules
[5-7 most important rules]

## Project Overview
[2-3 sentence summary + tech stack]

## Architecture Essentials
[Data flow, key entry points, storage patterns]

## Common Modification Patterns
[3-5 frequent tasks with minimal steps]

## Quick Commands
[Essential bun/npm commands]

## Important Notes
[3-5 architectural notes]
```

### 5. Write Updates
Use StrReplace to update specific sections. Keep language concise and scannable.

### 6. Verify
After updating, briefly confirm what was changed and why it's important.

## Examples

### Good Update (High-Impact)
```markdown
## Critical Rules
5. **Build verification**: Always run `bun run build` after completing new features to verify everything works
```
*Why: Prevents broken production builds, applies to all features*

### Bad Update (Too Detailed)
```markdown
## Recipe Components
- RecipeCard.tsx has a hover effect on line 23
- RecipeForm uses controlled inputs with useState
- RecipeDetail modal has a close button in the top right
```
*Why: Too granular, easily discoverable by reading the files*

### Good Update (Architecture)
```markdown
## Architecture Essentials
- **Logo**: `public/logo.png` - Used in Sidebar and as favicon
```
*Why: Non-obvious location, affects multiple places*

### Bad Update (Obvious)
```markdown
## File Locations
- Components are in src/components/
- Pages are in src/app/
- Types are in src/types/
```
*Why: Standard Next.js structure, self-evident*

## Success Criteria
- cursor.md remains under 100 lines
- Each line provides actionable, high-impact information
- New agents can understand critical patterns in 2-3 minutes
- No redundant or easily-discoverable information
- All "Critical Rules" are genuinely critical

## Anti-Patterns to Avoid
- ❌ Listing every file in the project
- ❌ Explaining standard framework conventions
- ❌ Including implementation details
- ❌ Documenting obvious naming patterns
- ❌ Adding information that's only relevant once

## Post-Update Action
After updating cursor.md, inform the user:
1. What sections were updated
2. Why the changes are important
3. Confirm the file remains focused on high-impact signals
