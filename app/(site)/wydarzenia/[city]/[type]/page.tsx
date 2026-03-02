import { notFound, redirect } from "next/navigation"
import { searchActivities } from "models/services/activities.service"
import { parseFilters } from "models/services/filters.service"
import { ActivityListing } from "components/activityListing/activityListing"
import {
  VALID_CITY_SLUGS,
  VALID_VERTICALS,
  getLandingMeta,
  mapLandingToFilters,
  hasCustomFilters
} from "models/landing"
import { CATEGORIES } from "../../../../../data/categories"
import { TAGS } from "../../../../../data/tags"
import type { Metadata } from "next"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://simplygo.pl"

interface Props {
  params: Promise<{ city: string; type: string }>
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city, type } = await params
  if (!VALID_CITY_SLUGS.has(city) || !VALID_VERTICALS.has(type)) return {}

  const meta = getLandingMeta(city, type)
  const canonical = `/wydarzenia/${city}/${type}`

  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical },
    robots: "index,follow",
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: `${SITE_URL}${canonical}`,
      siteName: "Simplygo",
      images: [{ url: `${SITE_URL}/share.png`, alt: "Simplygo" }],
      locale: "pl_PL",
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
      images: [`${SITE_URL}/share.png`]
    }
  }
}

export default async function VerticalPage({ params, searchParams }: Props) {
  const { city, type } = await params

  if (!VALID_CITY_SLUGS.has(city) || !VALID_VERTICALS.has(type)) {
    notFound()
  }

  const landingFilters = mapLandingToFilters({ city, vertical: type })
  if (!landingFilters) notFound()

  const rawParams = (await searchParams) ?? {}
  const parsed = parseFilters(rawParams)
  const query = {
    ...parsed,
    region: landingFilters.region,
    coordinates: landingFilters.coordinates,
    categoryIds: parsed.categoryIds ?? landingFilters.categoryIds,
    dateRange: landingFilters.dateRange ?? parsed.dateRange
  }

  let searchResult
  try {
    searchResult = await searchActivities(query)
  } catch {
    redirect("/maintenance")
  }

  const meta = getLandingMeta(city, type)
  const showHeading = !hasCustomFilters(rawParams)

  return (
    <ActivityListing
      query={query}
      searchResult={searchResult}
      categories={CATEGORIES}
      tags={TAGS}
      heading={showHeading ? meta.h1 : undefined}
      introText={showHeading ? meta.introText : undefined}
    />
  )
}
