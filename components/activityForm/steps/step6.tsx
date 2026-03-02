"use client"

import {
  Box,
  Button,
  Checkbox,
  Chip,
  Divider,
  FormControlLabel,
  Grid,
  Radio,
  RadioGroup,
  Stack,
  Typography
} from "@mui/material"
import React, { useEffect } from "react"
import { Controller, Resolver, useForm, useWatch } from "react-hook-form"
import { QueryActivityDto } from "../../../models/domainDtos"
import { CategoryDto } from "../../../models/dtos/GetCategoriesQueryResponse"
import { isEventActivity, isKidsActivity, isSportActivity } from "../../../utils/activityUtils"
import { CategoryModal } from "./categoryModal"
import { StepInterface } from "../stepInterface"
import { StepTemplate } from "../stepTemplate"

const EVENTS_ID = "1"
const SPORT_ID = "2"
const KIDS_ID = "3"

type Step6FormValues = {
  audience: "adults" | "all" | "kids"
  sportEvent: boolean
  event: string[]
  sport: string[]
  kids: string[]
  tag: string
}

interface Step6Props extends StepInterface {
  categories?: CategoryDto[]
}

export const Step6: React.FC<Step6Props> = ({
  activity,
  submitButton,
  cancelButton,
  metadata,
  categories
}) => {
  const [openCategoryModal, setOpenCategoryModal] = React.useState(false)
  const [changeCategory, setChangeCategory] = React.useState(false)

  const getFlatCategories = (cats?: CategoryDto[]): CategoryDto[] => {
    if (!cats) return []
    const flat: CategoryDto[] = []
    const walk = (nodes: CategoryDto[]) => {
      for (const n of nodes) {
        flat.push(n)
        if (n.children) walk(n.children)
      }
    }
    walk(cats)
    return flat
  }

  const flatCategories = getFlatCategories(categories)

  const resolver: Resolver<Step6FormValues> = async value => {
    const total = value.event.length + value.sport.length + value.kids.length

    const errors: any = {}
    if (total === 0) {
      errors.audience = {
        type: "required",
        message: "Podaj przynajmniej jedną kategorię"
      }
    } else if (total > 6) {
      errors.audience = {
        type: "max",
        message: "Maksymalnie trzy kategorie"
      }
    }
    if (value.audience === "kids" && (value.event.length > 0 || value.sport.length > 0)) {
      errors.audience = {
        type: "required",
        message: "Kategorie dla dorosłych niedostępne"
      }
    }
    if (value.audience === "adults" && value.kids.length > 0) {
      errors.audience = {
        type: "required",
        message: "Kategoria dla dzieci niedostępna"
      }
    }
    if (!value.sportEvent && value.sport.length > 0) {
      errors.audience = {
        type: "required",
        message: "Kategorie sportowe niedostępne"
      }
    }
    if (value.sportEvent && value.event.length > 0) {
      errors.audience = {
        type: "required",
        message: "Kategorie rozrywkowe niedostępne"
      }
    }

    const eventDisabled = value.audience === "kids" || value.sportEvent
    const sportDisabled = value.audience === "kids" || !value.sportEvent
    const kidsDisabled = value.audience === "adults"

    const missing: string[] = []
    if (!eventDisabled && value.event.length === 0) missing.push("rozrywce")
    if (!sportDisabled && value.sport.length === 0) missing.push("sporcie")
    if (!kidsDisabled && value.kids.length === 0) missing.push("aktywnościach dla dzieci")

    if (!errors.audience && missing.length > 0) {
      errors.audience = {
        type: "required",
        message: `Wybierz przynajmniej jedną kategorię w ${missing.join(", ")}`
      }
    }

    return { values: value, errors }
  }

  const getDefaultValues = (activity: QueryActivityDto): Step6FormValues => {
    if (
      !activity.categories &&
      !activity.base.categoryIds &&
      metadata &&
      metadata.categoryIds &&
      metadata.categoryIds.length > 0
    ) {
      const cats = metadata.categoryIds.map(id => id + "")
      activity.base.categoryIds = cats
      activity.categories = flatCategories.filter(act => cats.includes(act.id || ""))
    }

    const hasKids = isKidsActivity(activity)
    const hasEvent = isEventActivity(activity)
    const hasSport = isSportActivity(activity)

    let audience: Step6FormValues["audience"] = "adults"
    if (hasKids && (hasEvent || hasSport)) audience = "all"
    else if (hasKids) audience = "kids"

    return {
      audience,
      sportEvent: hasSport,
      event: activity.categories?.filter(c => c.mainCategory === EVENTS_ID).map(c => c.id) || [],
      sport: activity.categories?.filter(c => c.mainCategory === SPORT_ID).map(c => c.id) || [],
      kids: activity.categories?.filter(c => c.mainCategory === KIDS_ID).map(c => c.id) || [],
      tag: activity.base.tags || ""
    }
  }

  const {
    handleSubmit,
    control,
    formState: { isValid, errors },
    watch,
    setValue,
    trigger
  } = useForm<Step6FormValues>({
    mode: "onChange",
    resolver,
    defaultValues: getDefaultValues(activity)
  })

  const audience = watch("audience")
  const sportEvent = watch("sportEvent")
  const eventSubs = useWatch({ control, name: "event" }) || []
  const sportSubs = useWatch({ control, name: "sport" }) || []
  const kidsSubs = useWatch({ control, name: "kids" }) || []

  const onSubmit = (data: Step6FormValues) => {
    const newActivity = { ...activity } as QueryActivityDto
    newActivity.base = { ...newActivity.base, tags: data.tag }
    newActivity.event = undefined
    newActivity.base.categoryIds = [...new Set([...eventSubs, ...sportSubs, ...kidsSubs])]
    newActivity.categories = newActivity.base.categoryIds
      .map(id => flatCategories.find(c => c.id === id))
      .filter((c): c is CategoryDto => !!c)

    submitButton.action(newActivity)
  }

  useEffect(() => {
    if (sportEvent) {
      setValue("event", [], { shouldValidate: true })
    }
  }, [sportEvent, setValue])

  useEffect(() => {
    if (!openCategoryModal) {
      trigger()
    }
  }, [openCategoryModal, trigger])

  return (
    <StepTemplate
      onSubmit={handleSubmit(d => onSubmit(d))}
      onCancel={() => cancelButton?.action(activity)}
      submitDisabled={!isValid}
      okText={submitButton.name}
      cancelText={cancelButton?.name}
      progressValue={95}
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
          Zatwierdź kategorie
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
          ...i to już prawie koniec!
        </Typography>
      </Box>
      <Grid container spacing={2} sx={{ maxWidth: "750px", px: "16px" }}>
        <Typography
          variant="body2"
          style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}
        >
          {eventSubs && eventSubs.length > 0 && <span>Wydarzenia: </span>}
          {eventSubs &&
            eventSubs.length > 0 &&
            eventSubs.map(sub => (
              <Chip size="small" key={sub} label={flatCategories.find(c => c.id === sub)?.label} />
            ))}
          {sportSubs && sportSubs.length > 0 && <span>Sport: </span>}
          {sportSubs &&
            sportSubs.length > 0 &&
            sportSubs.map(sub => (
              <Chip size="small" key={sub} label={flatCategories.find(c => c.id === sub)?.label} />
            ))}
          {kidsSubs && kidsSubs.length > 0 && <span>Dzieci: </span>}
          {kidsSubs &&
            kidsSubs.length > 0 &&
            kidsSubs.map(sub => (
              <Chip size="small" key={sub} label={flatCategories.find(c => c.id === sub)?.label} />
            ))}
          {(!kidsSubs || kidsSubs.length == 0) &&
            (!sportSubs || sportSubs.length == 0) &&
            (!eventSubs || eventSubs.length == 0) && <span>Brak wybranych kategorii</span>}
        </Typography>
        <Divider sx={{ my: 2, width: "100%" }} />
        <Typography
          variant="body1"
          sx={{ cursor: "pointer", color: "info.main", ml: 1 }}
          onClick={() => setChangeCategory(!changeCategory)}
        >
          {changeCategory ? "Ukryj zmiany kategorii" : "Chcesz zmienić kategorie?"}
        </Typography>

        {changeCategory && (
          <>
            <Grid size={12}>
              Kto jest <b>głównym odbiorcą</b> Twojej aktywności?
              <Controller
                name="audience"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <RadioGroup
                    row={false}
                    value={value}
                    onChange={e => {
                      const val = e.target.value as Step6FormValues["audience"]
                      onChange(val)
                      if (val === "kids") {
                        setValue("event", [], { shouldValidate: false })
                        setValue("sport", [], { shouldValidate: false })
                        setValue("sportEvent", false, { shouldValidate: false })
                      } else if (val === "adults") {
                        setValue("kids", [], { shouldValidate: false })
                      }
                      trigger()
                    }}
                  >
                    <FormControlLabel value="kids" control={<Radio />} label="Dzieci" />
                    <FormControlLabel value="adults" control={<Radio />} label="Dorośli" />
                    <FormControlLabel value="all" control={<Radio />} label="Dorośli i dzieci" />
                  </RadioGroup>
                )}
              />
            </Grid>
            <Grid size={12}>
              <Controller
                name="sportEvent"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        disabled={audience === "kids"}
                        checked={!!value}
                        onChange={e => {
                          const val = e.target.checked
                          onChange(val)
                          if (!val) {
                            setValue("sport", [], { shouldValidate: false })
                          } else {
                            setValue("event", [], { shouldValidate: false })
                          }
                          trigger()
                        }}
                      />
                    }
                    label="Aktywność związana ze sportem"
                  />
                )}
              />
            </Grid>
            <CategoryModal
              control={control}
              open={openCategoryModal}
              setOpen={setOpenCategoryModal}
              categories={categories || []}
            />

            <Stack direction="column" spacing={1} alignItems="flex-start" width="100%">
              {errors.audience && (
                <Typography variant="caption" style={{ color: "red", marginLeft: 8 }}>
                  {errors.audience.message}
                </Typography>
              )}
              <Button
                variant={isValid ? "outlined" : "contained"}
                onClick={() => setOpenCategoryModal(true)}
                sx={{ alignSelf: "flex-start" }}
              >
                {isValid ? "Edytuj kategorie" : "Wybierz kategorie"}
              </Button>
            </Stack>
          </>
        )}
      </Grid>
    </StepTemplate>
  )
}
