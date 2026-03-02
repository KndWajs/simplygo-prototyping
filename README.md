# Simplygo Frontend (Next.js)

This frontend now runs on **Next.js App Router** with a client-first migration strategy. Existing page components live under `src/pages` and are rendered by Next route files in `app/`.

## Scripts

- `dev` - start Next.js in development mode
- `build` - build the Next.js app
- `start` - run the production server
- `lint` - run Next.js linting
- `type-check` - TypeScript type checking
- `check` - format, lint, and type-check

## Migration Notes

### Route Mapping

- `/` → `app/(site)/page.tsx` → `src/pages/homePage`
- `/search` → `app/(site)/search/page.tsx` → `src/pages/searchResult/searchResult`
- `/search/[id]` → `app/(site)/search/[id]/page.tsx` (renders SearchResult + ActivityModal)
- `/query` → `app/(site)/query/page.tsx` → `src/pages/query/query`
- `/my-activities` → `app/(site)/my-activities/page.tsx` → `src/pages/my-activities/myActivities`
- `/my-activities/[id]` → `app/(site)/my-activities/[id]/page.tsx` (renders MyActivities + ActivityModal)
- `/activity/[id]` → `app/(site)/activity/[id]/page.tsx` → `src/pages/searchResult/features/activityDetails`
- `/add-activity` → `app/(site)/add-activity/page.tsx` → `src/pages/activityForm/activityForm`
- `/privacy-policy` → `app/(site)/privacy-policy/page.tsx` → `src/pages/privacyPolicy/privacyPolicy`
- `/terms-conditions` → `app/(site)/terms-conditions/page.tsx` → `src/pages/termsConditions/termsConditions`
- `/about` → `app/(site)/about/page.tsx` → `src/pages/about/about`
- `/dev` → `app/(site)/dev/page.tsx` → `src/pages/dev/dev`
- `/maintenance` → `app/maintenance/page.tsx` → `src/pages/maintenance/maintenancePage`
- `/server-example` → `app/server-example/page.tsx` (server-first example)

### Providers Wiring

- `app/providers.tsx` is a Client Component that wraps:
  - Auth0 provider
  - Redux provider
  - `App` (theme, cookies, global effects)
- `app/(site)/layout.tsx` applies the existing `Layout` chrome and redirects to `/maintenance` when the backend is unavailable.

### Phase 2 Conversion Checklist

1. Remove `'use client'` from the `page.tsx`.
2. Fetch data on the server in `page.tsx` (direct `fetch` or server API layer).
3. Create a client island for interactive UI (e.g., filters, forms, or buttons).
4. (Optional) Hydrate the Redux store with preloaded state in `app/providers.tsx`.
5. Add/adjust `loading.tsx` and caching/revalidation strategy.

### Redux Preloading / Hydration Notes

- The Redux store is created in `app/providers.tsx` using `makeStore()` to keep client state isolated.
- If server preloading is needed later, pass `preloadedState` into `makeStore()` and hydrate the client store in `Providers`.
