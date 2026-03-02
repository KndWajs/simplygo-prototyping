# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run check` — format + lint + type-check (run before committing)
- `npm run type-check` — TypeScript only (`tsc --noEmit`)
- `npm run lint` — ESLint via Next.js
- `npm run lint:fix` — ESLint with auto-fix
- `npm run format` — Prettier

No test framework is configured.

## Architecture

**SimplyGo** is a Polish activity discovery platform (events, sports, kids activities) built with Next.js 15 App Router, React 19, MUI 7, and Mapbox GL.

### Routing & Rendering

- App Router with route group `app/(site)/` for all public pages
- Pages are **server components** by default; interactive components use `"use client"`
- `middleware.ts` health-checks the backend API on every request and redirects to `/maintenance` if it's down
- `app/actions.ts` has server actions (e.g. `revalidateActivity`)
- Auth0 callback handled at `app/callback/`

### Data Flow

- **Services** (`models/services/`) make `fetch()` calls to `NEXT_PUBLIC_API_URL` with Next.js cache/revalidation directives
- `activities.service.ts` — CRUD, search, ratings, photo upload, AI metadata suggestions
- `filters.service.ts` — parses URL search params into `GetActivitiesQuery`, serializes back for navigation
- Auth tokens from Auth0 passed as Bearer tokens to protected endpoints
- No Redux in active use; state is managed via React Context (`LikesContext` for likes, Auth0 provider for auth)

### Domain Model

Core types in `models/domainDtos.ts`:

- **ActivityType**: `Kids`, `Sport`, `Event` — each has a theme color (`KIDS_COLOR`, `SPORT_COLOR`, `EVENT_COLOR` in `theme/ThemeRegistry.tsx`)
- **OccurrenceType**: `Single`, `Repetitive`, `OpeningHours`, `Events`, `Places`, `Both`
- Activities have a `base` object with description, coordinates, website, contact info, categories, tags

### Styling

- **MUI 7** with Emotion — primary: `#ff6b35`, secondary: `#9933FF`
- SCSS files for component-scoped styles (path alias `@styles` → `app/styles/`)
- Theme in `theme/ThemeRegistry.tsx` wraps app with `AppRouterCacheProvider`
- SVGs: import with `?react` query for React components, otherwise static assets

### Key Conventions

- All UI text is in **Polish**
- No semicolons, double quotes, no trailing commas (Prettier config)
- Path aliases: `@styles/*`, `@icons/*`, `@images/*`; also bare `components/`, `models/`, `utils/`, `theme/` (via tsconfig paths)
- `output: "standalone"` in next.config for containerized deployment
- ESLint allows `any` types and `@ts-ignore` comments

### Environment Variables

```
NEXT_PUBLIC_API_URL          # Backend API base URL
NEXT_PUBLIC_SITE_URL         # Site URL (for SSR fetch)
NEXT_PUBLIC_MAPBOX_TOKEN     # Mapbox GL token
NEXT_PUBLIC_AUTH0_DOMAIN     # Auth0 domain
NEXT_PUBLIC_AUTH0_CLIENT_ID  # Auth0 client ID
NEXT_PUBLIC_AUTH0_AUDIENCE   # Auth0 API audience
```
