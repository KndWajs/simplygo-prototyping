// Enums
import { CategoryDto } from "./dtos/GetCategoriesQueryResponse"
import { TagDto } from "./dtos/tagDto"
import { CustomDateRangeDto, OccurrenceDateRangeDto } from "./OccurrenceDateRangeDto"
import { OrderByDto } from "./OrderByDto"

export enum ActivityType {
  Kids = "Kids",
  Event = "Event",
  Sport = "Sport"
}

export enum UserType {
  Organizer = "Organizer",
  Promotor = "Promotor"
}

export enum RegistrationType {
  Needed = "Needed",
  NotNeeded = "NotNeeded"
}

export enum OccurrenceType {
  Single = "Single",
  Repetitive = "Repetitive",
  OpeningHours = "OpeningHours",
  Events = "Events",
  Places = "Places",
  Both = "Both"
}

export const getFiltersOccurrenceTypes = (
  occurrenceType?: OccurrenceType
): OccurrenceType | undefined => {
  switch (occurrenceType) {
    case OccurrenceType.Events:
      return OccurrenceType.Events
    case OccurrenceType.Places:
      return OccurrenceType.OpeningHours
    case OccurrenceType.Both:
      return undefined
    default:
      return occurrenceType
  }
}

export const OccurrenceTypeLabel: Record<OccurrenceType, string> = {
  [OccurrenceType.Events]: "Wydarzenia",
  [OccurrenceType.Single]: "Wydarzenia Jednorazowe",
  [OccurrenceType.Repetitive]: "Wydarzenia Cykliczne",
  [OccurrenceType.OpeningHours]: "Miejsca",
  [OccurrenceType.Places]: "Miejsca",
  [OccurrenceType.Both]: "Wszystko"
}

// @ts-ignore
export const OccurrenceTypeSingleLabel: Record<OccurrenceType, string> = {
  [OccurrenceType.Events]: "Wydarzenie",
  [OccurrenceType.Single]: "Wydarzenie Jednorazowe",
  [OccurrenceType.Repetitive]: "Wydarzenie Cykliczne",
  [OccurrenceType.OpeningHours]: "Miejsce"
}

export enum SportActivityType {
  Individual = "Individual",
  Couples = "Couples",
  Group = "Group"
}

export enum SportAdvancementLevel {
  Beginner = "Beginner",
  Intermediate = "Intermediate",
  Advanced = "Advanced"
}

// Interfaces
export interface Coordinates {
  latitude: number
  longitude: number
}

export interface Address {
  streetAddress: string
  coordinates?: Coordinates
}

export interface Duration {
  days?: number
  hours?: number
  minutes?: number
}

export interface QueryOccurrenceDateDto {
  start: string
  end: string
  dayOfWeek?: number
}

export interface CommandOccurrence {
  type: OccurrenceType
  openingHours?: OpeningHours[]
  repetitive?: Repetitive
  single?: SingleOccurrence
  duration?: Duration
  occurrenceDates?: QueryOccurrenceDateDto[]
}

export interface OpeningHours {
  day: number // DayOfWeek as integer (0-6)
  open: string // timespan "HH:mm:ss"
  close: string // timespan "HH:mm:ss"
}

export enum RecurrencePattern {
  Weekly = 0,
  Monthly = 1,
  FirstDayOfMonth = 2,
  LastDayOfMonth = 3
}

export interface Repetitive {
  startDate: string // ISO 8601 date
  endDate: string // ISO 8601 date
  time: string // timespan "HH:mm:ss"
  recurrencePattern: RecurrencePattern
  recurrenceInterval?: number
  recurrenceDay?: number[]
}

export interface SingleOccurrence {
  date: string // ISO 8601 date
}

export interface Region {
  city?: string
  country?: string
}

export interface ActivityPhotoDto {
  id: string
  url: string
  isMain: boolean
  userId: string
  file?: File
}

export interface ActivityMetadataDto {
  categoryIds: string[]
  address?: string
  fullAddress?: Address
  occurrenceType?: OccurrenceType
  minKidsAge?: number
  maxKidsAge?: number
  startDate?: string
  durationInMinutes?: number
}

export interface QueryActivityDto {
  id?: string
  base: QueryActivityBaseDto
  categories?: CategoryDto[]
  kids?: KidsActivity
  event?: EventActivity
  sport?: SportActivity
  similarActivities?: QueryActivityDto[]
  photos?: ActivityPhotoDto[]
  ratings?: {
    likesCount: number
    rating: number
  }
  tags?: TagDto[]
}

export interface QueryActivityBaseDto {
  title?: string
  description?: string
  userType: UserType
  registration: RegistrationType
  price?: number
  tags?: string
  occurrence: CommandOccurrence
  address: Address
  contactInfo?: {
    email: string
    phoneNumber: string
  }
  website?: string
  categoryIds?: string[]
}

export interface KidsActivity {
  minAge?: number
  maxAge?: number
  age?: number
  babysitting?: boolean
}

export interface EventActivity {
  any?: boolean
}

export interface SportActivity {
  type: SportActivityType
  level: SportAdvancementLevel
}

// Commands
export interface CreateActivityCommand {
  activity: QueryActivityDto
  region: Region
}

export interface UpdateActivityCommand {
  id: string
  activity: QueryActivityDto
}

export interface GetUserFiltersQueryResponse {
  categoryIds?: string[]
  tagIds?: string[]
  orderBy?: OrderByDto
  dateRange: OccurrenceDateRangeDto
  occurrenceType?: OccurrenceType
  customDateRange?: CustomDateRangeDto
  kidsFilters?: KidFilters
  sportFilters?: SportFilters
  address?: Address
}

// Queries
export interface GetActivitiesQuery {
  region?: Region
  coordinates?: Coordinates
  orderBy: OrderByDto
  dateRange: OccurrenceDateRangeDto
  customDateRange?: CustomDateRangeDto
  userType?: UserType
  registration?: RegistrationType
  occurrenceType?: OccurrenceType
  maxPrice?: number
  minPrice?: number
  maxDuration?: number
  kidsFilters?: KidFilters
  eventFilters?: EventFilters
  sportFilters?: SportFilters
  pageNumber: number
  pageSize: number
  searchTerm?: string
  categoryIds?: string[]
  tagIds?: string[]
}

export interface GetMapActivitiesQuery {
  region?: Region
  coordinates?: Coordinates
  coordinatesSouthWest: Coordinates
  coordinatesNorthEast: Coordinates
  orderBy: OrderByDto
  dateRange: OccurrenceDateRangeDto
  userType?: UserType
  registration?: RegistrationType
  occurrenceType?: OccurrenceType
  maxPrice?: number
  minPrice?: number
  maxDuration?: number
  kidsFilters?: KidFilters
  eventFilters?: EventFilters
  sportFilters?: SportFilters
  pageNumber: number
  pageSize: number
  searchTerm?: string
  categoryIds?: string[]
}

export interface KidFilters {
  minAge?: number
  maxAge?: number
  age?: number
  babysitting?: boolean
}

export interface EventFilters {
  any?: boolean
}

export interface SportFilters {
  type?: SportActivityType
  level?: SportAdvancementLevel
}

export interface RateActivityResponse {
  ratings: {
    likesCount: number
    rating: number
  }
}
