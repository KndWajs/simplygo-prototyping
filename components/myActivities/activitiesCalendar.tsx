"use client"

import { Box, styled, Typography } from "@mui/material"
import { DateCalendar, LocalizationProvider, PickersDay } from "@mui/x-date-pickers"
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns"
import { pl } from "date-fns/locale"
import React from "react"
import { QueryActivityDto } from "../../models/domainDtos"
import { toLocalISODate } from "../../utils/dateUtils"

type ViewType = "my" | "favorites"

interface ActivitiesCalendarProps {
  activities: QueryActivityDto[]
  viewType: ViewType
}

const CustomDay = styled(PickersDay, {
  shouldForwardProp: prop => prop !== "ownerState"
})<{ ownerState: { hasActivity: boolean; isToday: boolean } }>(({ theme, ownerState }) => {
  const { hasActivity, isToday } = ownerState

  return {
    position: "relative",
    ...(isToday && {
      border: `1px solid ${theme.palette.primary.main}`,
      borderRadius: "50%"
    }),
    "&::after": hasActivity
      ? {
          content: '""',
          position: "absolute",
          bottom: "4px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "4px",
          height: "4px",
          borderRadius: "50%",
          backgroundColor: theme.palette.primary.main,
          pointerEvents: "none"
        }
      : {}
  }
})

function DayWrapper(props: any) {
  const { day, activityDates = [], outsideCurrentMonth, ...other } = props
  const cellKey = toLocalISODate(day)
  const hasActivity = !outsideCurrentMonth && activityDates.includes(cellKey)

  const today = new Date()
  const isToday =
    !outsideCurrentMonth &&
    day.getDate() === today.getDate() &&
    day.getMonth() === today.getMonth() &&
    day.getFullYear() === today.getFullYear()

  return (
    <CustomDay
      {...other}
      day={day}
      outsideCurrentMonth={outsideCurrentMonth}
      ownerState={{ hasActivity, isToday }}
      disabled
    />
  )
}

export const ActivitiesCalendar: React.FC<ActivitiesCalendarProps> = ({ activities, viewType }) => {
  const activityDates: string[] = activities
    .flatMap(a =>
      a.base.occurrence.occurrenceDates ? a.base.occurrence.occurrenceDates.map(d => d.start) : []
    )
    .map(d => toLocalISODate(d))
    .filter((date, index, self) => self.indexOf(date) === index)

  const defaultDate = new Date()
  const isEmpty = activities.length === 0

  const headerText =
    viewType === "my" ? "Twoje aktywności w tym miesiącu" : "Ulubione w tym miesiącu"

  const RawCalendar = () => (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={pl}>
      <DateCalendar
        slots={{ day: DayWrapper }}
        defaultValue={defaultDate}
        slotProps={{
          day: { activityDates: isEmpty ? [] : activityDates } as any
        }}
        readOnly
        views={["day"]}
        sx={{
          "& .MuiPickersDay-root": {
            cursor: "default"
          }
        }}
      />
    </LocalizationProvider>
  )

  return (
    <Box
      sx={{
        display: { xs: "none", md: "block" },
        alignSelf: { xs: "center", md: "flex-start" },
        mt: 2
      }}
    >
      <Typography
        variant="h6"
        sx={{
          mb: 2,
          fontSize: "1rem",
          fontWeight: 500,
          color: "text.primary"
        }}
      >
        {headerText}
      </Typography>
      {isEmpty ? (
        <Typography
          variant="body2"
          sx={{
            py: 3,
            color: "text.secondary",
            fontSize: "0.875rem",
            textAlign: "center"
          }}
        >
          Po dodaniu aktywności zobaczysz je tutaj w kalendarzu.
        </Typography>
      ) : (
        <RawCalendar />
      )}
    </Box>
  )
}
