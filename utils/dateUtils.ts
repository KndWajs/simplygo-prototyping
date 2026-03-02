import { CommandOccurrence } from "../models/domainDtos"

export const NOW_PLUS_24H = new Date(Date.now() + 24 * 60 * 60 * 1000)
export const NOW_PLUS_ONE_MONTH = new Date(Date.now() + 32 * 24 * 60 * 60 * 1000)
export const NOW_PLUS_ONE_YEAR = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)

export const formatToTime = (date: Date): string => {
  return date.toLocaleTimeString("pl-PL")
}

export const getOpeningHours = (day: number, occurrence: CommandOccurrence): string => {
  if (!occurrence.openingHours || occurrence.openingHours.length === 0) {
    return "Całodobowo"
  }
  const openingHours = occurrence.openingHours.find(o => o.day == day)
  return openingHours
    ? openingHours.open.slice(0, 5) + "-" + openingHours.close.slice(0, 5)
    : "Zamknięte"
}

export const printDay = (firstOpenDay: number) => {
  const days = ["Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota", "Niedziela"]
  return days[firstOpenDay]
}

export const getFirstOpenDay = (occurrence: CommandOccurrence) => {
  const today = new Date().getDay() ? new Date().getDay() - 1 : 6

  const sortedOpeningHours = occurrence.openingHours?.slice().sort((a, b) => a.day - b.day)

  if (!sortedOpeningHours?.length) return -1

  const nextOpenDay = sortedOpeningHours.find(o => o.day >= today)
  return nextOpenDay ? nextOpenDay.day : sortedOpeningHours[0].day
}

export const calculateDuration = (occurrence: CommandOccurrence) => {
  if (!occurrence.duration) return undefined
  const { days, hours, minutes } = occurrence.duration
  if (days && days > 0) {
    return `${days} ${days > 1 ? "dni" : "dzień"}`
  } else if (hours && hours > 0) {
    return `${hours} ${hours > 1 ? "godziny" : "godzina"}`
  } else {
    return `${minutes} ${minutes && minutes > 1 ? "minuty" : "minuta"}`
  }
}

export const toLocalISODate = (date: string | Date): string => {
  const d = new Date(date)
  return d.toLocaleDateString("en-CA")
}
