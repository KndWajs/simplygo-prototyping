import { NextRequest, NextResponse } from "next/server"
import { VALID_CITY_SLUGS } from "models/landing"

// City label → slug
const CITY_LABEL_TO_SLUG: Record<string, string> = {
  szczecin: "szczecin"
}

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl

  // --- Lowercase enforcement for /wydarzenia/* paths ---
  if (pathname.startsWith("/wydarzenia/")) {
    const lower = pathname.toLowerCase()
    if (lower !== pathname) {
      const url = request.nextUrl.clone()
      url.pathname = lower
      return NextResponse.redirect(url, 301)
    }
  }

  // --- Query param → clean URL redirect ---
  if (pathname === "/wydarzenia") {
    const regionCity = searchParams.get("regionCity")
    const categoryIds = searchParams.get("categoryIds")
    const dateRange = searchParams.get("dateRange")

    if (regionCity) {
      const citySlug = CITY_LABEL_TO_SLUG[regionCity.toLowerCase()]
      if (citySlug && VALID_CITY_SLUGS.has(citySlug)) {
        const isSimpleFilter = !searchParams.get("searchTerm") &&
          !searchParams.get("tagIds") &&
          !searchParams.get("maxPrice") &&
          !searchParams.get("minPrice") &&
          !searchParams.get("kidsMinAge") &&
          !searchParams.get("kidsMaxAge") &&
          !searchParams.get("sportType") &&
          !searchParams.get("sportLevel")

        if (isSimpleFilter) {
          // Match dateRange to weekend vertical
          if (dateRange === "ThisWeekend" && !categoryIds) {
            const url = request.nextUrl.clone()
            url.pathname = `/wydarzenia/${citySlug}/weekend`
            url.search = ""
            return NextResponse.redirect(url, 301)
          }

          // City-only (no category, no special dateRange)
          if (!categoryIds && !dateRange) {
            const url = request.nextUrl.clone()
            url.pathname = `/wydarzenia/${citySlug}`
            url.search = ""
            return NextResponse.redirect(url, 301)
          }
        }
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/wydarzenia", "/wydarzenia/:path*"]
}
