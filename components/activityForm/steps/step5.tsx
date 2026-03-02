"use client"

import {
  Alert,
  Box,
  Checkbox,
  FormControlLabel,
  Grid,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  useTheme
} from "@mui/material"
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
import { pl } from "date-fns/locale"
import EventBorder from "@mui/icons-material/Event"
import HomeBorder from "@mui/icons-material/Deck"
import React, { useEffect, useState } from "react"
import { SubmitHandler, useForm } from "react-hook-form"
import {
  ActivityMetadataDto,
  OccurrenceType,
  QueryActivityDto,
  RecurrencePattern
} from "../../../models/domainDtos"
import { NOW_PLUS_24H, NOW_PLUS_ONE_MONTH } from "../../../utils/dateUtils"
import { OpeningHoursForm } from "./openingHoursForm"
import { RepetitiveOccurrence } from "./repetitiveOccurrence"
import { SingleOccurrence } from "./singleOccurrence"
import { StepInterface } from "../stepInterface"
import { StepTemplate } from "../stepTemplate"

const roundedNowPlus24H = new Date(NOW_PLUS_24H)
roundedNowPlus24H.setMinutes(0, 0, 0)

const PlaceIcon = ({ onClick, active }: { onClick?: () => void; active?: boolean }) => {
  const theme = useTheme()
  return (
    <Tooltip
      arrow
      placement="top"
      title="Stałe lokalizacje z godzinami otwarcia (np. park, muzeum, klub sportowy)"
    >
      <IconButton
        onClick={onClick}
        sx={{
          color: active ? theme.palette.info.main : theme.palette.grey[400],
          borderColor: active ? theme.palette.info.main : theme.palette.grey[400]
        }}
      >
        <Stack direction="column" alignItems="center">
          <HomeBorder />
          <Typography variant="caption">Miejsca</Typography>
        </Stack>
      </IconButton>
    </Tooltip>
  )
}

const EventIcon = ({ onClick, active }: { onClick?: () => void; active?: boolean }) => {
  const theme = useTheme()
  return (
    <Tooltip
      arrow
      placement="top"
      title="Akcje z konkretną datą i godziną (np. koncert, warsztaty, turniej)"
    >
      <IconButton
        onClick={onClick}
        sx={{
          color: active ? theme.palette.info.main : theme.palette.grey[400],
          borderColor: active ? theme.palette.info.main : theme.palette.grey[400]
        }}
      >
        <Stack direction="column" alignItems="center">
          <EventBorder />
          <Typography variant="caption">Wydarzenia</Typography>
        </Stack>
      </IconButton>
    </Tooltip>
  )
}

export const Step5: React.FC<StepInterface> = ({
  activity,
  submitButton,
  cancelButton,
  metadata
}) => {
  const [selectedType, setSelectedType] = useState<OccurrenceType | undefined>(
    activity.base.occurrence.type
  )

  const getDefault = (activity: QueryActivityDto, metadata?: ActivityMetadataDto) => {
    if (
      activity.base.occurrence.type === OccurrenceType.OpeningHours ||
      activity.base.occurrence.type === OccurrenceType.Repetitive ||
      activity.base.occurrence.single?.date
    ) {
      return { ...activity }
    }

    const updatedActivity = { ...activity }

    if (
      metadata?.occurrenceType == OccurrenceType.OpeningHours ||
      metadata?.occurrenceType == OccurrenceType.Places
    ) {
      updatedActivity.base.occurrence.type = OccurrenceType.OpeningHours
      updatedActivity.base.occurrence.openingHours = [
        { day: 0, open: "08:00:00", close: "16:00:00" }
      ]
      return updatedActivity
    }

    if (metadata?.occurrenceType == OccurrenceType.Repetitive) {
      updatedActivity.base.occurrence.type = metadata.occurrenceType
    } else {
      updatedActivity.base.occurrence.type = OccurrenceType.Single
    }

    if (metadata?.durationInMinutes) {
      updatedActivity.base.occurrence.duration = {
        minutes: metadata.durationInMinutes
      }
    } else {
      updatedActivity.base.occurrence.duration = { hours: 1 }
    }

    if (metadata?.startDate) {
      updatedActivity.base.occurrence.single = {
        date: metadata.startDate
      }
    } else {
      updatedActivity.base.occurrence.single = {
        date: roundedNowPlus24H.toISOString()
      }
    }
    return updatedActivity
  }

  const {
    handleSubmit,
    setValue,
    getValues,
    control,
    formState: { isValid }
  } = useForm<QueryActivityDto>({
    defaultValues: getDefault(activity, metadata),
    mode: "onChange"
  })

  useEffect(() => {
    if (activity.base.occurrence.type) {
      setSelectedType(activity.base.occurrence.type)
      if (activity.base.occurrence.type != OccurrenceType.OpeningHours) {
        setValue("base.occurrence.openingHours", undefined)
      }

      if (
        activity.base.occurrence.type === OccurrenceType.Single &&
        activity.base.occurrence.occurrenceDates
      ) {
        setValue("base.occurrence.single.date", activity.base.occurrence.occurrenceDates[0].start, {
          shouldValidate: true
        })
        setValue("base.occurrence.openingHours", undefined)
        setValue("base.occurrence.occurrenceDates", undefined)
      }
    }
  }, [])

  const onSubmit: SubmitHandler<QueryActivityDto> = data => {
    const newData = { ...data }
    if (!newData.base.occurrence.duration) {
      delete newData.base.occurrence.duration
    }
    if (!newData.base.occurrence.openingHours) {
      delete newData.base.occurrence.openingHours
    }
    if (!newData.base.occurrence.repetitive || !newData.base.occurrence.repetitive.startDate) {
      delete newData.base.occurrence.repetitive
    }
    if (!newData.base.occurrence.single || !newData.base.occurrence.single.date) {
      delete newData.base.occurrence.single
    }
    submitButton.action(newData)
  }

  const handleTypeChange = (type: OccurrenceType) => {
    setSelectedType(type)
    setValue("base.occurrence.type", type, { shouldValidate: true })

    switch (type) {
      case OccurrenceType.Single:
        setValue("base.occurrence.duration", { hours: 1 })
        setValue("base.occurrence.openingHours", undefined)
        setValue("base.occurrence.repetitive", undefined)
        setValue("base.occurrence.single", { date: NOW_PLUS_24H.toISOString() })
        break
      case OccurrenceType.Repetitive: {
        setValue("base.occurrence.duration", { hours: 1 })
        setValue("base.occurrence.openingHours", undefined)
        setValue("base.occurrence.single", undefined)

        const startDateWithResetTime = new Date(NOW_PLUS_24H)
        startDateWithResetTime.setUTCHours(0, 0, 0, 0)

        const endDateWithResetTime = new Date(NOW_PLUS_ONE_MONTH)
        endDateWithResetTime.setUTCHours(0, 0, 0, 0)

        setValue("base.occurrence.repetitive", {
          startDate: startDateWithResetTime.toISOString(),
          endDate: endDateWithResetTime.toISOString(),
          time: "16:00:00",
          recurrencePattern: RecurrencePattern.Weekly,
          recurrenceInterval: 1,
          recurrenceDay: []
        })
        break
      }
      case OccurrenceType.OpeningHours:
        setValue("base.occurrence.duration", undefined)
        setValue("base.occurrence.single", undefined)
        setValue("base.occurrence.repetitive", undefined)
        setValue("base.occurrence.openingHours", [{ day: 0, open: "08:00:00", close: "16:00:00" }])
        break
    }
  }

  return (
    <StepTemplate
      onSubmit={handleSubmit(d => onSubmit(d))}
      onCancel={() => cancelButton?.action(getValues())}
      submitDisabled={!isValid}
      okText={submitButton.name}
      cancelText={cancelButton?.name}
      progressValue={85}
    >
      <Box sx={{ px: { xs: 2, md: 3 } }}>
        <Typography
          variant="h1"
          className="no-select"
          sx={{
            fontSize: { xs: "2.5rem", sm: "3.5rem", lg: "4rem" },
            fontWeight: "bold",
            mb: 1,
            lineHeight: 1.2,
            textAlign: "center",
            width: "100%"
          }}
        >
          Podaj datę
        </Typography>

        <Typography
          variant="body2"
          className="no-select"
          sx={{
            fontSize: { xs: "1rem", sm: "1.125rem" },
            color: "#a1a1aa",
            mb: { xs: "24px", md: "32px" },
            fontWeight: 300,
            textAlign: "center",
            width: "100%"
          }}
        />
      </Box>
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={pl}>
        <Grid container spacing={1} sx={{ maxWidth: "750px", margin: "0 auto" }}>
          <Grid size={12} justifyContent="space-around" container>
            <PlaceIcon
              onClick={() => handleTypeChange(OccurrenceType.OpeningHours)}
              active={selectedType === OccurrenceType.OpeningHours}
            />
            <EventIcon
              onClick={() => handleTypeChange(OccurrenceType.Single)}
              active={selectedType != OccurrenceType.OpeningHours}
            />
          </Grid>
          <Alert severity="info">
            {selectedType === OccurrenceType.OpeningHours ? (
              <>
                &quot;Miejsce&quot; to stała lokalizacja (np. park trampolin, klub). Wpisz godziny
                otwarcia zamiast daty wydarzenia.
              </>
            ) : (
              <>
                &quot;Wydarzenie&quot; to spotkanie z określoną datą i godziną — jednorazowe lub
                cykliczne (np. turniej w sobotę, zajęcia co wtorek).
              </>
            )}
          </Alert>

          <Grid size={12} spacing={2} container>
            {selectedType != OccurrenceType.OpeningHours && (
              <Grid size={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedType === OccurrenceType.Repetitive}
                      onChange={e => {
                        if (e.target.checked) {
                          handleTypeChange(OccurrenceType.Repetitive)
                        } else {
                          handleTypeChange(OccurrenceType.Single)
                        }
                      }}
                    />
                  }
                  label="Wydarzenie cykliczne"
                />
              </Grid>
            )}
            {selectedType === OccurrenceType.Single && (
              <SingleOccurrence control={control} setValue={setValue} />
            )}
            {selectedType === OccurrenceType.Repetitive && (
              <RepetitiveOccurrence control={control} setValue={setValue} />
            )}
            {selectedType === OccurrenceType.OpeningHours && (
              <OpeningHoursForm control={control} setValue={setValue} />
            )}
          </Grid>
        </Grid>
      </LocalizationProvider>
    </StepTemplate>
  )
}
