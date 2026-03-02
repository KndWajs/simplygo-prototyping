export enum DurationEnum {
  Days = "Days",
  Hours = "Hours",
  Minutes = "Minutes"
}

export const getDurationEnum = (duration: string): DurationEnum => {
  switch (duration) {
    case "Days":
      return DurationEnum.Days
    case "Hours":
      return DurationEnum.Hours
    case "Minutes":
      return DurationEnum.Minutes
    default:
      return DurationEnum.Days
  }
}
