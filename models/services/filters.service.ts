import {
  type Coordinates,
  type GetActivitiesQuery,
  OccurrenceType,
  RegistrationType,
  SportAdvancementLevel,
  SportActivityType,
  UserType
} from "../domainDtos"
import {
  DEFAULT_OCCURENCE_RANGE,
  OccurrenceDateRangeDto,
  OccurrenceDateRangeDtoArray
} from "../OccurrenceDateRangeDto"
import { OrderByDto, OrderByDtoArray } from "../OrderByDto"

const DEFAULT_PAGE_NUMBER = 1
const DEFAULT_PAGE_SIZE = 10

/** City coordinate defaults – keyed by city name (lowercase). */
const CITY_COORDINATES: Record<string, Coordinates> = {
  szczecin: { latitude: 53.43786715839242, longitude: 14.542767164110858 }
}
const DEFAULT_CITY_NAME = "Szczecin"
const DEFAULT_COORDINATES = CITY_COORDINATES.szczecin

type SearchParamsObject = Record<string, string | string[] | undefined>

type SearchParamsInput = URLSearchParams | SearchParamsObject

const FILTER_PARAM_KEYS = {
  regionCity: "regionCity",
  regionCountry: "regionCountry",
  coordinatesLatitude: "coordinatesLatitude",
  coordinatesLongitude: "coordinatesLongitude",
  orderBy: "orderBy",
  dateRange: "dateRange",
  customDateStart: "customDateStart",
  customDateEnd: "customDateEnd",
  userType: "userType",
  registration: "registration",
  occurrenceType: "occurrenceType",
  maxPrice: "maxPrice",
  minPrice: "minPrice",
  maxDuration: "maxDuration",
  kidsMinAge: "kidsMinAge",
  kidsMaxAge: "kidsMaxAge",
  kidsAge: "kidsAge",
  kidsBabysitting: "kidsBabysitting",
  sportType: "sportType",
  sportLevel: "sportLevel",
  eventAny: "eventAny",
  pageNumber: "pageNumber",
  pageSize: "pageSize",
  searchTerm: "searchTerm",
  categoryIds: "categoryIds",
  tagIds: "tagIds"
} as const

const enumIncludes = <T extends string>(
  allowedValues: readonly T[],
  value?: string | null
): value is T => {
  if (!value) {
    return false
  }

  return allowedValues.includes(value as T)
}

const parseNumber = (value: string | null): number | undefined => {
  if (!value) {
    return undefined
  }

  const parsed = Number(value)
  if (!Number.isFinite(parsed)) {
    return undefined
  }

  return parsed
}

const parseInteger = (value: string | null): number | undefined => {
  const parsed = parseNumber(value)
  if (parsed === undefined) {
    return undefined
  }

  return Number.isInteger(parsed) ? parsed : undefined
}

const parseBoolean = (value: string | null): boolean | undefined => {
  if (!value) {
    return undefined
  }

  if (value === "true") {
    return true
  }

  if (value === "false") {
    return false
  }

  return undefined
}

const parseStringArray = (value: string | null): string[] | undefined => {
  if (!value) {
    return undefined
  }

  const result = Array.from(
    new Set(
      value
        .split(",")
        .map(item => item.trim())
        .filter(Boolean)
    )
  )

  return result.length > 0 ? result : undefined
}

const parseString = (value: string | null): string | undefined => {
  if (!value) {
    return undefined
  }

  const trimmed = value.trim()
  return trimmed ? trimmed : undefined
}

const parseMultiValueArray = (searchParams: URLSearchParams, key: string): string[] | undefined => {
  const values = searchParams
    .getAll(key)
    .flatMap(value => value.split(","))
    .map(value => value.trim())
    .filter(Boolean)

  if (values.length === 0) {
    return undefined
  }

  return Array.from(new Set(values))
}

const appendIfDefined = (
  searchParams: URLSearchParams,
  key: string,
  value: string | number | boolean | undefined
) => {
  if (value === undefined) {
    return
  }

  searchParams.set(key, String(value))
}

const appendArrayIfDefined = (
  searchParams: URLSearchParams,
  key: string,
  values: string[] | undefined
) => {
  if (!values || values.length === 0) {
    return
  }

  searchParams.set(key, values.join(","))
}

const toUrlSearchParams = (searchParams: SearchParamsInput): URLSearchParams => {
  if (searchParams instanceof URLSearchParams) {
    return new URLSearchParams(searchParams)
  }

  const normalized = new URLSearchParams()

  Object.entries(searchParams).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach(entry => {
        normalized.append(key, entry)
      })
    } else if (value !== undefined) {
      normalized.set(key, value)
    }
  })

  return normalized
}

export const parseFilters = (searchParamsInput: SearchParamsInput): GetActivitiesQuery => {
  const searchParams = toUrlSearchParams(searchParamsInput)

  const orderByValue = searchParams.get(FILTER_PARAM_KEYS.orderBy)
  const dateRangeValue = searchParams.get(FILTER_PARAM_KEYS.dateRange)

  const orderBy = enumIncludes(OrderByDtoArray, orderByValue)
    ? orderByValue
    : OrderByDto.Recommended
  const dateRange = enumIncludes(OccurrenceDateRangeDtoArray, dateRangeValue)
    ? dateRangeValue
    : DEFAULT_OCCURENCE_RANGE

  const pageNumberRaw = parseInteger(searchParams.get(FILTER_PARAM_KEYS.pageNumber))
  const pageSizeRaw = parseInteger(searchParams.get(FILTER_PARAM_KEYS.pageSize))
  const pageNumber = pageNumberRaw && pageNumberRaw > 0 ? pageNumberRaw : DEFAULT_PAGE_NUMBER
  const pageSize = pageSizeRaw && pageSizeRaw > 0 ? pageSizeRaw : DEFAULT_PAGE_SIZE

  const customDateStart = searchParams.get(FILTER_PARAM_KEYS.customDateStart) ?? undefined
  const customDateEnd = searchParams.get(FILTER_PARAM_KEYS.customDateEnd) ?? undefined

  const regionCity = searchParams.get(FILTER_PARAM_KEYS.regionCity) ?? undefined
  const regionCountry = searchParams.get(FILTER_PARAM_KEYS.regionCountry) ?? undefined

  const coordinatesLatitude = parseNumber(searchParams.get(FILTER_PARAM_KEYS.coordinatesLatitude))
  const coordinatesLongitude = parseNumber(searchParams.get(FILTER_PARAM_KEYS.coordinatesLongitude))

  const kidsMinAge = parseInteger(searchParams.get(FILTER_PARAM_KEYS.kidsMinAge))
  const kidsMaxAge = parseInteger(searchParams.get(FILTER_PARAM_KEYS.kidsMaxAge))
  const kidsAge = parseInteger(searchParams.get(FILTER_PARAM_KEYS.kidsAge))
  const kidsBabysitting = parseBoolean(searchParams.get(FILTER_PARAM_KEYS.kidsBabysitting))

  const sportTypeValue = searchParams.get(FILTER_PARAM_KEYS.sportType)
  const sportLevelValue = searchParams.get(FILTER_PARAM_KEYS.sportLevel)
  const eventAny = parseBoolean(searchParams.get(FILTER_PARAM_KEYS.eventAny))
  const occurrenceTypeValue = searchParams.get(FILTER_PARAM_KEYS.occurrenceType)
  const userTypeValue = searchParams.get(FILTER_PARAM_KEYS.userType)
  const registrationValue = searchParams.get(FILTER_PARAM_KEYS.registration)

  return {
    orderBy,
    dateRange,
    pageNumber,
    pageSize,
    customDateRange:
      dateRange === OccurrenceDateRangeDto.CustomDates && (customDateStart || customDateEnd)
        ? {
            start: customDateStart,
            end: customDateEnd
          }
        : undefined,
    region: {
      city: regionCity ?? DEFAULT_CITY_NAME,
      country: "Poland"
    },
    coordinates:
      coordinatesLatitude !== undefined && coordinatesLongitude !== undefined
        ? {
            latitude: coordinatesLatitude,
            longitude: coordinatesLongitude
          }
        : (CITY_COORDINATES[regionCity?.toLowerCase() ?? ""] ?? DEFAULT_COORDINATES),
    userType: enumIncludes(Object.values(UserType), userTypeValue) ? userTypeValue : undefined,
    registration: enumIncludes(Object.values(RegistrationType), registrationValue)
      ? registrationValue
      : undefined,
    occurrenceType: enumIncludes(Object.values(OccurrenceType), occurrenceTypeValue)
      ? occurrenceTypeValue
      : OccurrenceType.Events,
    maxPrice: parseNumber(searchParams.get(FILTER_PARAM_KEYS.maxPrice)),
    minPrice: parseNumber(searchParams.get(FILTER_PARAM_KEYS.minPrice)),
    maxDuration: parseInteger(searchParams.get(FILTER_PARAM_KEYS.maxDuration)),
    kidsFilters:
      kidsMinAge !== undefined ||
      kidsMaxAge !== undefined ||
      kidsAge !== undefined ||
      kidsBabysitting !== undefined
        ? {
            minAge: kidsMinAge,
            maxAge: kidsMaxAge,
            age: kidsAge,
            babysitting: kidsBabysitting
          }
        : undefined,
    sportFilters:
      enumIncludes(Object.values(SportActivityType), sportTypeValue) ||
      enumIncludes(Object.values(SportAdvancementLevel), sportLevelValue)
        ? {
            type: enumIncludes(Object.values(SportActivityType), sportTypeValue)
              ? sportTypeValue
              : undefined,
            level: enumIncludes(Object.values(SportAdvancementLevel), sportLevelValue)
              ? sportLevelValue
              : undefined
          }
        : undefined,
    eventFilters: eventAny !== undefined ? { any: eventAny } : undefined,
    searchTerm: parseString(searchParams.get(FILTER_PARAM_KEYS.searchTerm)),
    categoryIds:
      parseMultiValueArray(searchParams, FILTER_PARAM_KEYS.categoryIds) ??
      parseStringArray(searchParams.get(FILTER_PARAM_KEYS.categoryIds)),
    tagIds:
      parseMultiValueArray(searchParams, FILTER_PARAM_KEYS.tagIds) ??
      parseStringArray(searchParams.get(FILTER_PARAM_KEYS.tagIds))
  }
}

export const serializeFilters = (filters: GetActivitiesQuery): URLSearchParams => {
  const searchParams = new URLSearchParams()

  appendIfDefined(searchParams, FILTER_PARAM_KEYS.regionCity, filters.region?.city)
  appendIfDefined(searchParams, FILTER_PARAM_KEYS.regionCountry, filters.region?.country)
  appendIfDefined(
    searchParams,
    FILTER_PARAM_KEYS.coordinatesLatitude,
    filters.coordinates?.latitude
  )
  appendIfDefined(
    searchParams,
    FILTER_PARAM_KEYS.coordinatesLongitude,
    filters.coordinates?.longitude
  )
  appendIfDefined(searchParams, FILTER_PARAM_KEYS.orderBy, filters.orderBy)
  appendIfDefined(searchParams, FILTER_PARAM_KEYS.dateRange, filters.dateRange)
  appendIfDefined(searchParams, FILTER_PARAM_KEYS.customDateStart, filters.customDateRange?.start)
  appendIfDefined(searchParams, FILTER_PARAM_KEYS.customDateEnd, filters.customDateRange?.end)
  appendIfDefined(searchParams, FILTER_PARAM_KEYS.userType, filters.userType)
  appendIfDefined(searchParams, FILTER_PARAM_KEYS.registration, filters.registration)
  appendIfDefined(searchParams, FILTER_PARAM_KEYS.occurrenceType, filters.occurrenceType)
  appendIfDefined(searchParams, FILTER_PARAM_KEYS.maxPrice, filters.maxPrice)
  appendIfDefined(searchParams, FILTER_PARAM_KEYS.minPrice, filters.minPrice)
  appendIfDefined(searchParams, FILTER_PARAM_KEYS.maxDuration, filters.maxDuration)
  appendIfDefined(searchParams, FILTER_PARAM_KEYS.kidsMinAge, filters.kidsFilters?.minAge)
  appendIfDefined(searchParams, FILTER_PARAM_KEYS.kidsMaxAge, filters.kidsFilters?.maxAge)
  appendIfDefined(searchParams, FILTER_PARAM_KEYS.kidsAge, filters.kidsFilters?.age)
  appendIfDefined(searchParams, FILTER_PARAM_KEYS.kidsBabysitting, filters.kidsFilters?.babysitting)
  appendIfDefined(searchParams, FILTER_PARAM_KEYS.sportType, filters.sportFilters?.type)
  appendIfDefined(searchParams, FILTER_PARAM_KEYS.sportLevel, filters.sportFilters?.level)
  appendIfDefined(searchParams, FILTER_PARAM_KEYS.eventAny, filters.eventFilters?.any)
  appendIfDefined(searchParams, FILTER_PARAM_KEYS.pageNumber, filters.pageNumber)
  appendIfDefined(searchParams, FILTER_PARAM_KEYS.pageSize, filters.pageSize)
  appendIfDefined(searchParams, FILTER_PARAM_KEYS.searchTerm, filters.searchTerm)
  appendArrayIfDefined(searchParams, FILTER_PARAM_KEYS.categoryIds, filters.categoryIds)
  appendArrayIfDefined(searchParams, FILTER_PARAM_KEYS.tagIds, filters.tagIds)

  return searchParams
}

interface UpdateUrlWithQueryOptions {
  pathname: string
  query: GetActivitiesQuery
  navigate: (url: string) => void
  resetPageNumber?: boolean
}

export const updateUrlWithQuery = ({
  pathname,
  query,
  navigate,
  resetPageNumber = true
}: UpdateUrlWithQueryOptions) => {
  const nextQuery = resetPageNumber
    ? {
        ...query,
        pageNumber: DEFAULT_PAGE_NUMBER
      }
    : query

  const params = serializeFilters(nextQuery)
  params.sort()
  const serializedParams = params.toString()
  const nextUrl = serializedParams ? `${pathname}?${serializedParams}` : pathname

  navigate(nextUrl)
}

export const filtersService = {
  parseFilters,
  serializeFilters,
  updateUrlWithQuery
}
