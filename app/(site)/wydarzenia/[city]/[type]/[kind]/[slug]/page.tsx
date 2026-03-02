import EmailIcon from "@mui/icons-material/Email"
import LanguageIcon from "@mui/icons-material/Language"
import PhoneIcon from "@mui/icons-material/Phone"
import { Box, Chip, Divider, Grid, Link as MuiLink, Stack, Typography } from "@mui/material"
import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import { TrackedContactLink } from "components/analytics/trackedContactLink"
import { AddToCalendarButton } from "components/activityDetail/addToCalendarButton"
import { CloseButton } from "components/activityDetail/closeButton"
import { ErrorReportModal } from "components/activityDetail/errorReportModal"

import { RelatedActivities } from "components/activityDetail/relatedActivities"
import { RouteButton } from "components/activityDetail/routeButton"
import { ActivityTags } from "components/eventCard/activityTags"
import { OccurrenceTime } from "components/eventCard/occurrenceTime"
import { LikeButton } from "components/eventCard/likeButton"
import { RatingComponent } from "components/eventCard/ratingComponent"
import { ShareButton } from "components/eventCard/shareButton"
import { Suspense } from "react"
import type { QueryActivityDto } from "models/domainDtos"
import { fetchActivity, fetchRelatedActivities } from "models/services/activities.service"
import { SPORT_COLOR } from "theme/ThemeRegistry"
import { getCategory, getImageUrl, isPlaceActivity } from "utils/activityUtils"
import {
  activityKindToSlug,
  activityTypeToSlug,
  extractIdFromSlug,
  generateSlug,
  VALID_KIND_SLUGS,
  VALID_TYPE_SLUGS
} from "utils/slugUtils"
import { ActivityBreadcrumbs } from "components/activityDetail/breadcrumbs"
import { AddToListButton } from "components/activityDetail/addToListButton"
import { AdminActions } from "components/activityDetail/adminActions"
import { ActivityMap } from "components/activityDetail/activityMap"
import { ImageViewer } from "components/activityDetail/imageViewer"

export const revalidate = 3600

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://simplygo.pl"

interface Props {
  params: Promise<{ city: string; type: string; kind: string; slug: string }>
}

function activityUrl(city: string, type: string, kind: string, slug: string) {
  return `/wydarzenia/${city}/${type}/${kind}/${slug}`
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city, type, kind, slug } = await params
  const id = extractIdFromSlug(slug) ?? slug
  let activity
  try {
    activity = await fetchActivity(id)
  } catch {
    return { title: "Simplygo" }
  }
  if (!activity) return { title: "Nie znaleziono - Simplygo" }

  const canonicalSlug = generateSlug(activity.base.title ?? "", id)
  const canonicalType = activityTypeToSlug(getCategory(activity))
  const canonicalKind = activityKindToSlug(isPlaceActivity(activity))
  const canonical = activityUrl(city, canonicalType, canonicalKind, canonicalSlug)
  const title = `${activity.base.title ?? "Aktywność"} - Simplygo`
  const description = (activity.base.description ?? "").slice(0, 160)
  const mainPhoto =
    activity.photos?.find(p => p.isMain)?.url ?? activity.photos?.[0]?.url ?? getImageUrl(activity)

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}${canonical}`,
      siteName: "Simplygo",
      images: mainPhoto ? [{ url: mainPhoto, alt: activity.base.title ?? "Aktywność" }] : undefined,
      locale: "pl_PL",
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: mainPhoto ? [mainPhoto] : undefined
    }
  }
}

function buildEventJsonLd(
  activity: QueryActivityDto,
  city: string,
  type: string,
  kind: string,
  slug: string
) {
  const occ = activity.base.occurrence
  const addr = activity.base.address
  const mainPhoto =
    activity.photos?.find(p => p.isMain)?.url ?? activity.photos?.[0]?.url ?? getImageUrl(activity)
  const url = `${SITE_URL}${activityUrl(city, type, kind, slug)}`

  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: activity.base.title,
    description: activity.base.description,
    startDate: occ.occurrenceDates?.[0]?.start,
    endDate: occ.occurrenceDates?.[0]?.end,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: addr && {
      "@type": "Place",
      name: addr.streetAddress,
      address: {
        "@type": "PostalAddress",
        streetAddress: addr.streetAddress,
        addressLocality: "Szczecin",
        addressCountry: "PL"
      },
      geo: addr.coordinates && {
        "@type": "GeoCoordinates",
        latitude: addr.coordinates.latitude,
        longitude: addr.coordinates.longitude
      }
    },
    offers: {
      "@type": "Offer",
      price: activity.base.price ?? 0,
      priceCurrency: "PLN",
      url,
      availability: "https://schema.org/InStock",
      validFrom: occ.occurrenceDates?.[0]?.start
    },
    image: mainPhoto,
    url,
    inLanguage: "pl",
    isAccessibleForFree: activity.base.price == null || activity.base.price === 0,
    performer: {
      "@type": "Organization",
      name: activity.base.title,
      email: activity.base.contactInfo?.email || undefined,
      telephone: activity.base.contactInfo?.phoneNumber || undefined,
      url: activity.base.website || undefined
    },
    organizer: {
      "@type": "Organization",
      name: activity.base.title,
      email: activity.base.contactInfo?.email || undefined,
      telephone: activity.base.contactInfo?.phoneNumber || undefined,
      url: activity.base.website || undefined
    }
  }
}

function buildLocalBusinessJsonLd(
  activity: QueryActivityDto,
  city: string,
  type: string,
  kind: string,
  slug: string
) {
  const occ = activity.base.occurrence
  const addr = activity.base.address
  const mainPhoto =
    activity.photos?.find(p => p.isMain)?.url ?? activity.photos?.[0]?.url ?? getImageUrl(activity)
  const url = `${SITE_URL}${activityUrl(city, type, kind, slug)}`

  const dayMap = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: activity.base.title,
    description: activity.base.description,
    address: addr && {
      "@type": "PostalAddress",
      streetAddress: addr.streetAddress,
      addressLocality: "Szczecin",
      addressCountry: "PL"
    },
    geo: addr?.coordinates && {
      "@type": "GeoCoordinates",
      latitude: addr.coordinates.latitude,
      longitude: addr.coordinates.longitude
    },
    openingHoursSpecification: occ.openingHours?.map(oh => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: dayMap[oh.day],
      opens: oh.open?.slice(0, 5),
      closes: oh.close?.slice(0, 5)
    })),
    image: mainPhoto,
    url,
    telephone: activity.base.contactInfo?.phoneNumber || undefined,
    email: activity.base.contactInfo?.email || undefined,
    priceRange: activity.base.price != null ? `${activity.base.price} PLN` : "Bezpłatne"
  }
}

const TYPE_LABELS: Record<string, string> = {
  sport: "Sport",
  "dla-dzieci": "Dla dzieci",
  rozrywka: "Rozrywka"
}

const KIND_LABELS: Record<string, string> = {
  miejsce: "Miejsce",
  wydarzenie: "Wydarzenie"
}

function buildBreadcrumbJsonLd(
  activity: QueryActivityDto,
  city: string,
  type: string,
  kind: string,
  slug: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Strona główna",
        item: `${SITE_URL}/`
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Wydarzenia",
        item: `${SITE_URL}/wydarzenia`
      },
      {
        "@type": "ListItem",
        position: 3,
        name: TYPE_LABELS[type] ?? type,
        item: `${SITE_URL}/wydarzenia/${city}/${type}`
      },
      {
        "@type": "ListItem",
        position: 4,
        name: KIND_LABELS[kind] ?? kind,
        item: `${SITE_URL}/wydarzenia/${city}/${type}/${kind}`
      },
      {
        "@type": "ListItem",
        position: 5,
        name: activity.base.title ?? "Aktywność",
        item: `${SITE_URL}${activityUrl(city, type, kind, slug)}`
      }
    ]
  }
}

async function RelatedSection({ activity }: { activity: QueryActivityDto }) {
  const related = await fetchRelatedActivities(activity)
  if (related.length === 0) return null
  return (
    <Grid size={12} sx={{ mt: 4, width: "100%" }}>
      <Divider sx={{ mb: 2, width: "100%" }}>Może Ci się spodobać</Divider>
      <RelatedActivities activities={related} />
    </Grid>
  )
}

export default async function ActivityDetailPage({ params }: Props) {
  const { city, type, kind, slug } = await params

  if (!VALID_TYPE_SLUGS.has(type) || !VALID_KIND_SLUGS.has(kind)) {
    redirect("/wydarzenia")
  }

  const id = extractIdFromSlug(slug) ?? slug

  let activity
  try {
    activity = await fetchActivity(id)
  } catch {
    redirect("/maintenance")
  }
  if (!activity) notFound()

  const canonicalSlug = generateSlug(activity.base.title ?? "", id)
  const canonicalType = activityTypeToSlug(getCategory(activity))
  const canonicalKind = activityKindToSlug(isPlaceActivity(activity))

  if (slug !== canonicalSlug || type !== canonicalType || kind !== canonicalKind) {
    redirect(activityUrl(city, canonicalType, canonicalKind, canonicalSlug))
  }

  const { base } = activity
  const isPlace = isPlaceActivity(activity)
  const mainJsonLd = isPlace
    ? buildLocalBusinessJsonLd(activity, city, type, kind, canonicalSlug)
    : buildEventJsonLd(activity, city, type, kind, canonicalSlug)
  const breadcrumbJsonLd = buildBreadcrumbJsonLd(activity, city, type, kind, canonicalSlug)

  const mainPhoto =
    activity.photos?.find(p => p.isMain)?.url ?? activity.photos?.[0]?.url ?? getImageUrl(activity)

  return (
    <Box
      component="article"
      sx={{
        width: "100%",
        maxWidth: "1250px",
        mx: "auto",
        padding: { xs: 0, md: 4 },
        pt: 0
      }}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(mainJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <Box sx={{ px: { xs: 2, md: 0 }, pt: 1 }}>
        <ActivityBreadcrumbs activity={activity} city={city} />
      </Box>

      {/* Mobile full-width hero image */}
      <Box
        sx={{
          display: { xs: "block", md: "none" },
          width: "100vw",
          position: "relative",
          left: "50%",
          right: "50%",
          marginLeft: "-50vw",
          marginRight: "-50vw",
          mb: 0
        }}
      >
        <ImageViewer
          src={mainPhoto}
          alt={base.title ?? ""}
          sx={{
            width: "100%",
            minHeight: "200px",
            maxHeight: "400px",
            objectFit: "cover"
          }}
        />
      </Box>

      <Grid
        container
        spacing={2}
        sx={{
          width: "100%",
          position: "relative",
          overflow: "auto"
        }}
        flexDirection="row"
        wrap="wrap"
      >
        {/* Title + rating row */}
        <Grid
          size={12}
          sx={{
            display: "flex",
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "space-between",
            flexWrap: "wrap-reverse",
            gap: { xs: 1, md: 4 },
            pl: 1,
            pr: 1
          }}
        >
          <Typography variant="h4" component="h1">
            {base.title}
          </Typography>
          <Stack direction="row" alignItems="center" spacing={1}>
            <AdminActions activity={activity} />
            <CloseButton />
          </Stack>
        </Grid>

        <Grid
          size={12}
          gap={2}
          sx={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap"
          }}
        >
          {/* Left column — tags, time, price, contact */}
          <Grid
            size={{ xs: 12, md: 3.5 }}
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              minWidth: "300px",
              justifyContent: "flex-start",
              alignItems: "flex-start",
              pl: { xs: "20px", md: 0 },
              pr: { xs: "20px", md: 0 }
            }}
          >
            <Stack direction="row" alignItems="center" flexWrap="wrap" spacing="4px" gap={1}>
              <ActivityTags activity={activity} />
            </Stack>

            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ width: "100%" }}>
              {activity.ratings && <RatingComponent rating={activity.ratings.rating} />}
              {activity.id && <LikeButton activity={activity} />}
              <ShareButton activity={activity} />
            </Stack>

            {activity.kids && (activity.kids.minAge != null || activity.kids.maxAge != null) && (
              <Typography variant="body2">
                Dla dzieci w wieku:{" "}
                {activity.kids.minAge != null && activity.kids.maxAge != null
                  ? `${activity.kids.minAge} - ${activity.kids.maxAge}`
                  : activity.kids.minAge != null
                    ? `od ${activity.kids.minAge}`
                    : `do ${activity.kids.maxAge}`}
              </Typography>
            )}

            <Divider sx={{ display: { xs: "flex", md: "none" }, width: "100%" }}>Kiedy?</Divider>

            <Typography
              variant="body1"
              component="div"
              color={SPORT_COLOR}
              gap={2}
              sx={{ display: "flex", flexDirection: "column" }}
            >
              <OccurrenceTime activity={activity} />
            </Typography>

{!isPlace && (
              <AddToCalendarButton
                title={base.title || ""}
                description={base.description}
                activityId={activity.id}
                occurrence={base.occurrence}
                address={base.address}
              />
            )}

            <AddToListButton activityId={activity.id} />

            {base.price != null && (
              <Typography variant="body2">
                {base.price === 0 ? "Bezpłatne" : `Cena: ${base.price} zł`}
              </Typography>
            )}

            {base.contactInfo && (base.contactInfo.email || base.contactInfo.phoneNumber) && (
              <Typography
                variant="body1"
                component="div"
                sx={{
                  display: { xs: "none", md: "flex" },
                  flexDirection: "column",
                  gap: "8px",
                  width: "100%"
                }}
              >
                {base.contactInfo.email && (
                  <TrackedContactLink
                    href={`mailto:${base.contactInfo.email}`}
                    method="email"
                    sx={{ color: SPORT_COLOR }}
                  >
                    {base.contactInfo.email}
                  </TrackedContactLink>
                )}
                {base.contactInfo.phoneNumber && (
                  <TrackedContactLink
                    href={`tel:${base.contactInfo.phoneNumber}`}
                    method="phone"
                    sx={{ color: SPORT_COLOR }}
                  >
                    Telefon: {base.contactInfo.phoneNumber}
                  </TrackedContactLink>
                )}
              </Typography>
            )}
          </Grid>

          {/* Center column — image (desktop) + description */}
          <Grid
            size={{ xs: 12, md: 4.5 }}
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              pl: { xs: "20px", md: 0 },
              pr: { xs: "20px", md: 0 }
            }}
          >
            <Divider sx={{ display: { xs: "flex", md: "none" }, width: "100%" }}>Opis</Divider>

            <Stack
              direction="row"
              alignItems="center"
              justifyContent="center"
              gap={2}
              sx={{ mb: "16px", display: { xs: "none", md: "block" } }}
            >
              <Box sx={{ width: "100%", maxWidth: "600px" }}>
                <ImageViewer
                  src={mainPhoto}
                  alt={base.title ?? ""}
                  sx={{
                    width: "100%",
                    maxHeight: "400px",
                    objectFit: "cover"
                  }}
                />
              </Box>
            </Stack>

            <Typography variant="body1" gutterBottom sx={{ whiteSpace: "pre-line" }}>
              {base.description
                ? base.description
                    .split(
                      /(https?:\/\/[^\s]+|(?:[\w-]+\.)+(?:pl|com|org|net|eu|info|co|io|dev)(?:\/[^\s]*)?)/gi
                    )
                    .map((part, i) =>
                      /^https?:\/\/|^(?:[\w-]+\.)+(?:pl|com|org|net|eu|info|co|io|dev)(?:\/|$)/i.test(
                        part
                      ) ? (
                        <MuiLink
                          key={i}
                          href={part.startsWith("http") ? part : `https://${part}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          underline="hover"
                          sx={{ color: SPORT_COLOR }}
                        >
                          {part}
                        </MuiLink>
                      ) : (
                        part
                      )
                    )
                : "Brak opisu..."}
            </Typography>

            {base.website && (
              <MuiLink
                href={base.website}
                target="_blank"
                rel="noopener noreferrer"
                underline="hover"
                sx={{ color: SPORT_COLOR }}
              >
                {base.website.length > 40 ? base.website.slice(0, 40) + "..." : base.website}
              </MuiLink>
            )}
          </Grid>

          {/* Right column — address + map */}
          <Grid
            size={{ xs: 12, md: 4 }}
            sx={{
              display: "flex",
              flex: 1,
              justifyContent: "flex-end",
              flexDirection: { xs: "column", md: "column-reverse" },
              gap: 1,
              minWidth: "300px",
              width: "100%",
              maxWidth: "100%"
            }}
          >
            <Typography
              variant="body1"
              component="div"
              sx={{
                display: "flex",
                flexDirection: "column",
                pl: { xs: "20px", md: 0 },
                pr: { xs: "20px", md: 0 }
              }}
            >
              <Divider sx={{ display: { xs: "flex", md: "none" }, width: "100%" }}>Adres</Divider>
              {base.address.streetAddress && (
                <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
                  <address style={{ fontStyle: "normal" }}>{base.address.streetAddress}</address>
                  {base.address.coordinates && (
                    <RouteButton destination={base.address.coordinates} />
                  )}
                </Stack>
              )}
            </Typography>

            {/* Map */}
            {base.address.coordinates && (
              <ActivityMap coordinates={base.address.coordinates} title={base.title ?? ""} />
            )}

            {/* Mobile-only contact info */}
            {base.contactInfo && (base.contactInfo.email || base.contactInfo.phoneNumber) && (
              <Typography
                variant="body1"
                component="div"
                sx={{
                  display: { xs: "flex", md: "none" },
                  flexDirection: "column",
                  gap: "8px",
                  width: "100%",
                  mt: "8px",
                  pl: { xs: "20px", md: 0 },
                  pr: { xs: "20px", md: 0 }
                }}
              >
                <Divider sx={{ display: { xs: "flex", md: "none" }, width: "100%" }}>
                  Kontakt
                </Divider>
                {base.contactInfo.email && (
                  <TrackedContactLink
                    href={`mailto:${base.contactInfo.email}`}
                    method="email"
                    sx={{ color: SPORT_COLOR }}
                  >
                    {base.contactInfo.email}
                  </TrackedContactLink>
                )}
                {base.contactInfo.phoneNumber && (
                  <TrackedContactLink
                    href={`tel:${base.contactInfo.phoneNumber}`}
                    method="phone"
                    sx={{ color: SPORT_COLOR }}
                  >
                    Telefon: {base.contactInfo.phoneNumber}
                  </TrackedContactLink>
                )}
              </Typography>
            )}
          </Grid>

          {/* Tags */}
          {activity.tags && activity.tags.length > 0 && (
            <Grid
              size={12}
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1,
                pl: { xs: "20px", md: 0 },
                pr: { xs: "20px", md: 0 }
              }}
            >
              <Stack direction="row" flexWrap="wrap" gap={1}>
                {activity.tags.map(tag => (
                  <Chip key={tag.id} label={tag.name} variant="outlined" size="small" />
                ))}
              </Stack>
            </Grid>
          )}

          {/* Error report */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              width: "100%"
            }}
          >
            <ErrorReportModal activityId={activity.id} />
          </Box>

          {/* Related activities — loaded independently */}
          <Suspense>
            <RelatedSection activity={activity} />
          </Suspense>
        </Grid>
      </Grid>
    </Box>
  )
}
