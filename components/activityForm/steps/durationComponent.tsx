"use client"

import React from "react"
import { Controller } from "react-hook-form"
import { Grid, TextField, FormControl, Select, MenuItem } from "@mui/material"
import { DurationEnum, getDurationEnum } from "../../../models/durationEnum"
import {
  getDurationValue,
  createDuration,
  getDurationLabel,
  getDurationUnit
} from "../../../utils/durationUtils"
import { ControlProps } from "../stepInterface"

export const DurationComponent: React.FC<ControlProps> = ({ control }) => {
  return (
    <Controller
      name="base.occurrence.duration"
      control={control}
      rules={{
        required: "Czas trwania jest wymagany"
      }}
      render={({ field, fieldState: { error } }) => {
        const value = field?.value || { hours: 0 }
        return (
          <Grid size={{ xs: 12, sm: 6 }} spacing={1} container>
            <Grid size={6}>
              <TextField
                {...field}
                type="number"
                label={"Czas trwania (" + getDurationLabel(value) + ")"}
                fullWidth
                value={getDurationValue(value)}
                onChange={e => {
                  const newValue = parseInt(e.target.value)
                  return field.onChange(createDuration(newValue, getDurationUnit(value)))
                }}
                error={!!error}
                helperText={error?.message}
              />
            </Grid>
            <Grid size={6}>
              <FormControl fullWidth>
                <Select
                  value={field?.value && getDurationUnit(value)}
                  onChange={e => {
                    const durationValue = getDurationValue(value)
                    field.onChange(
                      createDuration(durationValue, getDurationEnum(e.target.value as string))
                    )
                  }}
                >
                  <MenuItem value={DurationEnum.Minutes}>Minuty</MenuItem>
                  <MenuItem value={DurationEnum.Hours}>Godziny</MenuItem>
                  <MenuItem value={DurationEnum.Days}>Dni</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        )
      }}
    />
  )
}
