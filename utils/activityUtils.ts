import { ActivityType, OccurrenceType, QueryActivityDto } from "../models/domainDtos"

// Local constants — these were previously imported from Redux (common.slice)
const EVENTS_ID = "1"
const SPORT_ID = "2"
const KIDS_ID = "3"

export const isKidsActivity = (activity: QueryActivityDto): boolean => {
  return activity.categories?.some(cat => cat.mainCategory === KIDS_ID) ?? false
}
export const isEventActivity = (activity: QueryActivityDto): boolean => {
  return activity.categories?.some(cat => cat.mainCategory === EVENTS_ID) ?? false
}
export const isSportActivity = (activity: QueryActivityDto): boolean => {
  return activity.categories?.some(cat => cat.mainCategory === SPORT_ID) ?? false
}

export const getCategory = (activity: QueryActivityDto): ActivityType => {
  if (isKidsActivity(activity)) {
    return ActivityType.Kids
  } else if (isEventActivity(activity)) {
    return ActivityType.Event
  } else if (isSportActivity(activity)) {
    return ActivityType.Sport
  } else {
    console.log("Unknown activity type")
    return ActivityType.Event
  }
}

export const isPlaceActivity = (activity: QueryActivityDto): boolean => {
  return activity.base.occurrence.type === OccurrenceType.OpeningHours
}

const idxFromId = (id: string | number, len: number) => {
  const n =
    typeof id === "number"
      ? id
      : /^\d+$/.test(id)
        ? parseInt(id, 10)
        : [...id].reduce((sum, ch) => sum + ch.charCodeAt(0), 0)
  return Math.abs(n) % len
}

export const getImageUrl = (activity: QueryActivityDto): string => {
  const sport = activity.categories?.filter(cat => cat.mainCategory === SPORT_ID)
  if (sport && sport.length > 0) {
    const i = idxFromId(activity.id || 0, sport.length)
    return `/thumbnails/${sport[i].id}.jpg`
  }

  const events = activity.categories?.filter(cat => cat.mainCategory === EVENTS_ID)
  if (events && events.length > 0) {
    const i = idxFromId(activity.id || 0, events.length)
    return `/thumbnails/${events[i].id}.jpg`
  }

  const kids = activity.categories?.filter(cat => cat.mainCategory === KIDS_ID)
  if (kids && kids.length > 0) {
    const i = idxFromId(activity.id || 0, kids.length)
    return `/thumbnails/${kids[i].id}.jpg`
  }

  return "/thumbnails/placeholder.jpg"
}
