"use client"

import {
  FormControl,
  FormHelperText,
  Grid,
  MenuItem,
  Select,
  TextField,
  ToggleButton,
  ToggleButtonGroup
} from "@mui/material"
import { DatePicker, TimePicker } from "@mui/x-date-pickers"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
import { pl } from "date-fns/locale"
import React from "react"
import { Controller, useWatch } from "react-hook-form"
import { RecurrencePattern } from "../../../models/domainDtos"
import { formatToTime, NOW_PLUS_24H, NOW_PLUS_ONE_YEAR } from "../../../utils/dateUtils"
import { DurationComponent } from "./durationComponent"
import { ControlPlusProps } from "../stepInterface"

export const RepetitiveOccurrence: React.FC<ControlPlusProps> = ({ control, setValue }) => {
  const recurrencePattern = useWatch({
    control,
    name: "base.occurrence.repetitive.recurrencePattern"
  })

  const recurrenceInterval = useWatch({
    control,
    name: "base.occurrence.repetitive.recurrenceInterval"
  })

  const renderDaySelector = (rp: RecurrencePattern | undefined) => {
    const days =
      rp == RecurrencePattern.Weekly
        ? ["Pn", "Wt", "Śr", "Cz", "Pt", "Sb", "Nd"]
        : [...Array(31).keys()].map(i => i + 1)

    const tempFix = (index: number) => (index == 6 ? 0 : index + 1)

    return (
      <Controller
        name="base.occurrence.repetitive.recurrenceDay"
        control={control}
        rules={{ required: "Wybierz przynajmniej jeden dzień" }}
        render={({ field: { value, onChange }, fieldState: { error } }) => (
          <FormControl error={!!error} fullWidth>
            <Grid container spacing={1}>
              {days.map((day, index) => (
                <Grid key={rp == RecurrencePattern.Weekly ? tempFix(index) : index + 1}>
                  <ToggleButtonGroup
                    value={value || []}
                    onChange={(_, newDays) => onChange(newDays)}
                    size="small"
                  >
                    <ToggleButton
                      style={{ minWidth: "36px", width: "100%" }}
                      value={rp == RecurrencePattern.Weekly ? tempFix(index) : index + 1}
                    >
                      {day}
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Grid>
              ))}
            </Grid>
            {error && <FormHelperText>{error.message}</FormHelperText>}
          </FormControl>
        )}
      />
    )
  }

  return (
    <Grid container spacing={2}>
      Pierwsze wydarzenie:
      <Grid container spacing={2} size={12}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name="base.occurrence.repetitive.time"
            control={control}
            rules={{ required: "Data jest wymagana" }}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <TimePicker
                label="Data i godzina"
                value={value ? new Date("1970-01-01T" + value) : undefined}
                onChange={newValue => onChange(newValue ? formatToTime(newValue) : undefined)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!error,
                    helperText: error?.message
                  }
                }}
              />
            )}
          />
        </Grid>
        <DurationComponent control={control} />
      </Grid>
      Powtarzaj:
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Controller
            name="base.occurrence.repetitive.startDate"
            control={control}
            rules={{ required: "Data początkowa jest wymagana" }}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <LocalizationProvider adapterLocale={pl}>
                <DatePicker
                  label="Powtarzaj od"
                  maxDate={NOW_PLUS_ONE_YEAR}
                  value={value ? new Date(value) : null}
                  minDate={NOW_PLUS_24H}
                  onChange={newValue => {
                    if (newValue) {
                      const date = new Date(newValue)
                      date.setUTCHours(0, 0, 0, 0)
                      onChange(date.toISOString())
                    } else {
                      onChange(null)
                    }
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!error,
                      helperText: error?.message
                    }
                  }}
                />
              </LocalizationProvider>
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Controller
            name="base.occurrence.repetitive.endDate"
            control={control}
            rules={{ required: "Data końcowa jest wymagana" }}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <LocalizationProvider adapterLocale={pl}>
                <DatePicker
                  label="Powtarzaj do"
                  maxDate={NOW_PLUS_ONE_YEAR}
                  value={value ? new Date(value) : null}
                  onChange={newValue => {
                    if (newValue) {
                      const date = new Date(newValue)
                      date.setUTCHours(0, 0, 0, 0)
                      onChange(date.toISOString())
                    } else {
                      onChange(null)
                    }
                  }}
                  minDate={NOW_PLUS_24H}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!error,
                      helperText: error?.message
                    }
                  }}
                />
              </LocalizationProvider>
            )}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 2 }}>
          <Controller
            name="base.occurrence.repetitive.recurrenceInterval"
            control={control}
            rules={{ required: "Interwał jest wymagany", min: 1 }}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                type="number"
                slotProps={{ htmlInput: { inputMode: "numeric", min: 1, max: 4 } }}
                label="Powtarzaj co"
                fullWidth
                error={!!error}
                helperText={error?.message}
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 2 }}>
          <FormControl fullWidth>
            <Controller
              name="base.occurrence.repetitive.recurrencePattern"
              control={control}
              rules={{ required: "Wzorzec powtarzania jest wymagany" }}
              render={({ field, fieldState: { error } }) => (
                <Select
                  {...field}
                  onChange={e => {
                    setValue("base.occurrence.repetitive.recurrenceDay", [])
                    field.onChange(e)
                  }}
                  error={!!error}
                >
                  <MenuItem value={RecurrencePattern.Weekly}>
                    {recurrenceInterval && recurrenceInterval > 1 ? "tygodnie" : "tydzień"}
                  </MenuItem>
                  <MenuItem value={RecurrencePattern.Monthly}>
                    {recurrenceInterval && recurrenceInterval > 1 ? "miesiące" : "miesiąc"}
                  </MenuItem>
                </Select>
              )}
            />
          </FormControl>
        </Grid>
        {recurrencePattern !== undefined && (
          <Grid size={12}>{renderDaySelector(recurrencePattern)}</Grid>
        )}
      </Grid>
    </Grid>
  )
}
