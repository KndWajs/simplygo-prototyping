export enum OccurrenceDateRangeDto {
  Today = "Today",
  Tomorrow = "Tomorrow",
  ThisWeek = "ThisWeek",
  ThisWeekend = "ThisWeekend",
  NextSevenDays = "NextSevenDays",
  NextFourteenDays = "NextFourteenDays",
  NextThirtyDays = "NextThirtyDays",
  CustomDates = "CustomDates"
}

export const DEFAULT_OCCURENCE_RANGE = OccurrenceDateRangeDto.NextFourteenDays

export const OccurrenceDateRangeDtoLabel = {
  [OccurrenceDateRangeDto.Today]: "Dzisiaj",
  [OccurrenceDateRangeDto.Tomorrow]: "Jutro",
  [OccurrenceDateRangeDto.ThisWeek]: "W tym tygodniu",
  [OccurrenceDateRangeDto.ThisWeekend]: "W ten weekend",
  [OccurrenceDateRangeDto.NextSevenDays]: "W ciągu 7 dni",
  [OccurrenceDateRangeDto.NextFourteenDays]: "W ciągu 2 tygodni",
  [OccurrenceDateRangeDto.NextThirtyDays]: "W ciągu 30 dni",
  [OccurrenceDateRangeDto.CustomDates]: "Niestandardowa data"
}

export const OccurrenceDateRangeDtoArray = [
  OccurrenceDateRangeDto.Today,
  OccurrenceDateRangeDto.Tomorrow,
  OccurrenceDateRangeDto.ThisWeek,
  OccurrenceDateRangeDto.ThisWeekend,
  OccurrenceDateRangeDto.NextSevenDays,
  OccurrenceDateRangeDto.NextFourteenDays,
  OccurrenceDateRangeDto.NextThirtyDays,
  OccurrenceDateRangeDto.CustomDates
]

export const maxSevenDays: OccurrenceDateRangeDto[] = [
  OccurrenceDateRangeDto.Today,
  OccurrenceDateRangeDto.Tomorrow,
  OccurrenceDateRangeDto.ThisWeek,
  OccurrenceDateRangeDto.ThisWeekend,
  OccurrenceDateRangeDto.NextSevenDays
]

export interface CustomDateRangeDto {
  start?: string
  end?: string
}
