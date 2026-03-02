"use client"

import dynamic from "next/dynamic"
import { Box } from "@mui/material"
import type { Coordinates } from "../../models/domainDtos"

const Map = dynamic(() => import("../map/map"), { ssr: false })

interface ActivityMapProps {
  coordinates: Coordinates
  title: string
}

export const ActivityMap = ({ coordinates, title }: ActivityMapProps) => {
  return (
    <Box sx={{ width: "100%", height: "400px" }}>
      <Map
        center={coordinates}
        zoomLevel={15}
        cooperativeGestures={true}
        singleItem={{ name: title, coordinates }}
        hideFullscreenControl
      />
    </Box>
  )
}
