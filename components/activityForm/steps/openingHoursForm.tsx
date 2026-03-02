"use client"

import React from "react"
import { Controller, useFieldArray, useWatch } from "react-hook-form"
import {
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  IconButton,
  Button,
  Checkbox,
  FormControlLabel,
  Divider
} from "@mui/material"
import { TimePicker } from "@mui/x-date-pickers"
import DeleteIcon from "@mui/icons-material/Delete"
import { formatToTime } from "../../../utils/dateUtils"
import { ControlPlusProps } from "../stepInterface"

export const OpeningHoursForm: React.FC<ControlPlusProps> = ({ control, setValue }) => {
  const daysOfWeek = [
    "Poniedziałek",
    "Wtorek",
    "Środa",
    "Czwartek",
    "Piątek",
    "Sobota",
    "Niedziela"
  ]

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "base.occurrence.openingHours"
  })

  const watchedHours = useWatch({ control, name: "base.occurrence.openingHours" })
  const is24h = Array.isArray(watchedHours) && watchedHours.length === 0

  return (
    <Grid container spacing={2}>
      <Grid size={12}>
        <FormControlLabel
          control={
            <Checkbox
              checked={is24h}
              onChange={e => {
                if (e.target.checked) {
                  setValue("base.occurrence.openingHours", [])
                  replace([])
                } else {
                  if (fields.length === 0) {
                    append({ day: 0, open: "08:00:00", close: "16:00:00" })
                  }
                }
              }}
            />
          }
          label="Całodobowo"
        />
      </Grid>
      {fields.map((field, index) => (
        <Grid
          size={12}
          container
          spacing={2}
          alignItems="center"
          justifyContent="space-between"
          key={field.id}
        >
          <Grid size={{ xs: 12, sm: 3 }}>
            <Controller
              name={`base.occurrence.openingHours.${index}.day`}
              control={control}
              rules={{ required: "Dzień jest wymagany" }}
              render={({ field: ctrlField, fieldState: { error } }) => (
                <FormControl fullWidth error={!!error}>
                  <InputLabel>Dzień</InputLabel>
                  <Select {...ctrlField} label="Dzień">
                    {daysOfWeek.map((day, i) => (
                      <MenuItem
                        disabled={
                          Array.isArray(watchedHours) &&
                          watchedHours.some((h, idx) => h?.day === i && idx !== index)
                        }
                        key={i}
                        value={i}
                      >
                        {day}
                      </MenuItem>
                    ))}
                  </Select>
                  {error && <FormHelperText>{error.message}</FormHelperText>}
                </FormControl>
              )}
            />
          </Grid>
          <Grid size={{ xs: 5, sm: 3 }}>
            <Controller
              name={`base.occurrence.openingHours.${index}.open`}
              control={control}
              rules={{ required: "Godzina otwarcia jest wymagana" }}
              render={({ field: ctrlField }) => (
                <TimePicker
                  format="HH:mm"
                  label="Otwarcie"
                  sx={{ maxWidth: "100%" }}
                  value={ctrlField.value ? new Date("1970-01-01T" + ctrlField.value) : undefined}
                  onChange={newValue =>
                    ctrlField.onChange(newValue ? formatToTime(newValue) : undefined)
                  }
                />
              )}
            />
          </Grid>
          <Controller
            name={`base.occurrence.openingHours.${index}.close`}
            control={control}
            rules={{ required: "Godzina zamknięcia jest wymagana" }}
            render={({ field: ctrlField }) => (
              <Grid size={{ xs: 5, sm: 3 }}>
                <TimePicker
                  format="HH:mm"
                  label="Zamknięcie"
                  sx={{ maxWidth: "100%" }}
                  value={ctrlField.value ? new Date("1970-01-01T" + ctrlField.value) : undefined}
                  onChange={newValue =>
                    ctrlField.onChange(newValue ? formatToTime(newValue) : undefined)
                  }
                />
              </Grid>
            )}
          />
          <Grid size={{ xs: 2, sm: 1 }}>
            <IconButton onClick={() => remove(index)} color="error" disabled={fields.length <= 1}>
              <DeleteIcon />
            </IconButton>
          </Grid>
          <Divider orientation="horizontal" style={{ width: "100%" }} />
        </Grid>
      ))}
      <Grid size={12}>
        <Button
          onClick={() =>
            append({ day: undefined as unknown as number, open: "08:00:00", close: "16:00:00" })
          }
          disabled={fields.length >= 7}
        >
          + Dodaj godziny otwarcia
        </Button>
      </Grid>
    </Grid>
  )
}
