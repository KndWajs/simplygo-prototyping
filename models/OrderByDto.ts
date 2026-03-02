export enum OrderByDto {
  OccurrenceDate = "OccurrenceDate",
  CreatedOn = "CreatedOn",
  Closest = "Closest",
  Recommended = "Recommended"
}

export const OrderByDtoLabel = {
  [OrderByDto.OccurrenceDate]: "Data wydarzenia: od najbliższych",
  [OrderByDto.CreatedOn]: "Czas dodania: od najnowszych",
  [OrderByDto.Closest]: "Odległość: od najbliższych",
  [OrderByDto.Recommended]: "Polecane"
}

export const OrderByDtoArray = [
  OrderByDto.Recommended,
  OrderByDto.OccurrenceDate,
  OrderByDto.CreatedOn,
  OrderByDto.Closest
]
