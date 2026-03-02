import type { QueryActivityDto } from "models/domainDtos"
import { ActivityType } from "models/domainDtos"
import { getCategory, isPlaceActivity } from "utils/activityUtils"

const POLISH_MAP: Record<string, string> = {
  ą: "a",
  ć: "c",
  ę: "e",
  ł: "l",
  ń: "n",
  ó: "o",
  ś: "s",
  ź: "z",
  ż: "z"
}

const DEFAULT_CITY_SLUG = "szczecin"

const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const TYPE_SLUG_MAP: Record<ActivityType, string> = {
  [ActivityType.Sport]: "sport",
  [ActivityType.Kids]: "dla-dzieci",
  [ActivityType.Event]: "rozrywka"
}

const SLUG_TYPE_MAP: Record<string, ActivityType> = {
  sport: ActivityType.Sport,
  "dla-dzieci": ActivityType.Kids,
  rozrywka: ActivityType.Event
}

export const VALID_TYPE_SLUGS = new Set(Object.values(TYPE_SLUG_MAP))
export const VALID_KIND_SLUGS = new Set(["miejsce", "wydarzenie"])

export function activityTypeToSlug(type: ActivityType): string {
  return TYPE_SLUG_MAP[type]
}

export function activityKindToSlug(isPlace: boolean): string {
  return isPlace ? "miejsce" : "wydarzenie"
}

export function slugToActivityType(slug: string): ActivityType | null {
  return SLUG_TYPE_MAP[slug] ?? null
}

export function slugToIsPlace(slug: string): boolean | null {
  if (slug === "miejsce") return true
  if (slug === "wydarzenie") return false
  return null
}

export function generateSlug(title: string, id: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[ąćęłńóśźż]/g, ch => POLISH_MAP[ch] ?? ch)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

  return `${slug}-${id}`
}

export function extractIdFromSlug(slug: string): string | null {
  const match = slug.match(UUID_RE)
  return match ? match[0] : null
}

export function generateActivityHref(activity: QueryActivityDto): string {
  if (!activity.id) return "/wydarzenia"
  const title = activity.base.title ?? ""
  const type = activityTypeToSlug(getCategory(activity))
  const kind = activityKindToSlug(isPlaceActivity(activity))
  return `/wydarzenia/${DEFAULT_CITY_SLUG}/${type}/${kind}/${generateSlug(title, activity.id)}`
}
