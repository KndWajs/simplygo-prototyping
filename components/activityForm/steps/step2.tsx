"use client"

import {
  Box,
  Checkbox,
  CircularProgress,
  Divider,
  FormControlLabel,
  Grid,
  TextField,
  Typography
} from "@mui/material"
import React from "react"
import { Controller, SubmitHandler, useForm } from "react-hook-form"
import { QueryActivityDto, UserType } from "../../../models/domainDtos"
import { StepInterface } from "../stepInterface"
import { StepTemplate } from "../stepTemplate"

export const Step2: React.FC<StepInterface> = ({
  activity,
  submitButton,
  cancelButton,
  loading
}) => {
  const {
    handleSubmit,
    control,
    getValues,
    setValue,
    watch,
    formState: { isValid }
  } = useForm<QueryActivityDto>({
    defaultValues: activity,
    mode: "onChange"
  })

  const onSubmit: SubmitHandler<QueryActivityDto> = data => {
    submitButton.action(data)
  }

  return (
    <StepTemplate
      onSubmit={handleSubmit(d => onSubmit(d))}
      onCancel={() => cancelButton?.action(getValues())}
      submitDisabled={!isValid}
      okText={submitButton.name}
      cancelText={cancelButton?.name}
      progressValue={15}
    >
      <Box sx={{ px: { xs: 2, md: 3 } }}>
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
            <CircularProgress />
          </Box>
        )}
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
          Napisz co{" "}
          <Box component="span" sx={{ color: "#ff6b35" }}>
            będzie się działo
          </Box>
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
        >
          po tym etapie jeszcze niecała minuta!
        </Typography>
      </Box>
      <Grid
        container
        spacing={3}
        sx={{ maxWidth: "750px", display: "flex", justifyContent: "center", margin: "0 auto" }}
      >
        <Grid size={12}>
          <Controller
            name="base.title"
            control={control}
            rules={{
              required: "Tytuł jest wymagany",
              minLength: {
                value: 20,
                message: "Tytuł musi mieć co najmniej 20 znaków"
              },
              maxLength: {
                value: 110,
                message: "Tytuł nie może być dłuższy niż 110 znaków"
              }
            }}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                label="Tytuł (Wymagane)"
                fullWidth
                slotProps={{
                  htmlInput: { maxLength: 110 }
                }}
                error={!!error}
                helperText={error?.message}
              />
            )}
          />
        </Grid>
        <Grid size={12}>
          <Controller
            name="base.description"
            control={control}
            rules={{
              required: "Opis jest wymagany",
              minLength: {
                value: 80,
                message: "Opis musi mieć co najmniej 80 znaków"
              },
              maxLength: {
                value: 2000,
                message: "Opis nie może być dłuższy niż 2000 znaków"
              }
            }}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                label="Opis (Wymagane)"
                fullWidth
                multiline
                rows={6}
                slotProps={{
                  htmlInput: { maxLength: 10000 }
                }}
                error={!!error}
                helperText={error?.message}
              />
            )}
          />
        </Grid>
        <Grid size={12}>
          <Controller
            name="base.website"
            control={control}
            rules={{
              maxLength: {
                value: 350,
                message: "Adres internetowy nie może być dłuższy niż 350 znaków"
              }
            }}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                label="Strona internetowa"
                fullWidth
                slotProps={{
                  htmlInput: { maxLength: 350 }
                }}
                error={!!error}
                helperText={error?.message}
              />
            )}
          />
        </Grid>
        <Grid size={12}>
          <Divider textAlign="center">
            <Typography variant="h6">
              <Controller
                name="base.userType"
                control={control}
                defaultValue={UserType.Promotor}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={field.value === UserType.Organizer}
                        onChange={e => {
                          if (!e.target.checked) {
                            setValue("base.contactInfo.phoneNumber", "")
                            setValue("base.contactInfo.email", "")
                          }
                          field.onChange(e.target.checked ? UserType.Organizer : UserType.Promotor)
                        }}
                      />
                    }
                    label={<Typography variant="body1">Jestem organizatorem</Typography>}
                  />
                )}
              />
            </Typography>
          </Divider>
        </Grid>

        {watch("base.userType") === UserType.Organizer && (
          <>
            <Grid size={12}>
              <Controller
                name="base.contactInfo.phoneNumber"
                control={control}
                rules={{
                  required:
                    watch("base.userType") === UserType.Organizer
                      ? "Numer telefonu jest wymagany"
                      : false
                }}
                defaultValue=""
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    label="Numer telefonu (Wymagane)"
                    fullWidth
                    error={!!error}
                    helperText={error?.message}
                  />
                )}
              />
            </Grid>

            <Grid size={12}>
              <Controller
                name="base.contactInfo.email"
                control={control}
                rules={{
                  required:
                    watch("base.userType") === UserType.Organizer ? "Email jest wymagany" : false,
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Nieprawidłowy adres email"
                  }
                }}
                defaultValue=""
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    label="Email (Wymagane)"
                    fullWidth
                    error={!!error}
                    helperText={error?.message}
                  />
                )}
              />
            </Grid>
          </>
        )}
      </Grid>
    </StepTemplate>
  )
}
