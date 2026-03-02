"use client"

import CloseIcon from "@mui/icons-material/Close"
import { Box, Grid, IconButton, Modal, Stack } from "@mui/material"
import dynamic from "next/dynamic"
import { useCallback, useEffect, useRef, useState } from "react"
import type { CategoryDto } from "../../models/dtos/GetCategoriesQueryResponse"
import type { TagDto } from "../../models/dtos/tagDto"
import type {
  Coordinates,
  GetActivitiesQuery,
  GetMapActivitiesQuery,
  QueryActivityDto
} from "../../models/domainDtos"
import { fetchMapActivities } from "../../models/services/activities.service"
import type { MapViewport } from "../map/map"
import { ActiveFilters } from "../activeFilters/activeFilters"
import EventCard from "../eventCard/eventCard"
import { FilterDrawer } from "../filterDrawer/filterDrawer"
import { Filters } from "../filters/filters"
import { InfoBar } from "./infoBar"
import "./mapModal.scss"

const Map = dynamic(() => import("../map/map"), { ssr: false })

const VIEWPORT_KEY = "sg_map_viewport"

function saveViewport(viewport: MapViewport) {
  try {
    sessionStorage.setItem(VIEWPORT_KEY, JSON.stringify(viewport))
  } catch {
    /* ignore */
  }
}

function loadViewport(): MapViewport | null {
  try {
    const raw = sessionStorage.getItem(VIEWPORT_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

interface MapModalProps {
  isOpen: boolean
  onClose: () => void
  query: GetActivitiesQuery
  categories?: CategoryDto[]
  tags?: TagDto[]
  userCoordinates?: Coordinates
}

export function MapModal({
  isOpen,
  onClose,
  query,
  categories,
  tags,
  userCoordinates
}: MapModalProps) {
  const [results, setResults] = useState<QueryActivityDto[]>([])
  const [count, setCount] = useState(0)
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const [bounds, setBounds] = useState<{ sw: Coordinates; ne: Coordinates } | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const viewportRef = useRef<MapViewport | null>(null)

  const defaultCenter = userCoordinates ?? {
    latitude: 53.43786715839242,
    longitude: 14.542767164110858
  }
  const saved = useRef(loadViewport())
  const center = saved.current?.center ?? defaultCenter
  const zoom = saved.current?.zoom ?? 14

  const handleViewportChange = useCallback((vp: MapViewport) => {
    viewportRef.current = vp
    saveViewport(vp)
  }, [])

  const handleBoundsChange = useCallback((sw: Coordinates, ne: Coordinates) => {
    setBounds({ sw, ne })
  }, [])

  useEffect(() => {
    if (!isOpen || !bounds) return

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    const mapQuery: GetMapActivitiesQuery = {
      ...query,
      coordinatesSouthWest: bounds.sw,
      coordinatesNorthEast: bounds.ne,
      pageNumber: 1,
      pageSize: 200
    }

    fetchMapActivities(mapQuery, controller.signal).then(data => {
      if (!controller.signal.aborted) {
        setResults(data.activities)
        setCount(data.count)
      }
    })

    return () => {
      controller.abort()
    }
  }, [isOpen, bounds, query])

  const selectedActivity = results.find(item => item.id === selectedItemId)

  return (
    <Modal open={isOpen} onClose={onClose}>
      <div className="map-modal">
        <Box
          sx={{
            width: "100%",
            height: "100%",
            backgroundColor: "white",
            borderRadius: "24px 24px 0 0",
            padding: "8px",
            display: "flex",
            flexDirection: "column",
            position: "relative"
          }}
        >
          <Stack
            direction="row"
            display="flex"
            justifyContent="space-between"
            alignItems="flex-end"
            alignContent="flex-end"
            sx={{ padding: "8px" }}
          >
            <FilterDrawer query={query} />
            <IconButton onClick={onClose} sx={{ marginLeft: "auto" }}>
              <CloseIcon />
            </IconButton>
          </Stack>

          <div
            className="desktop-hidden"
            style={{
              marginTop: "8px",
              marginBottom: "8px",
              marginLeft: "8px",
              marginRight: "8px"
            }}
          >
            <ActiveFilters query={query} tags={tags} />
          </div>

          <Stack direction="row" sx={{ height: "100%" }}>
            <Grid
              size={{ xs: 0, md: 2.5 }}
              sx={{
                display: { xs: "none", md: "flex" },
                borderRight: "1px solid #ccc",
                paddingRight: "16px"
              }}
            >
              <Filters query={query} categories={categories} tags={tags} />
            </Grid>
            <Box style={{ flex: 1, position: "relative" }}>
              <div className="map-info-bar">
                <InfoBar count={count} hasMore={count > 200} />
              </div>
              <Map
                center={center}
                onAnywhereClick={() => setSelectedItemId(null)}
                onClick={id => setSelectedItemId(id)}
                selectedItemId={selectedItemId}
                items={results}
                zoomLevel={zoom}
                cooperativeGestures={false}
                setBounds={handleBoundsChange}
                hideFullscreenControl
                singleItem={{ name: "Twoja lokalizacja", coordinates: defaultCenter }}
                onViewportChange={handleViewportChange}
              />
              {selectedActivity && (
                <div className="map-activity-card">
                  <Box
                    sx={{
                      alignSelf: "flex-end",
                      marginBottom: "-40px",
                      position: "relative",
                      zIndex: 2,
                      width: "32px",
                      height: "32px"
                    }}
                  >
                    <IconButton
                      size="small"
                      onClick={() => setSelectedItemId(null)}
                      sx={{
                        backgroundColor: "white",
                        "&:hover": { backgroundColor: "#eee" },
                        boxShadow: 1
                      }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  <EventCard
                    activity={selectedActivity}
                    userCoordinates={userCoordinates}
                    mapCard
                  />
                </div>
              )}
            </Box>
          </Stack>
        </Box>
      </div>
    </Modal>
  )
}
