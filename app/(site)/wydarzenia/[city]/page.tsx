import { notFound, redirect } from "next/navigation"
import { fetchActivity, searchActivities } from "models/services/activities.service"
import { getCategory, isPlaceActivity } from "utils/activityUtils"
import {
  activityKindToSlug,
  activityTypeToSlug,
  extractIdFromSlug,
  generateSlug
} from "utils/slugUtils"
import { parseFilters } from "models/services/filters.service"
import { ActivityListing } from "components/activityListing/activityListing"
import { VALID_CITY_SLUGS, CITY_DATA, getLandingMeta, mapLandingToFilters, hasCustomFilters } from "models/landing"
import { CATEGORIES } from "../../../../data/categories"
import { TAGS } from "../../../../data/tags"
import type { Metadata } from "next"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://simplygo.pl"

interface Props {
  params: Promise<{ city: string }>
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city } = await params
  if (!VALID_CITY_SLUGS.has(city)) return {}

  const meta = getLandingMeta(city)
  const canonical = `/wydarzenia/${city}`

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

export default async function CityPage({ params, searchParams }: Props) {
  const { city } = await params

  // --- Landing page for known city slugs ---
  if (VALID_CITY_SLUGS.has(city)) {
    const landingFilters = mapLandingToFilters({ city })
    if (!landingFilters) notFound()

    const rawParams = (await searchParams) ?? {}
    const parsed = parseFilters(rawParams)
    const query = {
      ...parsed,
      region: landingFilters!.region,
      coordinates: landingFilters!.coordinates,
      categoryIds: parsed.categoryIds ?? landingFilters!.categoryIds
    }

    let searchResult
    try {
      searchResult = await searchActivities(query)
    } catch {
      redirect("/maintenance")
    }

    const meta = getLandingMeta(city)
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

  // --- Legacy UUID redirect ---
  const id = extractIdFromSlug(city)
  if (id) {
    let activity
    try {
      activity = await fetchActivity(id)
    } catch {
      // fetch failed — fall through
    }
    if (activity) {
      const type = activityTypeToSlug(getCategory(activity))
      const kind = activityKindToSlug(isPlaceActivity(activity))
      const slug = generateSlug(activity.base.title ?? "", id)
      redirect(`/wydarzenia/szczecin/${type}/${kind}/${slug}`)
    }
  }

  notFound()
}
