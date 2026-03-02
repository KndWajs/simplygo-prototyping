"use client"

import DirectionsIcon from "@mui/icons-material/Directions"
import { Button } from "@mui/material"
import type { Coordinates } from "../../models/domainDtos"

interface RouteButtonProps {
  destination: Coordinates
}

export function RouteButton({ destination }: RouteButtonProps) {
  const handleOpenRoute = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const origin = `${position.coords.latitude},${position.coords.longitude}`
          const dest = `${destination.latitude},${destination.longitude}`
          window.open(
            `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}`,
            "_blank"
          )
        },
        () => {
          // Fallback: open without origin, Google Maps will ask for it
          const dest = `${destination.latitude},${destination.longitude}`
          window.open(`https://www.google.com/maps/dir/?api=1&destination=${dest}`, "_blank")
        }
      )
    } else {
      const dest = `${destination.latitude},${destination.longitude}`
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${dest}`, "_blank")
    }
  }

  return (
    <Button
      variant="text"
      // @ts-ignore
      color="text"
      startIcon={<DirectionsIcon />}
      onClick={handleOpenRoute}
    >
      Trasa
    </Button>
  )
}
