import {
  type GetActivitiesQuery,
  type GetMapActivitiesQuery,
  getFiltersOccurrenceTypes,
  OccurrenceType,
  type QueryActivityDto,
  type RateActivityResponse
} from "../domainDtos"
import { OccurrenceDateRangeDto } from "../OccurrenceDateRangeDto"
import { OrderByDto } from "../OrderByDto"

const API_URL = process.env.NEXT_PUBLIC_API_URL

export interface SearchResult {
  activities: QueryActivityDto[]
  hasMore: boolean
  extendedSearch?: QueryActivityDto[]
}

async function fetchActivityList(
  query: GetActivitiesQuery,
  signal?: AbortSignal
): Promise<QueryActivityDto[]> {
  const apiQuery = {
    ...query,
    occurrenceType: getFiltersOccurrenceTypes(query.occurrenceType)
  }
  const res = await fetch(`${API_URL}/Activities/getlist`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(apiQuery),
    signal,
    next: { revalidate: 60 }
  })

  if (!res.ok) {
    const bodyText = await res.text()
    console.error("Activities API error:", res.status, res.statusText, bodyText)
    return []
  }

  const data = await res.json()
  return data.activities ?? []
}

/**
 * Fetches activities for the given query.
 *
 * On page 1, if the query filters for Events and fewer than 5 event-type
 * results come back, an automatic extended search is performed with relaxed
 * filters (30-day range, no tags) to fill the page. The original sparse
 * results are returned separately as `extendedSearch` so the UI can show
 * them above a divider.
 */
export async function fetchActivity(id: string): Promise<QueryActivityDto | null> {
  const res = await fetch(`${API_URL}/Activities/${id}`, {
    next: { revalidate: 3600 }
  })

  if (!res.ok) {
    if (res.status === 404) return null
    console.error("Activity API error:", res.status, res.statusText)
    return null
  }

  const data = await res.json()
  return data.activity ?? null
}

export async function fetchRelatedActivities(
  activity: QueryActivityDto
): Promise<QueryActivityDto[]> {
  const query: GetActivitiesQuery = {
    coordinates: activity.base.address.coordinates ?? {
      latitude: 53.43786715839242,
      longitude: 14.542767164110858
    },
    region: { city: "Szczecin", country: "Poland" },
    tagIds: activity.tags?.map(tag => tag.id) ?? [],
    categoryIds: activity.tags ? undefined : activity.base.categoryIds,
    orderBy: OrderByDto.Recommended,
    dateRange: OccurrenceDateRangeDto.NextThirtyDays,
    pageNumber: 1,
    pageSize: 10
  }

  const activities = await fetchActivityList(query)
  return activities.filter(a => a.id !== activity.id)
}

export async function fetchMapActivities(
  query: GetMapActivitiesQuery,
  signal?: AbortSignal
): Promise<{ activities: QueryActivityDto[]; count: number }> {
  try {
    const apiQuery = {
      ...query,
      occurrenceType: getFiltersOccurrenceTypes(query.occurrenceType)
    }
    const res = await fetch(`${API_URL}/Activities/getmaplist`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(apiQuery),
      signal
    })

    if (!res.ok) {
      const bodyText = await res.text()
      console.error("Map activities API error:", res.status, res.statusText, bodyText)
      return { activities: [], count: 0 }
    }

    const data = await res.json()
    return { activities: data.activities ?? [], count: data.count ?? 0 }
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return { activities: [], count: 0 }
    }
    console.error("Map activities fetch error:", error)
    return { activities: [], count: 0 }
  }
}

export async function searchActivities(
  query: GetActivitiesQuery,
  signal?: AbortSignal
): Promise<SearchResult> {
  const activities = await fetchActivityList(query, signal)

  let extendedSearch: QueryActivityDto[] | undefined
  let mainActivities = activities

  // Extended search: if page 1, Events filter, and fewer than 5 event results
  const eventResults = activities.filter(
    a => a.base.occurrence.type !== OccurrenceType.OpeningHours
  )
  if (
    query.pageNumber === 1 &&
    query.occurrenceType === OccurrenceType.Events &&
    eventResults.length < 5
  ) {
    extendedSearch = activities

    const relaxedQuery: GetActivitiesQuery = {
      ...query,
      tagIds: undefined,
      dateRange: OccurrenceDateRangeDto.NextThirtyDays
    }
    const relaxedActivities = await fetchActivityList(relaxedQuery, signal)

    // Remove duplicates (activities already in the extended search set)
    const extendedIds = new Set(extendedSearch.map(a => a.id))
    mainActivities = relaxedActivities.filter(a => !a.id || !extendedIds.has(a.id))
  }

  const hasMore = mainActivities.length === query.pageSize

  return { activities: mainActivities, hasMore, extendedSearch }
}

export async function rateActivity(
  activityId: string,
  rating: number,
  token: string
): Promise<RateActivityResponse | null> {
  try {
    const res = await fetch(`${API_URL}/Activities/rateactivity`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ activityId, rating })
    })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

export async function fetchUserRatedActivities(
  userId: string,
  rating: number,
  token: string
): Promise<string[]> {
  try {
    const res = await fetch(`${API_URL}/Users/${userId}/activities/rated?Rating=${rating}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (!res.ok) return []
    const data: QueryActivityDto[] = await res.json()
    return data.map(a => a.id).filter((id): id is string => !!id)
  } catch {
    return []
  }
}

export async function fetchCurrentUser(
  token: string
): Promise<{ id?: string; role?: number } | null> {
  try {
    const res = await fetch(`${API_URL}/Users/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

export async function fetchUserCreatedActivities(token: string): Promise<QueryActivityDto[]> {
  try {
    const user = await fetchCurrentUser(token)
    if (!user?.id) return []
    const res = await fetch(`${API_URL}/Users/${user.id}/activities/created`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}

export async function fetchUserLikedActivitiesFull(token: string): Promise<QueryActivityDto[]> {
  try {
    const user = await fetchCurrentUser(token)
    if (!user?.id) return []
    const res = await fetch(`${API_URL}/Users/${user.id}/activities/rated?Rating=1`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}

export async function deleteActivity(activityId: string, token: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/Activities/${activityId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    })
    return res.ok
  } catch {
    return false
  }
}

export async function createActivity(
  activity: QueryActivityDto,
  token: string
): Promise<QueryActivityDto | null> {
  try {
    const res = await fetch(`${API_URL}/Activities`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        activity,
        region: { city: "Szczecin", country: "Poland" }
      })
    })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

export async function updateActivity(
  id: string,
  activity: QueryActivityDto,
  token: string
): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/Activities`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ id, activity })
    })
    return res.ok
  } catch {
    return false
  }
}

export async function getSimilarActivities(
  activity: QueryActivityDto,
  token: string
): Promise<QueryActivityDto[]> {
  try {
    const res = await fetch(`${API_URL}/Activities/getsimilar`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        activity,
        region: { city: "Szczecin", country: "Poland" }
      })
    })
    if (!res.ok) return []
    const data = await res.json()
    return data.similarActivities ?? []
  } catch {
    return []
  }
}

export async function getActivityMetadata(
  title: string,
  description: string,
  token: string
): Promise<import("../domainDtos").ActivityMetadataDto | null> {
  try {
    const res = await fetch(`${API_URL}/Activities/getactivitymetadata`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ activityTitle: title, activityDescription: description })
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.activityMetadata ?? null
  } catch {
    return null
  }
}

export async function getDates(
  occurrence: import("../domainDtos").CommandOccurrence,
  token: string
): Promise<import("../domainDtos").QueryOccurrenceDateDto[]> {
  try {
    const res = await fetch(`${API_URL}/Dates`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ occurrence })
    })
    if (!res.ok) return []
    const data = await res.json()
    return data.occurenceDates ?? []
  } catch {
    return []
  }
}

export async function uploadPhoto(file: File, activityId: string, token: string): Promise<boolean> {
  try {
    const formData = new FormData()
    formData.append("file", file)
    const res = await fetch(`${API_URL}/Photos/${activityId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    })
    return res.ok
  } catch {
    return false
  }
}
