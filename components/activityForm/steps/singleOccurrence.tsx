"use client"

import React from "react"
import { Controller } from "react-hook-form"
import { Grid } from "@mui/material"
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker"
import { NOW_PLUS_24H, NOW_PLUS_ONE_YEAR } from "../../../utils/dateUtils"
import { ControlPlusProps } from "../stepInterface"
import { DurationComponent } from "./durationComponent"

export const SingleOccurrence: React.FC<ControlPlusProps> = ({ control }) => {
  return (
    <Grid container spacing={2} size={12}>
      <Grid size={{ xs: 12, sm: 6 }}>
        <Controller
          name="base.occurrence.single.date"
          control={control}
          rules={{ required: "Data jest wymagana" }}
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <DateTimePicker
              label="Data i godzina"
              value={value ? new Date(value) : null}
              maxDate={NOW_PLUS_ONE_YEAR}
              minDateTime={NOW_PLUS_24H}
              onChange={newValue => onChange(newValue?.toISOString())}
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
  )
}
