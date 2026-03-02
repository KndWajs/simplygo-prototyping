import LoopIcon from "@mui/icons-material/Loop"
import { Box, Stack, Typography } from "@mui/material"
import { useMemo } from "react"
import { OccurrenceType, QueryActivityDto, RecurrencePattern } from "../../models/domainDtos"
import { getFirstOpenDay, getOpeningHours, printDay } from "../../utils/dateUtils"

interface OccurrenceTimeProps {
  activity: QueryActivityDto
  hideDetails?: boolean
}

const fmtTime = new Intl.DateTimeFormat("pl-PL", { hour: "2-digit", minute: "2-digit" })

const weekdayPL = ["Niedziela", "Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota"]

const weekdayShortPL = ["nd", "pn", "wt", "śr", "cz", "pt", "sb"]

const monthGenitivePL = [
  "Stycznia",
  "Lutego",
  "Marca",
  "Kwietnia",
  "Maja",
  "Czerwca",
  "Lipca",
  "Sierpnia",
  "Września",
  "Października",
  "Listopada",
  "Grudnia"
]

const sameYMD = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate()

function formatDateBlock(date: Date) {
  const dayOfWeek = weekdayPL[date.getDay()]
  const day = date.getDate()
  const month = monthGenitivePL[date.getMonth()]
  return { dayOfWeek, datePart: `${day} ${month}` }
}

function formatTimeRange(start: Date, end?: Date) {
  const timeA = fmtTime.format(start)
  if (!end || sameYMD(start, end)) {
    const timeB = end ? fmtTime.format(end) : null
    if (!timeB || timeA === timeB) return timeA
    return `${timeA}–${timeB}`
  }
  return `${timeA}–${fmtTime.format(end)}`
}

function DateBlock({ start, end }: { start: Date; end?: Date }) {
  const { dayOfWeek, datePart } = formatDateBlock(start)
  const timeRange = formatTimeRange(start, end)
  return (
    <Box>
      <Typography variant="body2" component="span" sx={{ fontWeight: 700 }}>
        {dayOfWeek}
      </Typography>
      <Typography variant="body2" component="span">
        , {datePart}
      </Typography>
      <br />
      <Typography variant="body2" component="span" color="primary">
        {timeRange}
      </Typography>
    </Box>
  )
}

const fmtDate = new Intl.DateTimeFormat("pl-PL", {
  weekday: "long",
  month: "short",
  day: "numeric",
  year: "numeric"
})

function firstOccurrence(occurrence: QueryActivityDto["base"]["occurrence"]) {
  const od = occurrence.occurrenceDates?.[0]
  if (!od?.start) return null
  const start = new Date(od.start)
  const end = od.end ? new Date(od.end) : undefined
  return { start, end }
}

function formatRepetitiveSummary(activity: QueryActivityDto) {
  const occ = activity.base.occurrence
  if (!occ.repetitive) return null

  const { recurrencePattern, recurrenceInterval, recurrenceDay, time, startDate, endDate } =
    occ.repetitive

  const timeStr = time?.slice(0, 5) ?? ""
  const untilStr = endDate ? new Date(endDate) : undefined
  const untilFmt = untilStr ? `, do ${fmtDate.format(untilStr)}` : ""

  if (recurrencePattern === RecurrencePattern.Weekly) {
    const every =
      recurrenceInterval && recurrenceInterval > 1
        ? `Co ${recurrenceInterval} tygodnie`
        : "Co tydzień"
    const days =
      recurrenceDay && recurrenceDay.length
        ? " w " + recurrenceDay.map(d => weekdayShortPL[d].toLowerCase()).join(", ")
        : ""
    return `${every}${days} o ${timeStr}${untilFmt}`
  }

  if (recurrencePattern === RecurrencePattern.Monthly) {
    const every =
      recurrenceInterval && recurrenceInterval > 1
        ? `Co ${recurrenceInterval} miesiące`
        : "Co miesiąc"
    const days = recurrenceDay && recurrenceDay.length ? " dnia " + recurrenceDay.join(",") : ""
    return `${every}${days} o ${timeStr}${untilFmt}`
  }

  if (recurrencePattern === RecurrencePattern.FirstDayOfMonth) {
    return `Pierwszego dnia miesiąca o ${timeStr}${untilFmt}`
  }

  if (recurrencePattern === RecurrencePattern.LastDayOfMonth) {
    return `Ostatniego dnia miesiąca o ${timeStr}${untilFmt}`
  }

  const fromStr = startDate ? ` od ${fmtDate.format(new Date(startDate))}` : ""
  return `Cyklicznie${fromStr}${untilFmt}`
}

export const OccurrenceTime = ({ activity, hideDetails }: OccurrenceTimeProps) => {
  const { occurrence } = activity.base
  const first = useMemo(() => firstOccurrence(occurrence), [occurrence])
  const repSummary = useMemo(() => formatRepetitiveSummary(activity), [activity])

  const openingHoursLabel =
    occurrence.openingHours && occurrence.openingHours.length > 0
      ? "Godziny otwarcia:"
      : "Otwarte całą dobę"

  return (
    <Stack
      direction="column"
      alignItems="flex-start"
      justifyContent="flex-start"
      sx={{ width: "100%" }}
      gap={0.5}
    >
      {occurrence.type === OccurrenceType.Single && first && (
        <DateBlock start={first.start} end={first.end} />
      )}

      {occurrence.type === OccurrenceType.Repetitive && (
        <>
          <Stack direction="row" alignItems="center" gap={0.5}>
            <LoopIcon sx={{ height: "16px", color: "text.secondary" }} />
            {first && <DateBlock start={first.start} end={first.end} />}
          </Stack>
          {!hideDetails && repSummary && (
            <Typography variant="body2" color="text.secondary">
              {repSummary}
            </Typography>
          )}
        </>
      )}

      {occurrence.type === OccurrenceType.OpeningHours && (
        <>
          <Typography variant="body2">{openingHoursLabel}</Typography>
          {!!occurrence.openingHours?.length &&
            (hideDetails ? (
              <Typography variant="body2" color="primary">
                {printDay(getFirstOpenDay(occurrence))}{" "}
                {getOpeningHours(getFirstOpenDay(occurrence), occurrence)}
              </Typography>
            ) : (
              <Box gap={0.5} sx={{ display: "flex", flexDirection: "column" }}>
                {occurrence.openingHours.map(oh => (
                  <Typography variant="body2" key={oh.day}>
                    <Typography component="span" variant="body2" sx={{ fontWeight: 700 }}>
                      {printDay(oh.day)}
                    </Typography>
                    :{" "}
                    <Typography component="span" variant="body2" color="primary">
                      {getOpeningHours(oh.day, occurrence)}
                    </Typography>
                  </Typography>
                ))}
              </Box>
            ))}
        </>
      )}
    </Stack>
  )
}
