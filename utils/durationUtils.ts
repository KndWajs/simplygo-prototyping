import { Duration } from "../models/domainDtos"
import { DurationEnum } from "../models/durationEnum"

export const getDurationValue = (duration: Duration): number => {
  return duration.days || duration.hours || duration.minutes || 0
}

export const getDurationUnit = (duration: Duration): DurationEnum => {
  return duration.days
    ? DurationEnum.Days
    : duration.hours
      ? DurationEnum.Hours
      : DurationEnum.Minutes
}

export const getDurationLabel = (duration: Duration): string => {
  return duration.days ? "Dni" : duration.hours ? "Godziny" : "Minuty"
}

export const createDuration = (value: number, unit: DurationEnum): Duration => {
  switch (unit) {
    case DurationEnum.Days:
      return { days: value }
    case DurationEnum.Hours:
      return { hours: value }
    case DurationEnum.Minutes:
      return { minutes: value }
  }
}
