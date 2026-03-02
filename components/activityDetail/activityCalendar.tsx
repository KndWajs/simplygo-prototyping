"use client"

import EventIcon from "@mui/icons-material/Event"
import { Accordion, AccordionDetails, AccordionSummary, Box, Typography } from "@mui/material"
import { DateCalendar, LocalizationProvider, PickersDay } from "@mui/x-date-pickers"
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns"
import { pl } from "date-fns/locale"
import { styled } from "@mui/material/styles"
import { toLocalISODate } from "../../utils/dateUtils"

const HighlightedDay = styled(PickersDay)(({ theme }) => ({
  "&.Mui-selected": {
    backgroundColor: theme.palette.info.main,
    color: theme.palette.info.contrastText
  }
}))

function CustomDay(props: any) {
  const { day, highlightedDates = [], outsideCurrentMonth, ...other } = props

  const cellKey = toLocalISODate(day)
  const isHighlighted: boolean = !outsideCurrentMonth && highlightedDates.includes(cellKey)

  return (
    <HighlightedDay
      {...other}
      day={day}
      outsideCurrentMonth={outsideCurrentMonth}
      selected={isHighlighted}
    />
  )
}

interface ActivityCalendarProps {
  occurrenceDates: { start: string; end: string }[]
}

export function ActivityCalendar({ occurrenceDates }: ActivityCalendarProps) {
  const highlightedDates = occurrenceDates.map(date => toLocalISODate(date.start))
  const defaultDate = new Date(occurrenceDates[0].start)

  return (
    <>
      {/* Mobile: collapsible accordion */}
      <Box
        sx={{
          display: { xs: "block", md: "none" },
          alignSelf: { xs: "center", md: "block" },
          width: "100%"
        }}
      >
        <Accordion elevation={0} sx={{ width: "100%", position: "inherit" }}>
          <AccordionSummary
            aria-controls="calendar-content"
            id="calendar-header"
            sx={{ pl: "8px" }}
          >
            <Typography
              component="span"
              variant="body1"
              sx={{ display: "flex", alignItems: "flex-start", gap: "16px" }}
            >
              <EventIcon /> Pokaż kalendarz
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={pl}>
              <DateCalendar
                slots={{ day: CustomDay }}
                defaultValue={defaultDate}
                slotProps={{ day: { highlightedDates } as any }}
                readOnly
                views={["day"]}
              />
            </LocalizationProvider>
          </AccordionDetails>
        </Accordion>
      </Box>

      {/* Desktop: always visible */}
      <Box
        sx={{
          display: { xs: "none", md: "block" },
          alignSelf: { xs: "center", md: "flex-start" }
        }}
      >
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={pl}>
          <DateCalendar
            slots={{ day: CustomDay }}
            defaultValue={defaultDate}
            slotProps={{ day: { highlightedDates } as any }}
            readOnly
            views={["day"]}
          />
        </LocalizationProvider>
      </Box>
    </>
  )
}
