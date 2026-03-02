import { ActivityListing } from "components/activityListing/activityListing"
import { CITIES, DEFAULT_CITY } from "components/citySelector/citySelector"
import type { Metadata } from "next"
import { parseFilters } from "models/services/filters.service"
import { searchActivities } from "models/services/activities.service"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { CATEGORIES } from "../../../data/categories"
import { TAGS } from "../../../data/tags"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://simplygo.pl"
const DEFAULT_TITLE = "Wyszukaj aktywności - Simplygo"
const DEFAULT_DESCRIPTION =
  "Przeglądaj i filtruj aktywności oraz miejsca dopasowane do Twoich zainteresowań w Simplygo."

const FILTER_KEYS = [
  "categoryIds",
  "tagIds",
  "searchTerm",
  "dateRange",
  "occurrenceType",
  "maxPrice",
  "minPrice",
  "userType",
  "registration",
  "kidsMinAge",
  "kidsMaxAge",
  "sportType",
  "sportLevel"
]

interface WydarzeniaPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export async function generateMetadata({
  searchParams
}: WydarzeniaPageProps): Promise<Metadata> {
  const params = (await searchParams) ?? {}
  const hasFilters = FILTER_KEYS.some(k => !!params[k])

  return {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    alternates: { canonical: "/wydarzenia" },
    robots: hasFilters ? "noindex,follow" : "index,follow",
    openGraph: {
      title: DEFAULT_TITLE,
      description: DEFAULT_DESCRIPTION,
      url: `${SITE_URL}/wydarzenia`,
      siteName: "Simplygo",
      images: [{ url: `${SITE_URL}/share.png`, alt: "Simplygo" }],
      locale: "pl_PL",
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title: DEFAULT_TITLE,
      description: DEFAULT_DESCRIPTION,
      images: [`${SITE_URL}/share.png`]
    },
    other: {
      "theme-color": "#ffffff"
    }
  }
}

function getCityFromCookie(cookieValue: string | undefined) {
  if (!cookieValue) return DEFAULT_CITY
  try {
    const address = JSON.parse(decodeURIComponent(cookieValue))
    const match = CITIES.find(
      c => c.label.toLowerCase() === address?.streetAddress?.toLowerCase()
    )
    return match ?? DEFAULT_CITY
  } catch {
    return DEFAULT_CITY
  }
}

export default async function WydarzeniaPage({ searchParams }: WydarzeniaPageProps) {
  const parsed = parseFilters((await searchParams) ?? {})

  const cookieStore = await cookies()
  const city = getCityFromCookie(cookieStore.get("sg_address")?.value)
  const query = {
    ...parsed,
    region: parsed.region ?? { city: city.label, country: "Poland" },
    coordinates: parsed.coordinates ?? city.coordinates
  }

  const categories = CATEGORIES
  const tags = TAGS

  let searchResult
  try {
    searchResult = await searchActivities(query)
  } catch {
    redirect("/maintenance")
  }

  return (
    <ActivityListing
      query={query}
      searchResult={searchResult}
      categories={categories}
      tags={tags}
    />
  )
}
