import { Coordinates } from "../models/domainDtos"

export const calculateDistance = (
  coordinates1?: Coordinates,
  coordinates2?: Coordinates
): string => {
  if (!coordinates1 || !coordinates2) {
    return ""
  }

  const toRadians = (degree: number): number => degree * (Math.PI / 180)

  const R = 6371
  const dLat = toRadians(coordinates2.latitude - coordinates1.latitude)
  const dLon = toRadians(coordinates2.longitude - coordinates1.longitude)

  const lat1 = toRadians(coordinates1.latitude)
  const lat2 = toRadians(coordinates2.latitude)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const totalDistance = R * c

  // >= 30 km: integer km; 1–29.9 km: one decimal
  if (totalDistance >= 29.999) {
    return `${Math.round(totalDistance)} km`
  }
  if (totalDistance >= 1) {
    return `${totalDistance.toFixed(1)} km`
  }

  // Otherwise return meters
  const meters = Math.round(totalDistance * 1000)
  return meters > 0 ? `${meters} m` : "0 m"
}

export const isClose = (coordinates1?: Coordinates, coordinates2?: Coordinates): boolean => {
  if (!coordinates1 || !coordinates2) {
    return false
  }

  const toRadians = (degree: number): number => degree * (Math.PI / 180)

  const R = 6371
  const dLat = toRadians(coordinates2.latitude - coordinates1.latitude)
  const dLon = toRadians(coordinates2.longitude - coordinates1.longitude)

  const lat1 = toRadians(coordinates1.latitude)
  const lat2 = toRadians(coordinates2.latitude)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const totalDistance = R * c
  return totalDistance <= 1 // 1 km
}
