"use client"

import { IconButton, Stack, Tooltip, Typography } from "@mui/material"
import { OccurrenceType } from "../../models/domainDtos"
import type { CommandOccurrence, Address } from "../../models/domainDtos"
import { getFirstOpenDay, getOpeningHours } from "../../utils/dateUtils"

interface AddToCalendarButtonProps {
  title: string
  description?: string
  activityId?: string
  occurrence: CommandOccurrence
  address?: Address
}

function toWarsawISO(date: Date): string {
  return date.toLocaleString("sv-SE", { timeZone: "Europe/Warsaw" }).replace(" ", "T")
}

function buildGoogleCalendarUrl(
  summary: string,
  details: string,
  location: string,
  start: Date,
  end: Date
): string {
  const fmt = (d: Date) =>
    d
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "")

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: summary,
    dates: `${fmt(start)}/${fmt(end)}`,
    details,
    location,
    ctz: "Europe/Warsaw"
  })

  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

export function AddToCalendarButton({
  title,
  description,
  activityId,
  occurrence,
  address
}: AddToCalendarButtonProps) {
  const summary = title ? `${title} | Simplygo` : "Simplygo"
  const activityUrl = `https://simplygo.pl/wydarzenia/${activityId}`
  const details = description
    ? `${description}\n\nZnalezione na Simplygo: ${activityUrl}`
    : `Znalezione na Simplygo: ${activityUrl}`
  const location = address?.streetAddress || ""

  const handleClick = () => {
    let start: Date | undefined
    let end: Date | undefined

    if (occurrence.occurrenceDates?.[0]?.start) {
      start = new Date(occurrence.occurrenceDates[0].start)
      end = new Date(occurrence.occurrenceDates[0].end)
    } else if (occurrence.type === OccurrenceType.OpeningHours) {
      const openDay = getFirstOpenDay(occurrence)
      if (openDay >= 0) {
        const hours = getOpeningHours(openDay, occurrence)
        const [from, to] = hours.split("-")
        const [fromH, fromM] = from.split(":").map(Number)
        const [toH, toM] = to.split(":").map(Number)

        const today = new Date()
        const targetWeekday = (openDay + 1) % 7
        const delta = (targetWeekday - today.getDay() + 7) % 7

        start = new Date(today)
        start.setDate(today.getDate() + delta)
        start.setHours(fromH, fromM, 0, 0)

        end = new Date(today)
        end.setDate(today.getDate() + delta)
        end.setHours(toH, toM, 0, 0)
      }
    }

    if (!start || !end) return

    const url = buildGoogleCalendarUrl(summary, details, location, start, end)
    window.open(url, "_blank")
  }

  return (
    <Tooltip title="Dodaj do kalendarza" placement="top">
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="flex-start"
        sx={{ cursor: "pointer", opacity: 0.8, "&:hover": { opacity: 0.9 } }}
        gap={0.5}
        onClick={handleClick}
      >
        <IconButton onClick={handleClick} sx={{ padding: 0, margin: 0 }}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 41 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M26.8156 32.0002L32.4998 26.3159L29.6577 25.8311L26.8156 26.3159L26.2969 28.9156L26.8156 32.0002Z"
              fill="#EA4335"
            />
            <path
              d="M8.5 26.3159V30.1054C8.5 31.1523 9.34787 32.0002 10.3947 32.0002H14.1842L14.7678 29.1581L14.1842 26.3159L11.0874 25.8311L8.5 26.3159Z"
              fill="#188038"
            />
            <path
              d="M32.4998 13.6843V9.89469C32.4998 8.84787 31.652 8 30.6052 8H26.8156C26.4698 9.40963 26.2969 10.447 26.2969 11.1121C26.2969 11.7772 26.4698 12.6346 26.8156 13.6843C28.0728 14.0443 29.0202 14.2243 29.6577 14.2243C30.2953 14.2243 31.2427 14.0443 32.4998 13.6843Z"
              fill="#1967D2"
            />
            <path d="M32.5007 13.6846H26.8164V26.3161H32.5007V13.6846Z" fill="#FBBC04" />
            <path d="M26.8151 26.3154H14.1836V31.9997H26.8151V26.3154Z" fill="#34A853" />
            <path
              d="M26.8157 8H10.3948C9.34787 8 8.5 8.84787 8.5 9.89469V26.3157H14.1842V13.6842H26.8157V8Z"
              fill="#4285F4"
            />
            <path
              d="M16.7763 23.4829C16.3041 23.164 15.9772 22.6982 15.7988 22.0823L16.8947 21.6308C16.994 22.0097 17.1677 22.3034 17.4157 22.5118C17.662 22.7203 17.962 22.8229 18.3125 22.8229C18.6709 22.8229 18.9788 22.7139 19.2362 22.496C19.4936 22.2781 19.6231 22.0002 19.6231 21.664C19.6231 21.3197 19.4873 21.0387 19.2157 20.8208C18.9441 20.6029 18.6031 20.494 18.1957 20.494H17.5625V19.4093H18.131C18.4815 19.4093 18.7767 19.3145 19.0167 19.1249C19.2567 18.9356 19.3767 18.6765 19.3767 18.3465C19.3767 18.0529 19.2694 17.8192 19.0547 17.644C18.84 17.4687 18.5683 17.3802 18.2383 17.3802C17.9162 17.3802 17.6604 17.4656 17.471 17.6376C17.2815 17.8101 17.1392 18.028 17.0572 18.2708L15.9725 17.8192C16.1162 17.4118 16.3799 17.0518 16.7667 16.7408C17.1535 16.4297 17.6478 16.2734 18.2478 16.2734C18.6915 16.2734 19.091 16.3588 19.4447 16.5308C19.7983 16.7029 20.0762 16.9413 20.2767 17.2445C20.4773 17.5492 20.5767 17.8903 20.5767 18.2692C20.5767 18.656 20.4836 18.9829 20.2973 19.2513C20.111 19.5197 19.882 19.7249 19.6104 19.8687V19.9333C19.9611 20.0779 20.2657 20.3154 20.4915 20.6203C20.7204 20.9281 20.8357 21.296 20.8357 21.7256C20.8357 22.1549 20.7267 22.5387 20.5088 22.8749C20.291 23.2113 19.9895 23.4765 19.6072 23.6692C19.2236 23.8618 18.7925 23.9598 18.3141 23.9598C17.7599 23.9613 17.2484 23.8018 16.7763 23.4829ZM23.5071 18.0449L22.304 18.9149L21.7025 18.0024L23.8609 16.4455H24.6882V23.7892H23.5071V18.0449Z"
              fill="#4285F4"
            />
          </svg>
        </IconButton>
        <Typography
          variant="caption"
          sx={{ color: "text.secondary", cursor: "pointer" }}
        >
          Dodaj do kalendarza
        </Typography>
      </Stack>
    </Tooltip>
  )
}
