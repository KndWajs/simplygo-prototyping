"use client"

import { useAuth0 } from "@auth0/auth0-react"
import { Box, Button, Card, Chip, CircularProgress, Stack } from "@mui/material"
import { QRCodeCanvas } from "qrcode.react"
import React, { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { QueryActivityDto } from "../../models/domainDtos"
import {
  fetchUserCreatedActivities,
  fetchUserLikedActivitiesFull
} from "../../models/services/activities.service"
import { isPlaceActivity } from "../../utils/activityUtils"
import { generateActivityHref } from "../../utils/slugUtils"
import EventCard from "../eventCard/eventCard"
import { EmptyState } from "../emptyState/emptyState"
import { LoginPopup } from "../auth/loginPopup"
import { ActivitiesCalendar } from "./activitiesCalendar"
import { DeleteActivityButton } from "./deleteActivityButton"

type FilterType = "all" | "active" | "finished" | "places"
type ViewType = "my" | "favorites"

const ACTIVE_GRADIENT = "linear-gradient(90deg, #de5c2d 0%, #ff6b35 40%, #ff6b35 60%, #ff8c64 100%)"

const viewChipSx = (active: boolean) => ({
  px: 1.5,
  py: 1.5,
  borderRadius: "50px",
  fontWeight: 700,
  fontSize: "1rem",
  transition: "all 0.2s ease",
  cursor: "pointer",
  height: "auto",
  ...(active
    ? {
        background: ACTIVE_GRADIENT,
        color: "white",
        "&:hover": { background: ACTIVE_GRADIENT }
      }
    : {
        backgroundColor: "rgba(0, 0, 0, 0.08)",
        color: "text.primary",
        "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.12)" }
      })
})

const filterChipSx = (active: boolean) => ({
  px: { xs: 1.5, sm: 1.5 },
  py: 0.25,
  borderRadius: "50px",
  fontWeight: 400,
  fontSize: "0.8125rem",
  transition: "all 0.2s ease",
  cursor: "pointer",
  flex: { xs: "1 1 calc(50% - 4px)", sm: "0 0 auto" },
  minWidth: { xs: "calc(50% - 4px)", sm: "auto" },
  maxWidth: { xs: "calc(50% - 4px)", sm: "none" },
  ...(active
    ? {
        backgroundColor: "rgba(0, 0, 0, 0.12)",
        color: "text.primary",
        borderColor: "rgba(0, 0, 0, 0.23)",
        "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.16)" }
      }
    : {
        backgroundColor: "transparent",
        color: "text.secondary",
        borderColor: "rgba(0, 0, 0, 0.23)",
        "&:hover": {
          backgroundColor: "rgba(0, 0, 0, 0.04)",
          borderColor: "rgba(0, 0, 0, 0.3)"
        }
      })
})

const isActivityFinished = (activity: QueryActivityDto): boolean => {
  const dates = activity.base.occurrence.occurrenceDates
  if (!dates || dates.length === 0) return false
  const now = new Date()
  return dates.every(d => new Date(d.end) < now)
}

const handleDownloadQr = (id: string | undefined): void => {
  if (!id) return
  const canvas = document.getElementById(`qr-${id}`) as HTMLCanvasElement | null
  if (!canvas) return
  const link = document.createElement("a")
  link.href = canvas.toDataURL("image/png")
  link.download = "simplygo.png"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const FILTERS: { value: FilterType; label: string }[] = [
  { value: "all", label: "Wszystkie" },
  { value: "active", label: "Aktywne" },
  { value: "finished", label: "Zakończone" },
  { value: "places", label: "Miejsca" }
]

function getEmptyStateMessage(
  viewType: ViewType,
  activeFilter: FilterType
): { title: string; description: string } {
  const isMy = viewType === "my"
  const baseTitle = isMy ? "utworzonych" : "ulubionych"
  const baseDescription = isMy
    ? "Stwórz aktywności, a pojawią się tutaj."
    : "Polub wydarzenia, a pojawią się tutaj."

  switch (activeFilter) {
    case "all":
      return {
        title: `Nie masz jeszcze ${baseTitle} aktywności`,
        description: baseDescription
      }
    case "active":
      return {
        title: `Nie masz jeszcze aktywnych ${baseTitle} aktywności`,
        description: baseDescription
      }
    case "finished":
      return {
        title: `Nie masz jeszcze zakończonych ${baseTitle} aktywności`,
        description: isMy
          ? "Zakończone aktywności pojawią się tutaj."
          : "Zakończone ulubione aktywności pojawią się tutaj."
      }
    case "places":
      return {
        title: `Nie masz jeszcze ${isMy ? "utworzonych" : "ulubionych"} miejsc`,
        description: isMy
          ? "Stwórz miejsce, a pojawią się tutaj."
          : "Polub miejsca, a pojawią się tutaj."
      }
    default:
      return {
        title: `Nie masz jeszcze ${baseTitle} aktywności`,
        description: baseDescription
      }
  }
}

function filterActivities(activities: QueryActivityDto[], filter: FilterType): QueryActivityDto[] {
  switch (filter) {
    case "all":
      return activities
    case "active":
      return activities.filter(a => !isActivityFinished(a) && !isPlaceActivity(a))
    case "finished":
      return activities.filter(a => isActivityFinished(a) && !isPlaceActivity(a))
    case "places":
      return activities.filter(isPlaceActivity)
    default:
      return activities
  }
}

export const MyActivities: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading, getAccessTokenSilently } = useAuth0()
  const [createdActivities, setCreatedActivities] = useState<QueryActivityDto[]>([])
  const [likedActivities, setLikedActivities] = useState<QueryActivityDto[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<FilterType>("all")
  const [viewType, setViewType] = useState<ViewType>("my")
  const [loginPopupOpen, setLoginPopupOpen] = useState(false)

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const token = await getAccessTokenSilently()
      const [created, liked] = await Promise.all([
        fetchUserCreatedActivities(token),
        fetchUserLikedActivitiesFull(token)
      ])
      setCreatedActivities(created)
      setLikedActivities(liked)
    } catch {
      // token fetch may fail if not authenticated
    } finally {
      setLoading(false)
    }
  }, [getAccessTokenSilently])

  useEffect(() => {
    if (isAuthenticated) {
      loadData()
    } else if (!authLoading) {
      setLoading(false)
    }
  }, [isAuthenticated, authLoading, loadData])

  if (authLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!isAuthenticated) {
    return <LoginPopup open={true} onClose={() => setLoginPopupOpen(false)} />
  }

  const activities = viewType === "my" ? createdActivities : likedActivities
  const filteredActivities = filterActivities(activities, activeFilter)

  return (
    <Box sx={{ maxWidth: "1200px" }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          flexWrap: { xs: "wrap-reverse", md: "nowrap" },
          gap: 2
        }}
      >
        <Box sx={{ flex: 1, mt: 2, px: 1 }}>
          {/* View toggle chips */}
          <Stack
            direction="row"
            spacing={1.5}
            sx={{ mb: 2, alignItems: "center", flexWrap: "wrap", gap: 1.5 }}
          >
            <Chip
              label="Moje aktywności"
              onClick={() => setViewType("my")}
              sx={viewChipSx(viewType === "my")}
            />
            <Chip
              label="Moje ulubione"
              onClick={() => setViewType("favorites")}
              sx={viewChipSx(viewType === "favorites")}
            />
          </Stack>

          {/* Filter chips */}
          <Box
            sx={{
              mb: 3,
              mt: 2,
              display: "flex",
              flexDirection: "row",
              flexWrap: "wrap",
              gap: { xs: 1, sm: 1 },
              justifyContent: { xs: "space-between", sm: "flex-start" }
            }}
          >
            {FILTERS.map(filter => (
              <Chip
                key={filter.value}
                label={filter.label}
                onClick={() => setActiveFilter(filter.value)}
                size="small"
                variant={activeFilter === filter.value ? "filled" : "outlined"}
                sx={filterChipSx(activeFilter === filter.value)}
              />
            ))}
          </Box>

          {/* Loading state */}
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <CircularProgress />
            </Box>
          ) : filteredActivities.length > 0 ? (
            filteredActivities.map(activity =>
              viewType === "my" ? (
                <Card key={activity.id} sx={{ mb: 1, pb: 1 }} elevation={0}>
                  <div style={{ display: "none" }}>
                    <QRCodeCanvas
                      id={`qr-${activity.id}`}
                      level="H"
                      value={`https://simplygo.pl${generateActivityHref(activity)}`}
                      size={180}
                      marginSize={3}
                      imageSettings={{
                        src: "/logo_icon.png",
                        x: undefined,
                        y: undefined,
                        height: 32,
                        width: 32,
                        opacity: 1,
                        excavate: true,
                        crossOrigin: "anonymous"
                      }}
                    />
                  </div>
                  <Link
                    href={generateActivityHref(activity)}
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <EventCard activity={activity} />
                  </Link>
                  <Stack direction="row" spacing={2} sx={{ mt: 1, ml: 1 }}>
                    <Button variant="contained" disabled>
                      Edytuj
                    </Button>
                    <Button
                      variant="text"
                      color="info"
                      onClick={() => handleDownloadQr(activity.id)}
                    >
                      Pobierz QR kod
                    </Button>
                    <DeleteActivityButton activity={activity} afterDeleteAction={loadData} />
                  </Stack>
                </Card>
              ) : (
                <Link
                  key={activity.id}
                  href={generateActivityHref(activity)}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <EventCard activity={activity} />
                </Link>
              )
            )
          ) : (
            <EmptyState {...getEmptyStateMessage(viewType, activeFilter)} />
          )}
        </Box>

        {/* Calendar sidebar (desktop only) */}
        <Box sx={{ width: { xs: "100%", md: "300px" }, flexShrink: 0 }}>
          <ActivitiesCalendar activities={filteredActivities} viewType={viewType} />
        </Box>
      </Box>
    </Box>
  )
}
