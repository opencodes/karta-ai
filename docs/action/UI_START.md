# UI Start Plan for MVP_001

## Build Order
1. `apps/web` command workspace with one-sentence input (`Cmd` style bar).
2. `Now` (next 4h) + `Later` (upcoming) task lists.
3. Route for `Admin` to inspect history of featured items.
4. Local state first; backend API integration second.

## Why this order
- Matches MVP definition of done quickly.
- Keeps parser and UI independent so LLM parser can replace regex later.
- Gives admin/history navigation early without blocking core flow.

## Current scaffold
- React + TypeScript + Vite app in `apps/web`.
- Branded theme from marketing docs:
  - Midnight Navy `#0A192F`
  - Electric Teal `#64FFDA`
  - Slate `#8892B0`
- Parser utility with category + basic date/time extraction.
- Workspace route `/` and admin route `/admin`.

## Next implementation steps
1. Replace demo auth with backend auth provider (Supabase/Firebase/Auth0).
2. Replace parser with backend endpoint (`POST /tasks/parse`).
3. Add task completion + archive flow.
4. Add category icons and richer time parsing.

## Completed in scaffold
- Local storage persistence for task history.
- Command bar focus shortcut (`Cmd+K` / `Ctrl+K`).
- Auth context + login route + protected role-based `/admin` route.
