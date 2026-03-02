"use client"

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  FormControl,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  type SelectChangeEvent
} from "@mui/material"
import CloseIcon from "@mui/icons-material/Close"
import EventBorder from "@mui/icons-material/Event"
import FavoriteIcon from "@mui/icons-material/Favorite"
import HomeBorder from "@mui/icons-material/Deck"
import LoopIcon from "@mui/icons-material/Loop"
import SearchIcon from "@mui/icons-material/Search"
import React, { useMemo, useState } from "react"
import { ActiveFilters } from "components/activeFilters/activeFilters"
import { CategoryPicker } from "components/filters/categoryPicker"
import { TagsPicker } from "components/filters/tagsPicker"
import { type GetActivitiesQuery, OccurrenceType, OccurrenceTypeLabel } from "models/domainDtos"
import type { CategoryDto } from "models/dtos/GetCategoriesQueryResponse"
import type { TagDto } from "models/dtos/tagDto"
import { getWithChildren } from "utils/categoriesUtils"
import {
  OccurrenceDateRangeDto,
  OccurrenceDateRangeDtoArray,
  OccurrenceDateRangeDtoLabel
} from "models/OccurrenceDateRangeDto"
import { updateUrlWithQuery } from "models/services/filters.service"
import { useNavigation } from "components/navigationProvider/navigationProvider"
import { usePathname } from "next/navigation"

interface FiltersProps {
  query: GetActivitiesQuery
  categories?: CategoryDto[]
  tags?: TagDto[]
  hidePlaceEvent?: boolean
  onQueryChange?: (q: GetActivitiesQuery) => void
}

const KIDS_ID = "3"

export function Filters({ query, categories, tags, onQueryChange }: FiltersProps) {
  const { replace } = useNavigation()
  const pathname = usePathname()
  const [openCustomDateDialog, setOpenCustomDateDialog] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState(query.searchTerm ?? "")
  const [customDateStart, setCustomDateStart] = React.useState(query.customDateRange?.start ?? "")
  const [customDateEnd, setCustomDateEnd] = React.useState(query.customDateRange?.end ?? "")
  const [kidsAge, setKidsAge] = useState(query.kidsFilters?.age?.toString() ?? "")

  const occurrenceOptions = useMemo(
    () =>
      (Object.keys(OccurrenceTypeLabel) as OccurrenceType[]).filter(
        k => k !== OccurrenceType.Both && k !== OccurrenceType.Places
      ),
    []
  )

  const hasKidsCategory = useMemo(() => {
    if (!categories?.length) return false
    const kidsIds = getWithChildren(categories, [KIDS_ID])
    const selected = query.categoryIds ?? [KIDS_ID]
    return selected.some(id => kidsIds.includes(id))
  }, [categories, query.categoryIds])

  const applyAgeFilter = () => {
    const age = kidsAge ? parseInt(kidsAge, 10) : undefined
    if (age === query.kidsFilters?.age) return
    navigateWithQuery({
      ...query,
      kidsFilters: {
        ...query.kidsFilters,
        age: age !== undefined && Number.isFinite(age) ? age : undefined
      }
    })
  }

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

  const applySearchTerm = () => {
    const trimmed = searchTerm.trim()

    if (trimmed.length > 0 && trimmed.length < 3) {
      return
    }

    navigateWithQuery({
      ...query,
      searchTerm: trimmed ? trimmed : undefined
    })
  }

  const handleDateRangeChange = (event: SelectChangeEvent<OccurrenceDateRangeDto>) => {
    const value = event.target.value as OccurrenceDateRangeDto

    if (value === OccurrenceDateRangeDto.CustomDates) {
      setOpenCustomDateDialog(true)
      return
    }

    navigateWithQuery({
      ...query,
      dateRange: value,
      customDateRange: undefined
    })
  }

  const handleOccurrenceTypeChange = (event: SelectChangeEvent<string>) => {
    navigateWithQuery({
      ...query,
      occurrenceType: event.target.value as OccurrenceType
    })
  }

  const confirmCustomDates = () => {
    if (!customDateStart || !customDateEnd) {
      return
    }

    navigateWithQuery({
      ...query,
      dateRange: OccurrenceDateRangeDto.CustomDates,
      customDateRange: {
        start: customDateStart,
        end: customDateEnd
      }
    })

    setOpenCustomDateDialog(false)
  }

  return (
    <Box sx={{ width: "100%", maxWidth: 300 }}>
      <TextField
        sx={{ mt: 2, mb: 2 }}
        label="Szukaj po nazwie"
        size="small"
        variant="outlined"
        value={searchTerm}
        fullWidth
        onChange={event => setSearchTerm(event.target.value)}
        onBlur={applySearchTerm}
        onKeyDown={event => {
          if (event.key === "Enter") {
            event.preventDefault()
            applySearchTerm()
            ;(event.target as HTMLInputElement).blur()
          }
        }}
        helperText={
          searchTerm && searchTerm.length > 0 && searchTerm.length < 3
            ? "Wpisz minimum 3 znaki"
            : ""
        }
        InputProps={{
          endAdornment: searchTerm ? (
            <InputAdornment position="end">
              {searchTerm.length >= 3 ? (
                <IconButton size="small" onClick={applySearchTerm} sx={{ mr: 0.5 }}>
                  <SearchIcon />
                </IconButton>
              ) : null}
              <IconButton
                size="small"
                onClick={() => {
                  setSearchTerm("")
                  navigateWithQuery({ ...query, searchTerm: undefined })
                }}
              >
                <CloseIcon />
              </IconButton>
            </InputAdornment>
          ) : undefined
        }}
      />

      <Divider sx={{ mb: 1 }}>
        <Typography variant="subtitle2" textAlign="center">
          Czas
        </Typography>
      </Divider>
      <FormControl size="small" fullWidth sx={{ mb: 2 }}>
        <Select value={query.dateRange} onChange={handleDateRangeChange}>
          {OccurrenceDateRangeDtoArray.map(item => (
            <MenuItem key={item} value={item}>
              {OccurrenceDateRangeDtoLabel[item]}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Divider sx={{ mb: 1 }}>
        <Typography variant="subtitle2" textAlign="center">
          Wybierz typ
        </Typography>
      </Divider>
      <FormControl size="small" fullWidth>
        <Select value={query.occurrenceType ?? OccurrenceType.Both} onChange={handleOccurrenceTypeChange}>
          <MenuItem value={OccurrenceType.Both}>
            <Stack direction="row" alignItems="center">
              <FavoriteIcon fontSize="small" sx={{ mr: 1 }} />
              Wszystko
            </Stack>
          </MenuItem>
          {occurrenceOptions.map(item => (
            <MenuItem key={item} value={item}>
              <Stack direction="row" alignItems="center">
                {item === OccurrenceType.OpeningHours ? (
                  <HomeBorder fontSize="small" sx={{ mr: 1 }} />
                ) : null}
                {item === OccurrenceType.Single ||
                item === OccurrenceType.Events ||
                item === OccurrenceType.Repetitive ? (
                  <EventBorder fontSize="small" sx={{ mr: 1 }} />
                ) : null}
                {item === OccurrenceType.Repetitive ? (
                  <LoopIcon fontSize="small" sx={{ mr: 1 }} />
                ) : null}
                {OccurrenceTypeLabel[item]}
              </Stack>
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {tags && tags.length > 0 && (
        <TagsPicker tags={tags} query={query} onQueryChange={onQueryChange} />
      )}

      {categories && categories.length > 0 && (
        <CategoryPicker categories={categories} query={query} onQueryChange={onQueryChange} />
      )}

      {hasKidsCategory && (
        <>
          <Divider sx={{ mt: 2, mb: 1 }}>
            <Typography variant="subtitle2" textAlign="center">
              Wiek dziecka
            </Typography>
          </Divider>
          <TextField
            label="Wiek"
            size="small"
            type="number"
            value={kidsAge}
            onChange={e => setKidsAge(e.target.value)}
            onBlur={applyAgeFilter}
            onKeyDown={e => {
              if (e.key === "Enter") {
                e.preventDefault()
                applyAgeFilter()
                ;(e.target as HTMLInputElement).blur()
              }
            }}
            inputProps={{ min: 0, max: 18 }}
            fullWidth
            InputProps={{
              endAdornment: kidsAge ? (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => {
                      setKidsAge("")
                      navigateWithQuery({
                        ...query,
                        kidsFilters: { ...query.kidsFilters, age: undefined }
                      })
                    }}
                  >
                    <CloseIcon />
                  </IconButton>
                </InputAdornment>
              ) : undefined
            }}
          />
        </>
      )}

      <Box sx={{ display: { xs: "block", md: "none" }, mt: 2 }}>
        <ActiveFilters query={query} tags={tags} onQueryChange={onQueryChange} />
      </Box>

      <Dialog open={openCustomDateDialog} onClose={() => setOpenCustomDateDialog(false)}>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 320, pt: 3 }}
        >
          <Typography variant="subtitle1">Wybierz zakres dat</Typography>
          <TextField
            label="Od"
            type="date"
            size="small"
            value={customDateStart}
            onChange={event => setCustomDateStart(event.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Do"
            type="date"
            size="small"
            value={customDateEnd}
            onChange={event => setCustomDateEnd(event.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCustomDateDialog(false)}>Anuluj</Button>
          <Button onClick={confirmCustomDates} disabled={!customDateStart || !customDateEnd}>
            Zatwierdz
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
