# frontend_ssr - Transformation Guide

**Purpose:** This document is the canonical reference for every agent working on `frontend_ssr`. Read it fully before making any changes.

---

## 1. WHAT IS THIS PROJECT

`frontend_ssr` is a **ground-up SSR rebuild** of the `frontend` app. The old app was a Vite/React SPA superficially wrapped in Next.js App Router (`"use client"` on every page). The new app prioritises **SEO, server-side rendering, and URL-driven state** from day one.

### Tech stack (same in both)

- **Next.js 15** (App Router, `app/` directory)
- **React 19**, **TypeScript 5**
- **MUI 7** (Material UI) + Emotion
- **SCSS** for global/layout styles
- **Axios** for API calls
- No testing framework yet

### What is explicitly being dropped

| Dropped                           | Replacement in `frontend_ssr`                                                                               |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| **Redux Toolkit** (all slices)    | URL search params for filters; server components for data fetching; local `useState` for ephemeral UI state |
| `react-redux`                     | Not used                                                                                                    |
| `react-infinite-scroll-component` | Server-side pagination (page param in URL), or client pagination via `useRouter`                            |
| `notistack` (toasts via Redux)    | TBD - simple toast context or server actions                                                                |
| Auth0 token in Redux              | `@auth0/auth0-react` client-side (`Auth0Provider` + `useAuth0()`)                                           |
| `mapbox-gl` client-side map       | Ported as client-only component via `next/dynamic` with `{ ssr: false }`                                    |

---

## 2. ARCHITECTURE PRINCIPLES

### 2.1 SEO first

- Every publicly-visible page **must be a Server Component** by default.
- Metadata (`export const metadata` / `generateMetadata`) is mandatory on every page.
- Use `"use client"` only for interactive islands (drawers, dropdowns, form inputs).
- Canonical URLs via `alternates.canonical`.

### 2.2 Filters live in the URL

**This is the single most important architectural decision.**

In the old app, filter state lived in `search.slice.ts` Redux store. Changing a filter dispatched `setQueryAndSearch`, which mutated Redux state and fired an API call client-side.

In `frontend_ssr`, filters are **URL search params**. The flow is:

```
URL params  -->  parseFilters()  -->  GetActivitiesQuery  -->  server fetch  -->  render
     ^                                                                              |
     |______________ user interaction  -->  serializeFilters()  -->  router.replace __|
```

Key files:

- `models/services/filters.service.ts` - `parseFilters()`, `serializeFilters()`, `updateUrlWithQuery()`
- `models/domainDtos.ts` - `GetActivitiesQuery` interface
- `models/OccurrenceDateRangeDto.ts` - date range enum + labels
- `models/OrderByDto.ts` - sort order enum + labels

#### URL param contract

| Param key              | Type                          | Default            | Example                       |
| ---------------------- | ----------------------------- | ------------------ | ----------------------------- |
| `orderBy`              | `OrderByDto` enum             | `Recommended`      | `?orderBy=CreatedOn`          |
| `dateRange`            | `OccurrenceDateRangeDto` enum | `NextFourteenDays` | `?dateRange=ThisWeek`         |
| `customDateStart`      | ISO date string               | -                  | `?customDateStart=2026-03-01` |
| `customDateEnd`        | ISO date string               | -                  | `?customDateEnd=2026-03-15`   |
| `occurrenceType`       | `OccurrenceType` enum         | - (all)            | `?occurrenceType=Events`      |
| `userType`             | `UserType` enum               | -                  | `?userType=Organizer`         |
| `registration`         | `RegistrationType` enum       | -                  | `?registration=Needed`        |
| `maxPrice`             | number                        | -                  | `?maxPrice=50`                |
| `minPrice`             | number                        | -                  | `?minPrice=10`                |
| `maxDuration`          | integer                       | -                  | `?maxDuration=3`              |
| `kidsMinAge`           | integer                       | -                  | `?kidsMinAge=3`               |
| `kidsMaxAge`           | integer                       | -                  | `?kidsMaxAge=10`              |
| `kidsAge`              | integer                       | -                  | `?kidsAge=5`                  |
| `kidsBabysitting`      | boolean                       | -                  | `?kidsBabysitting=true`       |
| `sportType`            | `SportActivityType` enum      | -                  | `?sportType=Group`            |
| `sportLevel`           | `SportAdvancementLevel` enum  | -                  | `?sportLevel=Beginner`        |
| `eventAny`             | boolean                       | -                  | `?eventAny=true`              |
| `pageNumber`           | integer                       | `1`                | `?pageNumber=2`               |
| `pageSize`             | integer                       | `10`               | `?pageSize=20`                |
| `searchTerm`           | string                        | -                  | `?searchTerm=joga`            |
| `categoryIds`          | comma-separated IDs           | -                  | `?categoryIds=1,4,5`          |
| `tagIds`               | comma-separated IDs           | -                  | `?tagIds=410,421`             |
| `regionCity`           | string                        | -                  | `?regionCity=Szczecin`        |
| `regionCountry`        | string                        | -                  | `?regionCountry=Poland`       |
| `coordinatesLatitude`  | number                        | -                  | `?coordinatesLatitude=53.43`  |
| `coordinatesLongitude` | number                        | -                  | `?coordinatesLongitude=14.54` |

#### How to change filters from a client component

```typescript
"use client"
import { useRouter, usePathname } from "next/navigation"
import { updateUrlWithQuery } from "models/services/filters.service"

// Inside component:
const router = useRouter()
const pathname = usePathname()

const navigateWithQuery = (nextQuery: GetActivitiesQuery) =>
  updateUrlWithQuery({
    pathname,
    query: nextQuery,
    navigate: router.replace // replace, NOT push (no history spam)
  })

// Example: change date range
navigateWithQuery({ ...query, dateRange: OccurrenceDateRangeDto.ThisWeek })
```

#### How to read filters on a server page

```typescript
// app/(site)/wydarzenia/page.tsx  (Server Component)
interface Props {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export default async function Page({ searchParams }: Props) {
  const query = parseFilters((await searchParams) ?? {})
  // Use `query` to fetch data server-side, then pass to components as props
}
```

### 2.3 Data fetching

- **Server Components** fetch data directly (using `fetch` or axios in `async` page functions).
- API results are passed to client components as **props**, not stored in Redux.
- Pagination: `pageNumber` in the URL. Changing page = navigating to new URL.
- Infinite scroll (if needed later): client-side fetch for subsequent pages only, first page SSR.

### 2.4 No Redux, no global client state for filters

- Filter state = URL. Period.
- UI-only ephemeral state (dialog open/close, local input value) = `useState`.
- Categories & tags (reference data) = fetched server-side and passed via props or React context.
- User session = Auth0 client-side (`Auth0Provider` in root layout, `useAuth0()` hook in client components).
- Likes/dislikes = React Context (`LikesProvider` wrapping children inside `Auth0Provider`).

### 2.5 Cookie service (`models/services/cookies.service.ts`)

User preferences and cross-session data that doesn't belong in the URL are stored in cookies.

Key improvements over the old `cookieUtils.ts`:

- **Robust parsing** — splits on first `=` only (old code broke if values contained `=`)
- **Security** — all cookies set with `SameSite=Lax`; `Secure` auto-added on HTTPS
- **Safe JSON** — `getJsonCookie<T>()` wraps parse in try/catch, deletes corrupted cookies
- **SSR-safe** — all helpers guard `typeof document === "undefined"`
- **Version guard** — `ensureVersion()` wipes stale cookies when `COOKIE_VERSION` changes
- **No filter cookies** — filters live in URL now; the old `filters` cookie is dropped

Cookie registry (all prefixed `sg_`):
| Cookie | Key | Max-age | Purpose |
|---|---|---|---|
| Version | `sg_v` | 30 days | Version-based invalidation |
| Address | `sg_address` | 7 days | Remember last searched location (JSON) |
| Hide "Show All" | `sg_hide_show_all` | 30 days | "Don't show again" for ShowAllModal |
| Hide content | `sg_hide_{type}` | 30 days | Hide inline info cards (PlacesSearch, SwipeInfo) |

Public API:

```typescript
import {
  getAddressCookie,
  setAddressCookie,
  deleteAddressCookie,
  getHideShowAllModalCookie,
  setHideShowAllModalCookie,
  getHideContentCookie,
  setHideContentCookie,
  HideableContent
} from "models/services/cookies.service"
```

---

## 3. DIRECTORY STRUCTURE

```
frontend_ssr/
├── app/
│   ├── layout.tsx              # Root layout (html, body, ThemeRegistry)
│   ├── globals.scss            # Global CSS
│   ├── styles/                 # SCSS partials (_colours, _variables, etc.)
│   └── (site)/
│       ├── layout.tsx          # Site layout (menu, footer)
│       ├── layout.scss
│       ├── page.tsx            # Homepage (landing)
│       ├── wydarzenia/
│       │   ├── page.tsx        # Search/filter page (main page for SEO)
│       │   └── [id]/
│       │       ├── page.tsx    # Activity detail page (SEO + JSON-LD)
│       │       ├── not-found.tsx
│       │       └── loading.tsx
│       ├── my-activities/
│       │   └── page.tsx        # "Moje aktywności" (auth-gated, "use client")
│       ├── about/page.tsx
│       ├── privacy-policy/page.tsx
│       └── terms-conditions/page.tsx
├── components/                 # Reusable UI components
│   ├── activeFilters/          # Chip-based active filter display
│   ├── activityDetail/         # Activity detail page components
│   │   ├── relatedActivities.tsx  # Client wrapper for related EventCards
│   │   ├── activityMap.tsx     # Single-pin Mapbox map for detail page ("use client")
│   │   └── closeButton.tsx     # Back/close button (history-aware, fallback to /wydarzenia)
│   ├── activityList/           # Infinite scroll activity list
│   │   └── activityList.tsx    # Client component with sessionStorage cache for scroll/page state
│   ├── auth/                   # Authentication & user state
│   │   ├── authProvider.tsx    # Auth0Provider + LikesProvider wrapper ("use client")
│   │   ├── likesContext.tsx    # React Context for liked/disliked activity IDs ("use client")
│   │   └── loginPopup.tsx      # Login prompt modal (shown when unauthenticated user interacts)
│   ├── ctaButtons/             # Homepage CTA tiles
│   │   ├── ctaButtons.tsx      # "Napisz, czego szukasz" + "Pokaż wszystko"
│   │   └── showAllModal.tsx    # Category picker dialog with "don't show again" cookie
│   ├── eventCard/              # Activity card display
│   │   ├── eventCard.tsx       # Responsive card (mobile/desktop/mapCard variants)
│   │   └── likeButton.tsx      # Like/dislike buttons with auth check + login popup
│   ├── filters/                # Filter sidebar (search, date range, type selects)
│   ├── filterDrawer/           # Mobile filter drawer
│   ├── map/                    # Core Mapbox GL component
│   │   └── map.tsx             # Clustering, custom icons, bounds emission ("use client")
│   ├── mapModal/               # Full-screen map search modal
│   │   ├── mapModal.tsx        # Map + filters + EventCard popup ("use client")
│   │   ├── mapModal.scss       # Modal layout styles
│   │   ├── mapButton.tsx       # "Mapa" button + modal (URL-driven open state via ?map=1)
│   │   └── infoBar.tsx         # "Too many results" alert overlay
│   ├── quickSearchBar/         # Horizontal scrollable quick search presets
│   │   └── quickSearchBar.tsx  # Predefined filter links → /wydarzenia?...
│   ├── searchBar/              # Hero banner with category chips + AI search
│   │   ├── searchBar.tsx       # Main bar (category toggles, clear filters)
│   │   ├── searchBar.scss
│   │   └── aiSearchModal.tsx   # AI-powered filter dialog (supports cross-page nav)
│   ├── sortButton/             # Sort order (desktop: inline Select, mobile: button + drawer)
│   ├── emptyState/
│   ├── myActivities/           # "Moje aktywności" page (created & liked activities)
│   │   ├── myActivities.tsx    # Main client component (auth gate, view toggle, filters, cards)
│   │   ├── activitiesCalendar.tsx  # Calendar widget with activity-day dots (desktop)
│   │   └── deleteActivityButton.tsx  # Delete confirmation modal + API call
│   ├── activityForm/           # Activity creator wizard form
│   │   ├── activityForm.tsx    # Main form coordinator (auth gate, step navigation, create/upload)
│   │   ├── stepTemplate.tsx    # Step wrapper with progress bar and back/next buttons
│   │   ├── stepInterface.ts    # Shared types for step components
│   │   └── steps/              # Individual wizard steps
│   │       ├── step1.tsx       # Welcome screen
│   │       ├── step2.tsx       # Description (title, description, website, organizer toggle)
│   │       ├── step3.tsx       # Address (search + map picker)
│   │       ├── step4.tsx       # Photo upload
│   │       ├── step5.tsx       # Date/time (single/repetitive/opening hours)
│   │       ├── step6.tsx       # Category selection
│   │       ├── step7.tsx       # Summary with preview
│   │       ├── addressSearch.tsx        # Address autocomplete with geolocation
│   │       ├── addressPickerMap.tsx     # Mapbox map for address picking
│   │       ├── pictureFormUpload.tsx    # Photo drag-and-drop + camera capture
│   │       ├── durationComponent.tsx    # Duration input (value + unit)
│   │       ├── singleOccurrence.tsx     # Single event date picker
│   │       ├── repetitiveOccurrence.tsx # Recurring event picker
│   │       ├── openingHoursForm.tsx     # Place hours form
│   │       ├── subcategoryTree.tsx      # Category tree with form integration
│   │       └── categoryModal.tsx        # Category picker dialog
│   ├── features/               # Menu, logo
│   ├── infoCards/              # Newsletter, swipeInfo, placesSearch
│   ├── userAvatar/
│   └── legalDocument.tsx
├── models/                     # TypeScript types & domain logic
│   ├── domainDtos.ts           # All DTOs, enums, query interfaces
│   ├── OccurrenceDateRangeDto.ts
│   ├── OrderByDto.ts
│   ├── durationEnum.ts
│   ├── UserDto.ts
│   ├── dtos/
│   │   ├── GetCategoriesQueryResponse.ts
│   │   ├── IssueDto.ts
│   │   └── tagDto.ts
│   └── services/
│       ├── activities.service.ts # Activity API calls (search, map, rate, user likes)
│       ├── filters.service.ts  # URL <-> GetActivitiesQuery conversion
│       └── cookies.service.ts  # Typed cookie helpers (address, UI preferences)
├── utils/
│   └── categoriesUtils.ts      # getWithChildren() - resolve category tree IDs
├── theme/
│   └── ThemeRegistry.tsx       # MUI theme + CacheProvider
├── global.ts                   # Constants (DEFAULT_PAGE_SIZE)
├── next.config.mjs
├── package.json
└── tsconfig.json
```

---

## 4. MAPPING: OLD REDUX -> NEW SSR PATTERN

### search.slice.ts (the big one)

| Old Redux concept                                                             | New SSR approach                                                                         |
| ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `SearchState.query`                                                           | URL search params, parsed via `parseFilters()`                                           |
| `SearchState.results`                                                         | Server-side fetch result, passed as props                                                |
| `SearchState.status`                                                          | `loading.tsx` / Suspense boundaries                                                      |
| `SearchState.hasMore`                                                         | Pagination via `pageNumber` URL param                                                    |
| `SearchState.showMap`                                                         | URL param or local state (TBD)                                                           |
| `SearchState.extendedSearch`                                                  | Server-side logic: if <5 results, widen search on server                                 |
| `SearchState.aiFilter`                                                        | Local `useState` inside `AISearchModal`                                                  |
| `setQueryAndSearch` action                                                    | `updateUrlWithQuery()` -> URL change -> page re-renders                                  |
| `setAiFilter` action                                                          | Local `useState` inside `AISearchModal`                                                  |
| `loadMore` action                                                             | Increment `pageNumber` in URL or client-side fetch for infinite scroll                   |
| `triggerSearch` action                                                        | Not needed - search happens on page load from URL                                        |
| QuickSearchBar presets (`dispatch(setQuery(...))` + `router.push("/search")`) | `serializeFilters(preset)` → `router.push("/wydarzenia?...")` — no Redux, filters in URL |

### common.slice.ts

| Old Redux concept       | New SSR approach                                              |
| ----------------------- | ------------------------------------------------------------- |
| `activities.categories` | Fetch server-side, pass as props or use React Context         |
| `activities.tags`       | Same as categories                                            |
| `homepageActivities`    | Fetch in homepage server component                            |
| `auth0Token`            | `@auth0/auth0-react` `getAccessTokenSilently()` (client-side) |
| `toasts`                | TBD - local context or simple client-side toast manager       |
| `loginPopup`            | Local `useState` in `LikeButton` (opens `LoginPopup` modal)   |
| `backendUnavailable`    | Error boundary / error.tsx                                    |
| `versionMismatch`       | Remove or handle via build-time env var                       |

### activity.slice.ts

| Old Redux concept                        | New SSR approach                                                                                                    |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `createdActivities`                      | Server-side fetch on user profile page (TBD)                                                                        |
| `likedActivities` / `dislikedActivities` | `LikesProvider` React Context — fetches on auth, exposes `likedIds`/`dislikedIds` Sets                              |
| `like/unlike/dislike` actions            | `LikesProvider` context methods (`like()`, `dislike()`, `unlike()`) — call `rateActivity()` API + update local Sets |

### address.slice.ts

| Old Redux concept                | New SSR approach                                                                          |
| -------------------------------- | ----------------------------------------------------------------------------------------- |
| `address`                        | URL params (`regionCity`, `regionCountry`, `coordinatesLatitude`, `coordinatesLongitude`) |
| `coordinatesSouthWest/NorthEast` | Passed as params when map is active (client-side map state)                               |

### Old `cookieUtils.ts`

| Old cookie                     | New SSR approach                                                                     |
| ------------------------------ | ------------------------------------------------------------------------------------ |
| `filters` (persisted query)    | **Dropped** — filters live in URL, no cookie needed                                  |
| `address` (persisted location) | `cookies.service.ts` → `getAddressCookie()` / `setAddressCookie()`                   |
| `hideShowAllModal`             | `cookies.service.ts` → `getHideShowAllModalCookie()` / `setHideShowAllModalCookie()` |
| `hideContent_{type}`           | `cookies.service.ts` → `getHideContentCookie()` / `setHideContentCookie()`           |
| `cookieVersion`                | `cookies.service.ts` → automatic `ensureVersion()` guard on every read/write         |

---

## 5. CATEGORIES SYSTEM

Three top-level categories (main pillars of the app):

- **Rozrywka** (Entertainment) - ID: `1`
- **Sport** - ID: `2`
- **Dla dzieci** (For kids) - ID: `3`

Each has a tree of subcategories (2 levels deep). Category IDs are strings. The full tree is fetched from `GET /Categories` and has the shape `CategoryDto { id, label, mainCategory, children[] }`.

**API gotcha:** `mainCategory` is set on **all** categories, including top-level ones (Rozrywka has `mainCategory: "1"`, Sport has `mainCategory: "2"`, etc.). The `data.categories` array from the API already contains only the 3 top-level items — do **not** filter by `!c.mainCategory` to find top-level categories.

Tags are separate from categories. Tags have types: `Vibe` (IDs 410-418), `Social` (IDs 420-428), `Role` (IDs 430-438).

---

## 6. API ENDPOINTS (known)

| Method | Path                                   | Auth | Used | Purpose                                        |
| ------ | -------------------------------------- | ---- | ---- | ---------------------------------------------- |
| GET    | `/Categories`                          | No   | Yes  | Fetch category tree                            |
| GET    | `/Tags`                                | No   | Yes  | Fetch all tags                                 |
| POST   | `/Activities/getlist`                  | No   | Yes  | Search activities (with filters)               |
| POST   | `/Activities/getmaplist`               | No   | Yes  | Search for map view (bounding box)             |
| GET    | `/Activities/{id}`                     | No   | Yes  | Single activity detail                         |
| POST   | `/Activities/rateactivity`             | Yes  | Yes  | Like/dislike/unlike activity (rating: 1/-1/0)  |
| GET    | `/Users/me`                            | Yes  | Yes  | Current user info (get user ID)                |
| GET    | `/Users/{id}/activities/rated?Rating=` | Yes  | Yes  | User's rated activities (1=liked, -1=disliked) |
| GET    | `/filters?userPrompt=`                 | No   | Yes  | AI-powered filter suggestion                   |
| POST   | `/Activities/homepage`                 | No   | -    | Homepage featured activities                   |
| POST   | `/Activities`                          | Yes  | Yes  | Create activity                                |
| PUT    | `/Activities/{id}`                     | Yes  | Yes  | Update activity                                |
| DELETE | `/Activities/{id}`                     | Yes  | Yes  | Delete activity                                |
| POST   | `/Photos/{activityId}`                 | Yes  | Yes  | Upload photo                                   |
| POST   | `/auth/auth0/register_login`           | No   | -    | Exchange Auth0 token                           |
| GET    | `/Version`                             | No   | -    | Backend version                                |
| POST   | `/Issues/activity`                     | No   | -    | Report issue                                   |
| POST   | `/Dates`                               | Yes  | Yes  | Get occurrence dates                           |
| GET    | `/Users/{id}/activities/created`       | Yes  | Yes  | User's created activities                      |
| GET    | `/Addresses/prompt`                    | No   | Yes  | Address autocomplete suggestions               |
| GET    | `/Addresses/geocode/{address}`         | No   | Yes  | Address geocoding                              |
| POST   | `/Addresses/reversegeocode`            | No   | Yes  | Reverse geocoding (coords to address)          |
| POST   | `/Activities/getsimilar`               | Yes  | Yes  | Check for similar activities                   |
| POST   | `/Activities/getactivitymetadata`      | Yes  | Yes  | AI-generated activity metadata                 |

---

## 7. CONVENTIONS

### File naming

- Components: `camelCase.tsx` (e.g., `sortButton.tsx`, NOT `SortButton.tsx`)
- Exports: PascalCase function names (e.g., `export function SortButton`)
- Models: `camelCase.ts` (e.g., `domainDtos.ts`)
- Services: `feature.service.ts`
- Folders: `camelCase` (e.g., `activeFilters/`)
- SCSS: `camelCase.scss` colocated with component

### Code style

- No semicolons (Prettier: `semi: false`)
- Double quotes
- No blank lines between imports
- TypeScript strict mode
- Prefer `interface` over `type` for object shapes
- Enums for fixed sets of values (not string unions)

### Component patterns

- **Server Component** = default. No directive needed.
- **Client Component** = add `"use client"` at top. Keep as small as possible.
- Props over context. Context only for truly global cross-cutting concerns (theme, auth session).
- Filter components receive `query: GetActivitiesQuery` as a prop from the server page.

### Import order

External libs -> Path aliases -> Relative -> SCSS (no blank lines between groups)

### Path aliases (tsconfig + webpack)

- `@styles` -> `app/styles`
- `@icons` -> `src/img/icons` (if migrated)
- `@images` -> `src/img` (if migrated)
- `components/*` -> `components/*` (baseUrl: `.`)
- `models/*` -> `models/*` (baseUrl: `.`)

---

## 8. CURRENT STATE (what's done, what's not)

### Done

- [x] Project scaffold (Next.js 15 App Router, MUI 7, ThemeRegistry)
- [x] Root layout with lang="pl", fonts, theme
- [x] Site layout with menu, footer, legal links
- [x] Homepage (landing page with hero section) - has CTA buttons, QuickSearchBar; still needs city picker
- [x] `/wydarzenia` page - SSR server component reading URL params
- [x] `parseFilters()` / `serializeFilters()` / `updateUrlWithQuery()` in filters.service.ts
- [x] `Filters` component (search by name, date range, occurrence type, tags picker, category picker)
- [x] `ActiveFilters` component (chip display of active filters)
- [x] `FilterDrawer` component (mobile drawer with all filters including categories and tags)
- [x] `SortButton` component (desktop: inline Select, mobile: button that opens right-side drawer with sort options)
- [x] Static pages (about, privacy-policy, terms-conditions)
- [x] Models/DTOs migrated
- [x] **SearchBar** - hero banner with category chips (Rozrywka/Sport/Dla dzieci toggle), "Wyczysc filtry" card
- [x] **AI Search Modal** - "Szukaj z AI" card opens dialog, calls `GET /filters?userPrompt=`, applies returned filters to URL. Supports `targetPathname` prop for cross-page navigation (homepage -> /wydarzenia via `router.push`)
- [x] **CTA Buttons** - homepage "Napisz, czego szukasz" (opens AI modal targeting `/wydarzenia`) + "Pokaż wszystko" (opens ShowAllModal or navigates directly if cookie set)
- [x] **ShowAllModal** - category picker dialog ("Co chcesz przeglądać?") with toggleable category chips and "Nie pokazuj więcej" checkbox, navigates to `/wydarzenia?categoryIds=...`
- [x] **Cookie service** (`models/services/cookies.service.ts`) - robust typed cookie helpers replacing old `cookieUtils.ts`; address persistence, UI preference cookies (`HideableContent`, hide-show-all-modal), version-based invalidation
- [x] **Server-side category fetch** on `/wydarzenia` and homepage - fetches from `GET /Categories` with 1h ISR, passes to client components as props
- [x] `utils/categoriesUtils.ts` - `getWithChildren()` utility for resolving category tree IDs
- [x] **QuickSearchBar** - horizontal scrollable bar with 6 predefined search presets (e.g. "Weekend w Szczecinie", "Koncerty Szczecin"). Each preset builds a full URL via `serializeFilters()` and navigates with `router.push("/wydarzenia?...")`
- [x] **Activity detail page** (`/wydarzenia/[id]`) - SSR server component with `generateMetadata()`, JSON-LD structured data (Event/LocalBusiness + BreadcrumbList), responsive 3-column layout, related activities, 404 page, loading skeleton
- [x] **Server-side data fetching** on `/wydarzenia` — `searchActivities()` with extended search fallback (<5 event results → relaxed 30-day query)
- [x] **EventCard** component — responsive card with mobile/desktop/mapCard variants, `replace` prop for history management
- [x] **Infinite scroll** — client-side `ActivityList` component with sessionStorage cache for scroll position, extra pages, and page number (first page SSR, subsequent pages client-fetched)
- [x] **Extended search** fallback — when Events filter returns <5 results on page 1, auto-widens to 30-day range without tags; original results shown above divider
- [x] **Map view** — Mapbox GL ported as `"use client"` component via `next/dynamic({ ssr: false })`. Core `Map` component with clustering, 9 custom category icons, `spreadOverlappingPoints`, debounced bounds emission. `MapModal` for full-screen search-as-you-pan (opens via URL param `?map=1`). `ActivityMap` for single-pin on detail page. Viewport persisted in sessionStorage.
- [x] **Auth** — `@auth0/auth0-react` with `Auth0Provider` in root layout, `useAuth0()` in menu for login/logout, `getAccessTokenSilently()` for API calls. Login popup modal (`LoginPopup`) shown when unauthenticated user tries to interact (like/dislike).
- [x] **Like/unlike/dislike** — `LikesProvider` React Context fetches user's rated activities on auth, exposes `likedIds`/`dislikedIds` Sets. `LikeButton` shows filled/outline thumb icons, toggles via `rateActivity()` API. Unauthenticated users see `LoginPopup`.
- [x] **My Activities page** (`/my-activities`) — auth-gated `"use client"` page. Two view modes (created vs liked), four filter tabs (Wszystkie/Aktywne/Zakończone/Miejsca), calendar widget with activity-day dots (desktop), QR code download for created activities, delete confirmation modal. Service functions: `fetchUserCreatedActivities`, `fetchUserLikedActivitiesFull`, `deleteActivity`.
- [x] **Add Activity page** (`/add-activity`) — auth-gated 7-step wizard form for creating activities. Steps: welcome, description, address (with map picker), photo upload, date/time configuration (single/repetitive/opening hours), category selection, and summary with preview. Uses `react-hook-form`, `react-dropzone`, `mapbox-gl`, `@mui/x-date-pickers`, `@mui/x-tree-view`. Components in `components/activityForm/`. Service functions: `createActivity`, `updateActivity`, `getSimilarActivities`, `getActivityMetadata`, `getDates`, `uploadPhoto` in `activities.service.ts`. Address service: `getAddressPrompt`, `geocodeAddress`, `reverseGeocode` in `address.service.ts`. Duration helpers in `utils/durationUtils.ts`.

### Not done yet

- [ ] **Address search** (geocoding + location input in SearchBar)
- [ ] **User profile** pages
- [ ] **Toasts / notifications**
- [ ] **Error boundaries** (error.tsx files)
- [ ] **Sitemap** generation
- [ ] Price/duration filters UI
- [ ] Kids-specific filters UI
- [ ] Sport-specific filters UI

---

## 9. RULES FOR AGENTS

1. **Read this file first.** Before any code change, read TRANSFORMATION.md.
2. **No Redux.** Do not install, import, or create Redux slices. Filter state = URL params.
3. **Server Components by default.** Only add `"use client"` when the component needs interactivity (event handlers, hooks like useState/useEffect, browser APIs).
4. **Filters flow through URL.** Use `parseFilters()` on the server, `updateUrlWithQuery()` on the client. Never store filter state in React state or context.
5. **Pass data as props.** Server component fetches data, passes it down. No client-side global state for API data.
6. **Follow existing conventions.** camelCase files, no semicolons, double quotes, existing import patterns.
7. **SEO metadata on every page.** Use `export const metadata` for static, `generateMetadata()` for dynamic pages.
8. **Keep client components small.** Extract the interactive part into a small client component; keep layout/data in server components.
9. **Don't import from `frontend/`.** The old app is reference only. Copy and adapt patterns, don't import across projects.
10. **Run `npm run check` before considering work done** (format + lint + type-check).

---

## 10. QUICK REFERENCE: OLD -> NEW PATTERN TRANSLATION

### "I need to dispatch an action to change a filter"

```typescript
// OLD (Redux):
dispatch(setQueryAndSearch({ ...query, dateRange: OccurrenceDateRangeDto.ThisWeek }))

// NEW (URL):
navigateWithQuery({ ...query, dateRange: OccurrenceDateRangeDto.ThisWeek })
```

### "I need to read the current filter state"

```typescript
// OLD (Redux):
const query = useAppSelector(selectQuery)

// NEW (Server Component):
const query = parseFilters((await searchParams) ?? {})

// NEW (Client Component - receives from parent):
function MyComponent({ query }: { query: GetActivitiesQuery }) { ... }
```

### "I need to fetch search results"

```typescript
// OLD (Redux):
dispatch(triggerSearch())  // fires API call, stores in Redux

// NEW (Server Component):
export default async function Page({ searchParams }) {
  const query = parseFilters((await searchParams) ?? {})
  const response = await fetch(`${API_URL}/Activities/search`, {
    method: "POST",
    body: JSON.stringify(query)
  })
  const results = await response.json()
  return <ResultsList results={results.activities} />
}
```

### "I need to load categories/tags"

```typescript
// OLD:
dispatch(getSubcategories())  // stored in Redux common slice

// NEW:
// Fetch in server component or layout, pass as props
const categories = await fetch(`${API_URL}/Categories`).then(r => r.json())
return <Filters query={query} categories={categories} />
```

### "I need to compute category groups (sport/event/kids ID arrays)"

```typescript
// This is done server-side in wydarzenia/page.tsx and passed as props
import { getWithChildren } from "utils/categoriesUtils"

const categories = await fetchCategories()
const categoryGroups = {
  sport: getWithChildren(categories, ["2"]),
  event: getWithChildren(categories, ["1"]),
  kids: getWithChildren(categories, ["3"])
}
return <SearchBar query={query} categoryGroups={categoryGroups} />
```

### "I need to apply AI-generated filters"

```typescript
// OLD (Redux):
getFiltersApi(userPrompt).then(response => {
  dispatch(setQuery({ ...query, ...response.data }))
  dispatch(triggerSearch())
})

// NEW (URL):
// Inside AISearchModal (client component):
const res = await fetch(`${API_URL}/filters?userPrompt=${encodeURIComponent(aiFilter)}`)
const responseData: GetUserFiltersQueryResponse = await res.json()
const newQuery = { ...query, categoryIds: responseData.categoryIds, ... }
updateUrlWithQuery({ pathname, query: newQuery, navigate: router.replace })
// URL change triggers server re-render automatically
```

### "I need to persist/read a user preference (e.g. 'don't show again')"

```typescript
// OLD (cookieUtils.ts):
import { getHideShowAllModalCookie, setHideShowAllModalCookie } from "../../utils/cookieUtils"
document.cookie = `hideShowAllModal=${hide ? "true" : "false"}; path=/; max-age=2592000;`

// NEW (cookies.service.ts):
import {
  getHideShowAllModalCookie,
  setHideShowAllModalCookie
} from "models/services/cookies.service"

// Read (SSR-safe, version-guarded, returns boolean):
const shouldSkip = getHideShowAllModalCookie()

// Write (sets SameSite=Lax, Secure on HTTPS, auto version check):
setHideShowAllModalCookie(true)
```

### "I need a quick-search link that sets multiple filters at once"

```typescript
// OLD (Redux):
const preset = { categoryIds: ["112"], dateRange: OccurrenceDateRangeDto.Today, ... }
dispatch(setQuery({ ...query, ...preset }))
dispatch(setAddress(preset.address))
router.push("/search")

// NEW (URL):
// Build a partial GetActivitiesQuery, serialize it, and navigate:
const preset: Partial<GetActivitiesQuery> = {
  categoryIds: ["112"],
  dateRange: OccurrenceDateRangeDto.Today,
  region: { city: "Szczecin" },
  coordinates: { latitude: 53.43, longitude: 14.55 }
}
const params = serializeFilters(preset as GetActivitiesQuery)
router.push(`/wydarzenia?${params.toString()}`)
```

### "I need to navigate to /wydarzenia with filters from another page (e.g. homepage)"

```typescript
// Use AISearchModal with targetPathname prop:
<AISearchModal
  open={aiSearchOpen}
  onClose={() => setAiSearchOpen(false)}
  targetPathname="/wydarzenia"  // uses router.push instead of router.replace
/>

// Or navigate directly without filters:
router.push("/wydarzenia")

// Or navigate with specific filters:
updateUrlWithQuery({
  pathname: "/wydarzenia",
  query: someQuery,
  navigate: router.push  // push (adds to history) for cross-page, replace for same-page
})
```
