import type { Coordinates } from "./domainDtos"
import { getSubcategoryIds } from "utils/categoriesUtils"
import { CATEGORIES } from "../data/categories"

// --- Valid slugs ---

export const VALID_VERTICALS = new Set([
  "dla-dzieci",
  "koncerty",
  "sport",
  "rozrywka",
  "weekend"
])

export const VALID_CITY_SLUGS = new Set(["szczecin"])

// --- City data ---

interface CityInfo {
  label: string
  coordinates: Coordinates
  locative: string // Polish locative case for "w ..."
}

export const CITY_DATA: Record<string, CityInfo> = {
  szczecin: {
    label: "Szczecin",
    coordinates: { latitude: 53.43786715839242, longitude: 14.542767164110858 },
    locative: "Szczecinie"
  }
}

// --- Vertical → filter mapping ---

// Category IDs matching backend seed data:
// 1 = Rozrywka (Events), 2 = Sport, 3 = Dla dzieci (Kids)
// 181 = Koncerty i muzyka, 112 = Koncerty klubowe i live music, 151 = Festiwale muzyczne i artystyczne
const VERTICAL_CATEGORY_MAP: Record<string, string[]> = {
  sport: ["2"],
  "dla-dzieci": ["3"],
  rozrywka: ["1"],
  koncerty: ["181", "112", "151"]
}

const VERTICAL_DATE_MAP: Record<string, string> = {
  weekend: "ThisWeekend"
}

export function mapLandingToFilters(opts: { city: string; vertical?: string }) {
  const cityInfo = CITY_DATA[opts.city]
  if (!cityInfo) return null

  const filters: {
    categoryIds?: string[]
    dateRange?: string
    region: { city: string; country: string }
    coordinates: Coordinates
  } = {
    region: { city: cityInfo.label, country: "Poland" },
    coordinates: cityInfo.coordinates
  }

  if (opts.vertical) {
    const parentIds = VERTICAL_CATEGORY_MAP[opts.vertical]
    if (parentIds) {
      filters.categoryIds = getSubcategoryIds(CATEGORIES, parentIds)
    }
    const dr = VERTICAL_DATE_MAP[opts.vertical]
    if (dr) filters.dateRange = dr
  }

  return filters
}

// --- Reverse mapping: searchParams → landing URL ---

export function mapFiltersToLanding(
  searchParams: Record<string, string | string[] | undefined>
): string | null {
  const regionCity = asString(searchParams.regionCity)
  const categoryIds = asString(searchParams.categoryIds)

  if (!regionCity) return null

  const citySlug = Object.entries(CITY_DATA).find(
    ([, info]) => info.label.toLowerCase() === regionCity.toLowerCase()
  )?.[0]

  if (!citySlug) return null

  // Check if only simple filters are applied (city + optionally one category or dateRange)
  const hasSearch = !!searchParams.searchTerm
  const hasTagIds = !!searchParams.tagIds
  const hasOccurrence =
    searchParams.occurrenceType && searchParams.occurrenceType !== "Events"
  const hasPrice = !!searchParams.maxPrice || !!searchParams.minPrice
  const hasKids = !!searchParams.kidsMinAge || !!searchParams.kidsMaxAge
  const hasSport = !!searchParams.sportType || !!searchParams.sportLevel

  if (hasSearch || hasTagIds || hasOccurrence || hasPrice || hasKids || hasSport) {
    return null
  }

  // Match vertical
  if (categoryIds) {
    const verticalEntry = Object.entries(VERTICAL_CATEGORY_MAP).find(
      ([, ids]) => ids.join(",") === categoryIds
    )
    if (verticalEntry) {
      return `/wydarzenia/${citySlug}/${verticalEntry[0]}`
    }
  }

  const dateRange = asString(searchParams.dateRange)
  if (dateRange) {
    const verticalEntry = Object.entries(VERTICAL_DATE_MAP).find(
      ([, dr]) => dr === dateRange
    )
    if (verticalEntry) {
      return `/wydarzenia/${citySlug}/${verticalEntry[0]}`
    }
  }

  // City-only landing
  if (!categoryIds && !dateRange) {
    return `/wydarzenia/${citySlug}`
  }

  return null
}

// --- SEO metadata ---

interface LandingMeta {
  title: string
  description: string
  h1: string
  introText: string
}

const VERTICAL_META: Record<
  string,
  { label: string; genitive: string; description: string }
> = {
  sport: {
    label: "Sport",
    genitive: "sportowe",
    description: "zajęcia sportowe, treningi i aktywności fizyczne"
  },
  "dla-dzieci": {
    label: "Dla dzieci",
    genitive: "dla dzieci",
    description: "atrakcje, zajęcia i wydarzenia dla dzieci"
  },
  rozrywka: {
    label: "Rozrywka",
    genitive: "rozrywkowe",
    description: "wydarzenia rozrywkowe, koncerty i imprezy"
  },
  koncerty: {
    label: "Koncerty",
    genitive: "koncertowe",
    description: "koncerty, występy muzyczne i festiwale"
  },
  weekend: {
    label: "Weekend",
    genitive: "weekendowe",
    description: "wydarzenia i atrakcje na nadchodzący weekend"
  }
}

export function getLandingMeta(city: string, vertical?: string): LandingMeta {
  const cityInfo = CITY_DATA[city]
  if (!cityInfo) {
    return {
      title: "Wyszukaj aktywności - Simplygo",
      description:
        "Przeglądaj i filtruj aktywności oraz miejsca dopasowane do Twoich zainteresowań w Simplygo.",
      h1: "Wyszukaj aktywności",
      introText: ""
    }
  }

  const loc = cityInfo.locative

  if (!vertical) {
    return {
      title: `Wydarzenia i aktywności w ${loc} - Simplygo`,
      description: `Odkryj wydarzenia, zajęcia sportowe, atrakcje dla dzieci i więcej w ${loc}. Przeglądaj aktualne oferty na Simplygo.`,
      h1: `Wydarzenia i aktywności w ${loc}`,
      introText: `Przeglądaj najciekawsze wydarzenia i aktywności dostępne w ${loc}. Filtruj według kategorii, daty i lokalizacji, aby znaleźć coś idealnego dla siebie.`
    }
  }

  const vm = VERTICAL_META[vertical]
  if (!vm) {
    return getLandingMeta(city)
  }

  return {
    title: `${vm.label} w ${loc} - Simplygo`,
    description: `Znajdź ${vm.description} w ${loc}. Aktualne oferty i terminy na Simplygo.`,
    h1: `${vm.label} w ${loc}`,
    introText: `Przeglądaj ${vm.description} w ${loc}. Sprawdź aktualne terminy, ceny i lokalizacje.`
  }
}

// --- Filter customisation detection ---

/** Keys that indicate the user has changed filters beyond the landing defaults. */
const FILTER_PARAM_KEYS = [
  "categoryIds",
  "tagIds",
  "searchTerm",
  "dateRange",
  "occurrenceType",
  "maxPrice",
  "minPrice",
  "maxDuration",
  "kidsMinAge",
  "kidsMaxAge",
  "kidsAge",
  "kidsBabysitting",
  "sportType",
  "sportLevel",
  "userType",
  "registration",
  "eventAny"
]

export function hasCustomFilters(
  searchParams: Record<string, string | string[] | undefined>
): boolean {
  return FILTER_PARAM_KEYS.some(k => !!searchParams[k])
}

// --- Helpers ---

function asString(val: string | string[] | undefined): string | undefined {
  if (Array.isArray(val)) return val[0]
  return val
}
