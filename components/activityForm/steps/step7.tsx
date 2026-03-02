"use client"

import { Box, Card, CircularProgress, Divider, Grid, TextField, Typography } from "@mui/material"
import React, { useEffect } from "react"
import { Controller, SubmitHandler, useForm } from "react-hook-form"
import { useAuth0 } from "@auth0/auth0-react"
import { QueryActivityDto, QueryOccurrenceDateDto } from "../../../models/domainDtos"
import { getDates } from "../../../models/services/activities.service"
import { StepInterface } from "../stepInterface"
import { StepTemplate } from "../stepTemplate"

const KIDS_ID = "3"

export const Step7: React.FC<StepInterface> = ({ activity, submitButton, cancelButton }) => {
  const { getAccessTokenSilently } = useAuth0()
  const [loadingDates, setLoadingDates] = React.useState(false)
  const [dates, setDates] = React.useState<QueryOccurrenceDateDto[]>([])

  const {
    handleSubmit,
    control,
    formState: { isValid }
  } = useForm<QueryActivityDto>({
    defaultValues: activity,
    mode: "onChange"
  })

  useEffect(() => {
    const fetchDates = async () => {
      setLoadingDates(true)
      try {
        const token = await getAccessTokenSilently()
        const result = await getDates(activity.base.occurrence, token)
        setDates(result)
      } catch (e) {
        console.error(e)
      } finally {
        setLoadingDates(false)
      }
    }
    fetchDates()
  }, [activity.base.occurrence, getAccessTokenSilently])

  const onSubmit: SubmitHandler<QueryActivityDto> = data => {
    submitButton.action(data)
  }

  return (
    <StepTemplate
      onSubmit={handleSubmit(d => onSubmit(d))}
      onCancel={() => cancelButton?.action(activity)}
      submitDisabled={!isValid}
      okText={submitButton.name}
      cancelText={cancelButton?.name}
      progressValue={100}
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
          Zerknij czy wszystko się zgadza
          <br />
          <Box component="span" sx={{ color: "#ff6b35" }}>
            i koniec :)
          </Box>
        </Typography>

        <Typography
          variant="body2"
          className="no-select"
          sx={{
            fontSize: { xs: "1rem", sm: "1.125rem" },
            color: "#a1a1aa",
            mb: { xs: "24px", md: "32px" },
            fontWeight: 300
          }}
        />
      </Box>
      <Grid container size={{ xs: 12, md: 6 }} spacing={2}>
        {activity.categories?.some(c => c.mainCategory === KIDS_ID) && (
          <>
            <Grid size={12}>
              <Divider textAlign="center">
                <Typography variant="body1">Dodatkowe informacje o zajęciach dla dzieci</Typography>
              </Divider>
            </Grid>

            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", px: { xs: 2, md: 3 } }}>
              <Box sx={{ minWidth: "150px", maxWidth: "300px" }}>
                <Controller
                  name="kids.minAge"
                  control={control}
                  rules={{
                    required: "Minimalny wiek jest wymagany",
                    min: {
                      value: 0,
                      message: "Minimalny wiek nie może być mniejszy niż 0"
                    },
                    max: {
                      value: 18,
                      message: "Minimalny wiek nie może być większy niż 18"
                    },
                    validate: (value, formValues) => {
                      const maxAge = formValues.kids?.maxAge
                      // @ts-ignore
                      return !maxAge || parseInt(value) <= maxAge
                        ? undefined
                        : "Maksymalny wiek musi być większy lub równy minimalnemu"
                    }
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      label="Minimalny wiek"
                      onChange={e => field.onChange(e.target.value)}
                      type="number"
                      fullWidth
                      error={!!error}
                      helperText={error?.message}
                      slotProps={{ htmlInput: { min: 0, max: 18 } }}
                    />
                  )}
                />
              </Box>

              <Box sx={{ minWidth: "150px", maxWidth: "300px" }}>
                <Controller
                  name="kids.maxAge"
                  control={control}
                  rules={{
                    required: "Maksymalny wiek jest wymagany",
                    min: {
                      value: 0,
                      message: "Maksymalny wiek nie może być mniejszy niż 0"
                    },
                    max: {
                      value: 18,
                      message: "Maksymalny wiek nie może być większy niż 18"
                    },
                    validate: (value, formValues) => {
                      const minAge = formValues.kids?.minAge
                      // @ts-ignore
                      return !minAge || parseInt(value) >= minAge
                        ? undefined
                        : "Maksymalny wiek musi być większy lub równy minimalnemu"
                    }
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      label="Maksymalny wiek"
                      type="number"
                      fullWidth
                      error={!!error}
                      helperText={error?.message}
                      slotProps={{ htmlInput: { min: 0, max: 18 } }}
                    />
                  )}
                />
              </Box>
            </Box>
          </>
        )}
      </Grid>

      <Card sx={{ mt: 4, mb: 1, minHeight: "400px", width: "100%", maxWidth: "800px" }}>
        <Divider sx={{ mt: 1, mb: 1, px: 2 }}>
          <Typography variant="h6">Podgląd</Typography>
        </Divider>
        {loadingDates ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ p: 2 }}>
            <Typography variant="h5" gutterBottom>
              {activity.base.title}
            </Typography>
            <Typography variant="body1" sx={{ mb: 2, whiteSpace: "pre-wrap" }}>
              {activity.base.description}
            </Typography>
            <Divider sx={{ my: 1 }} />
            <Typography variant="body2" color="text.secondary">
              Adres: {activity.base.address.streetAddress}
            </Typography>
            {activity.base.website && (
              <Typography variant="body2" color="text.secondary">
                Strona: {activity.base.website}
              </Typography>
            )}
            {activity.photos && activity.photos[0] && (
              <Box sx={{ mt: 2, maxWidth: "300px" }}>
                <img
                  src={
                    activity.photos[0].url ||
                    (activity.photos[0].file
                      ? URL.createObjectURL(activity.photos[0].file)
                      : undefined)
                  }
                  alt="Zdjęcie aktywności"
                  style={{ width: "100%", borderRadius: "8px", objectFit: "cover" }}
                />
              </Box>
            )}
            {dates.length > 0 && (
              <>
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Terminy:
                </Typography>
                {dates.slice(0, 5).map((d, i) => (
                  <Typography key={i} variant="body2">
                    {new Date(d.start).toLocaleString("pl-PL")} —{" "}
                    {new Date(d.end).toLocaleString("pl-PL")}
                  </Typography>
                ))}
                {dates.length > 5 && (
                  <Typography variant="body2" color="text.secondary">
                    ...i {dates.length - 5} więcej
                  </Typography>
                )}
              </>
            )}
            {activity.categories && activity.categories.length > 0 && (
              <>
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle2">
                  Kategorie: {activity.categories.map(c => c.label).join(", ")}
                </Typography>
              </>
            )}
          </Box>
        )}
      </Card>
    </StepTemplate>
  )
}
