"use client"

import { Box, Chip } from "@mui/material"
import { useNavigation } from "components/navigationProvider/navigationProvider"
import { usePathname } from "next/navigation"
import {
  type GetActivitiesQuery,
  OccurrenceType,
  OccurrenceTypeLabel,
  RegistrationType,
  SportActivityType,
  SportAdvancementLevel
} from "models/domainDtos"
import type { TagDto } from "models/dtos/tagDto"
import {
  DEFAULT_OCCURENCE_RANGE,
  OccurrenceDateRangeDto,
  OccurrenceDateRangeDtoLabel
} from "models/OccurrenceDateRangeDto"
import { updateUrlWithQuery } from "models/services/filters.service"

interface ActiveFilterItem {
  id: string
  label: string
  onDelete: () => void
}

interface ActiveFiltersProps {
  query: GetActivitiesQuery
  tags?: TagDto[]
  onQueryChange?: (q: GetActivitiesQuery) => void
}

const registrationLabels = {
  [RegistrationType.Needed]: "Wymagana rejestracja",
  [RegistrationType.NotNeeded]: "Bez rejestracji"
}

const sportTypeLabels = {
  [SportActivityType.Group]: "Sport zespołowy",
  [SportActivityType.Individual]: "Sport indywidualny",
  [SportActivityType.Couples]: "Sport parami"
}

const levelLabels = {
  [SportAdvancementLevel.Beginner]: "Poziom: początkujący",
  [SportAdvancementLevel.Intermediate]: "Poziom: średniozaawansowany",
  [SportAdvancementLevel.Advanced]: "Poziom: zaawansowany"
}

export function ActiveFilters({ query, tags = [], onQueryChange }: ActiveFiltersProps) {
  const { replace } = useNavigation()
  const pathname = usePathname()

  const navigateWithQuery = (nextQuery: GetActivitiesQuery) => {
    if (onQueryChange) {
      onQueryChange(nextQuery)
      return
    }
    updateUrlWithQuery({
      pathname,
      query: nextQuery,
      navigate: replace
    })
  }

  const activeFilters: ActiveFilterItem[] = []

  if (query.searchTerm && query.searchTerm.length >= 3) {
    activeFilters.push({
      id: "search-term",
      label: `Nazwa: ${query.searchTerm}`,
      onDelete: () => navigateWithQuery({ ...query, searchTerm: undefined })
    })
  }

  if (query.dateRange) {
    const dateLabel =
      query.dateRange !== OccurrenceDateRangeDto.CustomDates
        ? OccurrenceDateRangeDtoLabel[query.dateRange]
        : `${query.customDateRange?.start ?? ""}${query.customDateRange?.end ? ` - ${query.customDateRange.end}` : ""}`

    activeFilters.push({
      id: "date-range",
      label: `Termin: ${dateLabel}`,
      onDelete: () =>
        navigateWithQuery({
          ...query,
          dateRange: DEFAULT_OCCURENCE_RANGE,
          customDateRange: undefined
        })
    })
  }

  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    const priceLabel =
      query.minPrice !== undefined && query.maxPrice !== undefined
        ? `Cena: ${query.minPrice}zł - ${query.maxPrice}zł`
        : query.minPrice !== undefined
          ? `Cena od: ${query.minPrice}zł`
          : `Cena do: ${query.maxPrice}zł`

    activeFilters.push({
      id: "price-range",
      label: priceLabel,
      onDelete: () => navigateWithQuery({ ...query, minPrice: undefined, maxPrice: undefined })
    })
  }

  if (query.occurrenceType && query.occurrenceType !== OccurrenceType.Both) {
    activeFilters.push({
      id: "occurrence-type",
      label: `Typ: ${OccurrenceTypeLabel[query.occurrenceType] ?? query.occurrenceType}`,
      onDelete: () => navigateWithQuery({ ...query, occurrenceType: OccurrenceType.Both })
    })
  }

  if (query.registration) {
    activeFilters.push({
      id: "registration",
      label: registrationLabels[query.registration],
      onDelete: () => navigateWithQuery({ ...query, registration: undefined })
    })
  }

  if (query.maxDuration !== undefined) {
    activeFilters.push({
      id: "max-duration",
      label: `Czas trwania do: ${query.maxDuration}h`,
      onDelete: () => navigateWithQuery({ ...query, maxDuration: undefined })
    })
  }

  if (query.sportFilters?.type) {
    activeFilters.push({
      id: "sport-type",
      label: sportTypeLabels[query.sportFilters.type],
      onDelete: () =>
        navigateWithQuery({
          ...query,
          sportFilters: {
            ...query.sportFilters,
            type: undefined
          }
        })
    })
  }

  if (query.sportFilters?.level) {
    activeFilters.push({
      id: "sport-level",
      label: levelLabels[query.sportFilters.level],
      onDelete: () =>
        navigateWithQuery({
          ...query,
          sportFilters: {
            ...query.sportFilters,
            level: undefined
          }
        })
    })
  }

  if (query.kidsFilters?.minAge !== undefined || query.kidsFilters?.maxAge !== undefined) {
    const ageLabel =
      query.kidsFilters.minAge !== undefined && query.kidsFilters.maxAge !== undefined
        ? `Wiek: ${query.kidsFilters.minAge} - ${query.kidsFilters.maxAge} lat`
        : query.kidsFilters.minAge !== undefined
          ? `Wiek od: ${query.kidsFilters.minAge} lat`
          : `Wiek do: ${query.kidsFilters.maxAge} lat`

    activeFilters.push({
      id: "kids-age-range",
      label: ageLabel,
      onDelete: () =>
        navigateWithQuery({
          ...query,
          kidsFilters: {
            ...query.kidsFilters,
            minAge: undefined,
            maxAge: undefined
          }
        })
    })
  }

  if (query.kidsFilters?.age !== undefined) {
    activeFilters.push({
      id: "kids-age",
      label: `Wiek dziecka: ${query.kidsFilters.age} lat`,
      onDelete: () =>
        navigateWithQuery({
          ...query,
          kidsFilters: {
            ...query.kidsFilters,
            age: undefined
          }
        })
    })
  }

  if (query.kidsFilters?.babysitting) {
    activeFilters.push({
      id: "kids-babysitting",
      label: "Z opieką",
      onDelete: () =>
        navigateWithQuery({
          ...query,
          kidsFilters: {
            ...query.kidsFilters,
            babysitting: undefined
          }
        })
    })
  }

  if (query.tagIds && query.tagIds.length > 0) {
    for (const tagId of query.tagIds) {
      const tagName = tags.find(t => String(t.id) === String(tagId))?.name ?? tagId
      activeFilters.push({
        id: `tag-${tagId}`,
        label: tagName,
        onDelete: () => {
          const next = query.tagIds!.filter(id => id !== tagId)
          navigateWithQuery({ ...query, tagIds: next.length > 0 ? next : undefined })
        }
      })
    }
  }

  if (activeFilters.length === 0) {
    return null
  }

  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
      {activeFilters.map(filter => (
        <Chip
          key={filter.id}
          label={filter.label}
          onDelete={filter.onDelete}
          size="small"
          variant="outlined"
        />
      ))}
    </Box>
  )
}
