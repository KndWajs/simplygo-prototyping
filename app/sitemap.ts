import type { MetadataRoute } from "next"
import { generateSlug } from "utils/slugUtils"
import { VALID_CITY_SLUGS, VALID_VERTICALS } from "models/landing"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://simplygo.pl"
const API_URL = process.env.NEXT_PUBLIC_API_URL

const DEFAULT_QUERY = {
  region: { city: "Szczecin", country: "Poland" },
  coordinates: { latitude: 53.4285, longitude: 14.5528 },
  orderBy: "CreatedOn",
  dateRange: "NextThirtyDays",
  pageSize: 20
}

const KIDS_ID = "3"
const SPORT_ID = "2"

interface ActivityEntry {
  id: string
  title?: string
  createdOn?: string
  lastModifiedOn?: string
  categories?: { mainCategory?: string }[]
  occurrenceType?: string
}

function getTypeSlug(categories?: { mainCategory?: string }[]): string {
  if (categories?.some(c => c.mainCategory === KIDS_ID)) return "dla-dzieci"
  if (categories?.some(c => c.mainCategory === SPORT_ID)) return "sport"
  return "rozrywka"
}

function getKindSlug(occurrenceType?: string): string {
  return occurrenceType === "OpeningHours" ? "miejsce" : "wydarzenie"
}

async function fetchPage(pageNumber: number): Promise<ActivityEntry[]> {
  const res = await fetch(`${API_URL}/Activities/getlist`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...DEFAULT_QUERY, pageNumber }),
    next: { revalidate: 3600 }
  })
  if (!res.ok) return []
  const data = await res.json()

  return (data.activities ?? []).map((a: any) => ({
    id: a.id,
    title: a.base?.title,
    createdOn: a.createdOn,
    lastModifiedOn: a.lastModifiedOn,
    categories: a.categories,
    occurrenceType: a.base?.occurrence?.type
  }))
}

async function fetchAllActivities(): Promise<ActivityEntry[]> {
  if (!API_URL) return []
  try {
    const all: ActivityEntry[] = []
    for (let page = 1; page <= 50; page++) {
      const batch = await fetchPage(page)
      all.push(...batch)
      if (batch.length < 20) break
    }
    return all
  } catch {
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const activities = await fetchAllActivities()
  const now = new Date().toISOString()

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${SITE_URL}/wydarzenia`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/privacy-policy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/terms-conditions`, changeFrequency: "yearly", priority: 0.3 }
  ]

  const activityPages: MetadataRoute.Sitemap = activities.map(a => {
    const typeSlug = getTypeSlug(a.categories)
    const kindSlug = getKindSlug(a.occurrenceType)
    return {
      url: `${SITE_URL}/wydarzenia/szczecin/${typeSlug}/${kindSlug}/${generateSlug(a.title ?? "", a.id)}`,
      lastModified: a.lastModifiedOn || a.createdOn || now,
      changeFrequency: "weekly",
      priority: 0.7
    }
  })

  const landingPages: MetadataRoute.Sitemap = []
  for (const city of VALID_CITY_SLUGS) {
    landingPages.push({
      url: `${SITE_URL}/wydarzenia/${city}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.85
    })
    for (const vertical of VALID_VERTICALS) {
      landingPages.push({
        url: `${SITE_URL}/wydarzenia/${city}/${vertical}`,
        lastModified: now,
        changeFrequency: "daily",
        priority: 0.8
      })
    }
  }

  return [...staticPages, ...landingPages, ...activityPages]
}
