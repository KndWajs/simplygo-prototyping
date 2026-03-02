"use client"

import { Alert, Box, CircularProgress } from "@mui/material"
import EventCard from "components/eventCard/eventCard"
import { InfoCard } from "components/eventCard/infoCard"
import { EmptyState } from "components/emptyState/emptyState"
import { Newsletter } from "components/infoCards/newsletter/newsletter"
import { PlacesSearch } from "components/infoCards/placesSearch/placesSearch"
import { SwipeInfo } from "components/infoCards/swipeInfo/swipeInfo"
import { DEFAULT_PAGE_SIZE } from "global"
import { OccurrenceType } from "models/domainDtos"
import type { Coordinates, GetActivitiesQuery, QueryActivityDto } from "models/domainDtos"
import { searchActivities } from "models/services/activities.service"
import {
  getHideContentCookie,
  HideableContent,
  setHideContentCookie
} from "models/services/cookies.service"

import React, { useCallback, useEffect, useRef, useState } from "react"
import { serializeFilters } from "models/services/filters.service"
import { theme } from "theme/ThemeRegistry"

const CACHE_PREFIX = "sg_list_"

function getCacheKey(query: GetActivitiesQuery): string {
  const params = serializeFilters(query)
  params.delete("pageNumber")
  params.sort()
  return CACHE_PREFIX + params.toString()
}

function saveListCache(key: string, extra: QueryActivityDto[], page: number, scrollY: number) {
  try {
    sessionStorage.setItem(key, JSON.stringify({ extra, page, scrollY }))
  } catch {
    /* quota exceeded – ignore */
  }
}

function loadListCache(
  key: string
): { extra: QueryActivityDto[]; page: number; scrollY: number } | null {
  try {
    const raw = sessionStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

interface ActivityListProps {
  initialActivities: QueryActivityDto[]
  initialHasMore: boolean
  query: GetActivitiesQuery
  userCoordinates?: Coordinates
  extendedSearch?: QueryActivityDto[]
}

export function ActivityList({
  initialActivities,
  initialHasMore,
  query,
  userCoordinates,
  extendedSearch
}: ActivityListProps) {
  const cacheKey = getCacheKey(query)
  const cached = useRef(loadListCache(cacheKey))

  const [extraActivities, setExtraActivities] = useState<QueryActivityDto[]>(
    () => cached.current?.extra ?? []
  )
  const [hasMore, setHasMore] = useState(initialHasMore)
  const pageRef = useRef(cached.current?.page ?? query.pageNumber)
  const loadingRef = useRef(false)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const scrollYRef = useRef(0)
  const [hidePlacesSearch, setHidePlacesSearch] = useState(() =>
    getHideContentCookie(HideableContent.PlacesSearch)
  )
  const [hideSwipeInfo, setHideSwipeInfo] = useState(() =>
    getHideContentCookie(HideableContent.SwipeInfo)
  )

  const allActivities = [...initialActivities, ...extraActivities]
  const showOccurrenceBadge = query.occurrenceType === OccurrenceType.Both

  // Restore scroll position after cached extra activities render
  useEffect(() => {
    if (cached.current?.scrollY) {
      const y = cached.current.scrollY
      cached.current = null
      // Disable browser's default scroll restoration so Next.js doesn't
      // override our manual restore
      if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = "manual"
      }
      // Double rAF + setTimeout to ensure we fire after Next.js App Router's
      // own scroll-to-top behavior
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          window.scrollTo(0, y)
        })
      })
      setTimeout(() => {
        window.scrollTo(0, y)
      }, 100)
    }
  }, [])

  // Track scroll position in a ref so it's available even after Next.js
  // resets window.scrollY to 0 during client-side navigation
  useEffect(() => {
    const onScroll = () => {
      scrollYRef.current = window.scrollY
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Persist extra activities + scroll on beforeunload / navigation
  useEffect(() => {
    const save = () => {
      saveListCache(cacheKey, extraActivities, pageRef.current, scrollYRef.current)
    }
    window.addEventListener("beforeunload", save)
    return () => {
      window.removeEventListener("beforeunload", save)
      // Save when the component unmounts (user navigated away via Next.js router)
      save()
    }
  }, [cacheKey, extraActivities])

  const loadMore = useCallback(async () => {
    if (loadingRef.current) return
    loadingRef.current = true
    const nextPage = pageRef.current + 1
    const result = await searchActivities({ ...query, pageNumber: nextPage })
    pageRef.current = nextPage
    setExtraActivities(prev => prev.concat(result.activities))
    setHasMore(result.hasMore)
    loadingRef.current = false
  }, [query])

  useEffect(() => {
    if (!hasMore || !sentinelRef.current) return
    const el = sentinelRef.current
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          loadMore()
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [hasMore, loadMore, allActivities.length])

  const noResults = allActivities.length === 0 && !extendedSearch?.length

  if (noResults) {
    return (
      <div
        style={{
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flex: "1"
        }}
      >
        <EmptyState
          title="To wszystkie aktywności spełniające Twoje kryteria."
          description="Spróbuj zmienić datę lub filtry, żeby odkryć więcej."
          minHeight="250px"
        />
      </div>
    )
  }

  return (
    <>
      {extendedSearch && extendedSearch.length > 0 && (
        <>
          <Box display="flex" flexWrap="wrap" gap={{ xs: 2, md: 2 }} justifyContent="center">
            {extendedSearch.map((activity, index) => (
              <EventCard
                key={activity.id || `extended-activity-${index}`}
                activity={activity}
                userCoordinates={userCoordinates}
                showOccurrenceBadge={showOccurrenceBadge}
              />
            ))}
          </Box>
          <div
            style={{
              maxWidth: "800px",
              margin: "0 auto",
              marginTop: "8px",
              marginBottom: "8px",
              marginLeft: "16px",
              marginRight: "16px"
            }}
          >
            <Alert
              severity="info"
              sx={{
                borderRadius: "8px",
                border: "solid 1px",
                borderColor: theme.palette?.primary?.main as string,
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)"
              }}
            >
              Znaleziono mniej niż 5 wydarzeń. Poniżej pokazujemy dodatkowe wyniki z szerszego
              zakresu (30 dni) i z nieco luźniejszymi filtrami.
            </Alert>
          </div>
        </>
      )}
      <Box display="flex" flexWrap="wrap" gap={{ xs: 2, md: 2 }} justifyContent="center">
        {allActivities.map((activity, index) => (
          <React.Fragment key={activity.id || `activity-${index}`}>
            {index === 4 && !hidePlacesSearch && (
              <InfoCard
                content={<PlacesSearch query={query} />}
                onHideClick={() => {
                  setHideContentCookie(HideableContent.PlacesSearch, true)
                  setHidePlacesSearch(true)
                }}
              />
            )}
            {index === 14 && !hideSwipeInfo && (
              <Box sx={{ display: { xs: "block", md: "none" }, width: "100%" }}>
                <InfoCard
                  content={<SwipeInfo />}
                  onHideClick={() => {
                    setHideContentCookie(HideableContent.SwipeInfo, true)
                    setHideSwipeInfo(true)
                  }}
                />
              </Box>
            )}
            {index === 30 && <InfoCard content={<Newsletter />} />}
            <EventCard
              activity={activity}
              userCoordinates={userCoordinates}
              showOccurrenceBadge={showOccurrenceBadge}
            />
          </React.Fragment>
        ))}
      </Box>
      {hasMore && (
        <div ref={sentinelRef} style={{ textAlign: "center", height: "80px" }}>
          <CircularProgress color="warning" />
        </div>
      )}
      {!hasMore && allActivities.length > DEFAULT_PAGE_SIZE && (
        <EmptyState
          title="To wszystkie aktywności spełniające Twoje kryteria."
          description="Spróbuj zmienić datę lub filtry, żeby odkryć więcej."
          minHeight="250px"
        />
      )}
    </>
  )
}
