"use client"

import ChevronRightIcon from "@mui/icons-material/ChevronRight"
import DeckIcon from "@mui/icons-material/Deck"
import EventIcon from "@mui/icons-material/Event"
import LocationOnIcon from "@mui/icons-material/LocationOn"
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Chip,
  Paper,
  Stack,
  Typography
} from "@mui/material"
import Link from "next/link"
import { useRouter } from "next/navigation"
import CloseIcon from "@mui/icons-material/Close"
import React, { useCallback, useRef, useState } from "react"
import { Coordinates, QueryActivityDto } from "../../models/domainDtos"
import { calculateDistance, isClose } from "../../utils/mapUtils"
import { getImageUrl, isPlaceActivity } from "../../utils/activityUtils"
import { generateActivityHref } from "../../utils/slugUtils"
import { OccurrenceTime } from "./occurrenceTime"
import { LikeButton } from "./likeButton"
import { RatingComponent } from "./ratingComponent"
import { ActivityTags } from "./activityTags"

interface EventCardProps {
  activity: QueryActivityDto
  userCoordinates?: Coordinates
  mapCard?: boolean
  replace?: boolean
  showOccurrenceBadge?: boolean
}

const EventCard: React.FC<EventCardProps> = ({
  activity,
  userCoordinates,
  mapCard,
  replace,
  showOccurrenceBadge
}) => {
  const router = useRouter()
  const prefetched = useRef(false)
  const {
    base: { occurrence, address }
  } = activity

  const [showSimilar, setShowSimilar] = useState(false)
  const activityHref = generateActivityHref(activity)

  const handlePrefetch = useCallback(() => {
    if (!prefetched.current) {
      prefetched.current = true
      router.prefetch(activityHref)
    }
  }, [router, activityHref])

  const handleClick = () => {
    sessionStorage.setItem("sg_internal_nav", "1")
    // @ts-ignore
    window.gtag?.("event", "activity_select", { activity_id: activity.id, source: "list" })
  }

  const imageUrl =
    activity.photos && activity.photos.length > 0 ? activity.photos[0].url : getImageUrl(activity)

  const isPlace = isPlaceActivity(activity)

  const occurrenceBadge = (
    <Chip
      icon={isPlace ? <DeckIcon /> : <EventIcon />}
      label={isPlace ? "Miejsce" : "Wydarzenie"}
      size="small"
      sx={{
        position: "absolute",
        top: 8,
        left: 8,
        zIndex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.55)",
        color: "#fff",
        fontSize: "0.7rem",
        height: "22px",
        "& .MuiChip-label": { px: "8px", pl: "4px" },
        "& .MuiChip-icon": { color: "#fff", fontSize: "0.9rem", ml: "6px" }
      }}
    />
  )

  const distanceText = address?.coordinates
    ? calculateDistance(userCoordinates, address.coordinates)
    : ""

  const distance = distanceText && (
    <Typography
      variant="body2"
      color="text.secondary"
      sx={{ display: "flex", alignItems: "center", gap: "4px" }}
    >
      <LocationOnIcon sx={{ fontSize: 18 }} />
      {distanceText}
    </Typography>
  )

  const isCloseBy = isClose(userCoordinates, address.coordinates)

  const closeBy = isCloseBy && (
    <Typography variant="body2" color="success.main" sx={{ m: 0 }}>
      Blisko Ciebie!
    </Typography>
  )

  const similarChip = activity.similarActivities && activity.similarActivities.length > 0 && (
    <Box width="100%" display="flex" justifyContent="flex-end" sx={{ mt: 1 }}>
      <Typography
        variant="body2"
        color="text.secondary"
        onClick={() => setShowSimilar(!showSimilar)}
        sx={{
          cursor: "pointer",
          textDecoration: "underline",
          "&:hover": { color: "primary.main" }
        }}
      >
        {showSimilar
          ? "Ukryj podobne"
          : `Pokaż podobne (${activity.similarActivities.length})`}
      </Typography>
    </Box>
  )

  if (mapCard) {
    return (
      <Card
        onMouseEnter={handlePrefetch}
        onTouchStart={handlePrefetch}
        sx={{
          marginLeft: "4px",
          marginRight: "4px",
          minWidth: "300px",
          width: "100%",
          marginBottom: "8px",
          backgroundColor: "rgba(255,255,255,1)",
          position: "relative",
          "&:hover .card-chevron": { transform: "translateX(3px)", color: "text.primary" }
        }}
      >
        <Link
          href={activityHref}
          replace={replace}
          onClick={handleClick}
          style={{
            textDecoration: "none",
            color: "inherit",
            display: "block"
          }}
        >
          <Box sx={{ position: "relative" }}>
            {showOccurrenceBadge && occurrenceBadge}
            <CardMedia
              sx={{
                height: 140,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "top",
                padding: "12px"
              }}
              image={imageUrl}
              alt={activity.base.title || "Activity Image"}
            />
          </Box>
          <CardContent
            sx={{
              overflow: "hidden",
              textAlign: "left",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
              paddingBottom: "4px",
              paddingTop: "8px"
            }}
          >
            <Typography
                gutterBottom
                variant="h6"
                component="div"
                style={{
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  width: "100%"
                }}
              >
                {activity.base.title}
                <ChevronRightIcon
                  className="card-chevron"
                  sx={{
                    fontSize: 18,
                    ml: "4px",
                    verticalAlign: "-3px",
                    color: "text.secondary",
                    transition: "transform 0.2s ease, color 0.2s ease"
                  }}
                />
              </Typography>
            <OccurrenceTime activity={activity} hideDetails />
            {isCloseBy && (
              <Stack direction="row" alignItems="center" gap={1}>
                {distance}
                {closeBy}
              </Stack>
            )}
          </CardContent>
        </Link>
        <CardActions
          sx={{ pl: "16px", pr: "16px", pt: 0, pb: "8px" }}
          onClick={e => e.stopPropagation()}
        >
          <Stack direction="row" width="100%" justifyContent="space-between" alignItems="center">
            <Stack direction="row" alignItems="center" gap={1}>
              {!isCloseBy && distance}
              {activity.id && <LikeButton activity={activity} />}
            </Stack>
            {activity.ratings && <RatingComponent rating={activity.ratings.rating} />}
          </Stack>
        </CardActions>
      </Card>
    )
  }

  return (
    <>
      {/* Mobile */}
      <Card
        onTouchStart={handlePrefetch}
        sx={{
          display: { xs: "block", md: "none" },
          marginLeft: "4px",
          marginRight: "4px",
          minWidth: "300px",
          minHeight: "230px",
          width: "100%",
          marginBottom: "8px",
          backgroundColor: "rgba(255,255,255,1)",
          "&:hover .card-chevron": { transform: "translateX(3px)", color: "text.primary" }
        }}
      >
        <Link
          href={activityHref}
          replace={replace}
          onClick={handleClick}
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <Box sx={{ position: "relative" }}>
            {showOccurrenceBadge && occurrenceBadge}
            <CardMedia
              sx={{
                height: 160,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "top",
                padding: "12px"
              }}
              image={imageUrl}
              alt={activity.base.title || "Activity Image"}
            />
          </Box>

          <CardContent
            sx={{
              maxHeight: "230px",
              overflow: "hidden",
              textAlign: "left",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
              paddingBottom: "0px"
            }}
          >
            <div>
              <Typography
                  gutterBottom
                  variant="h6"
                  component="div"
                  style={{
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    width: "100%"
                  }}
                >
                  {activity.base.title}
                  <ChevronRightIcon
                    className="card-chevron"
                    sx={{
                      fontSize: 18,
                      ml: "4px",
                      verticalAlign: "-3px",
                      color: "text.secondary",
                      transition: "transform 0.2s ease, color 0.2s ease"
                    }}
                  />
                </Typography>
              <Box sx={{ mb: "16px" }}>
                <OccurrenceTime activity={activity} hideDetails />
              </Box>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                flexWrap: "wrap",
                gap: "5px",
                maxHeight: "170px",
                overflow: "hidden",
                marginBottom: "16px"
              }}
            >
              <ActivityTags activity={activity} />
            </div>
          </CardContent>
          {isCloseBy && (
            <Stack direction="row" alignItems="center" gap={1} sx={{ pl: "16px", pr: "16px" }}>
              {distance}
              {closeBy}
            </Stack>
          )}
        </Link>
        <CardActions
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            pl: "16px",
            pr: "16px"
          }}
        >
          <Stack direction="row" width="100%" justifyContent="space-between" alignItems="center">
            <Stack direction="row" alignItems="center" gap={1}>
              {!isCloseBy && distance}
              {activity.id && <LikeButton activity={activity} />}
            </Stack>
            {activity.ratings && <RatingComponent rating={activity.ratings.rating} />}
          </Stack>
          {similarChip}
        </CardActions>
      </Card>

      {/* Desktop */}
      <Card
        onMouseEnter={handlePrefetch}
        sx={{
          display: { xs: "none", md: "flex" },
          maxWidth: "100%",
          margin: "4px",
          width: "100%",
          height: "170px",
          borderRadius: 0,
          backgroundColor: "rgba(255,255,255,1)",
          "&:hover .card-chevron": { transform: "translateX(3px)", color: "text.primary" }
        }}
      >
        <Link
          href={activityHref}
          replace={replace}
          onClick={handleClick}
          style={{
            textDecoration: "none",
            color: "inherit",
            display: "flex",
            flexGrow: 1,
            minWidth: 0,
            overflow: "hidden"
          }}
        >
          <Box
            sx={{
              width: "220px",
              minWidth: "220px",
              height: "170px",
              position: "relative",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column"
            }}
          >
            {showOccurrenceBadge && occurrenceBadge}
            <Box
              component="img"
              sx={{
                width: "220px",
                height: "170px",
                minWidth: "220px",
                objectFit: "cover",
                objectPosition: "center",
                display: "block"
              }}
              src={imageUrl}
              alt={activity.base.title || "Activity Image"}
            />
          </Box>
          <Box
            sx={{
              flexGrow: 1,
              padding: "12px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              position: "relative",
              zIndex: 1,
              minWidth: 0,
              overflow: "hidden"
            }}
          >
            <Typography
                gutterBottom
                variant="h6"
                component="div"
                style={{
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  width: "100%"
                }}
              >
                {activity.base.title}
                <ChevronRightIcon
                  className="card-chevron"
                  sx={{
                    fontSize: 18,
                    ml: "4px",
                    verticalAlign: "-3px",
                    color: "text.secondary",
                    transition: "transform 0.2s ease, color 0.2s ease"
                  }}
                />
              </Typography>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
              <ActivityTags activity={activity} />
            </div>
          </Box>
        </Link>
        <Box
          sx={{
            width: "270px",
            minWidth: "270px",
            padding: "12px",
            paddingLeft: "0px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            alignItems: "flex-start"
          }}
        >
          <Box sx={{ width: "100%", flex: 1, display: "flex", alignItems: "center" }}>
            <OccurrenceTime activity={activity} hideDetails />
          </Box>
          {isCloseBy && (
            <Stack direction="row" alignItems="center" gap={1}>
              {distance}
              {closeBy}
            </Stack>
          )}

          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ width: "100%" }}
          >
            <Stack direction="row" alignItems="center" gap={1}>
              {!isCloseBy && distance}
              {activity.id && <LikeButton activity={activity} />}
            </Stack>
            {activity.ratings && <RatingComponent rating={activity.ratings.rating} />}
          </Stack>
          {similarChip}
        </Box>
      </Card>

      {showSimilar && activity.similarActivities && activity.similarActivities.length > 0 && (
        <Paper
          elevation={0}
          sx={{
            padding: "8px",
            gap: "4px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            borderLeft: "3px solid",
            borderColor: "warning.main",
            backgroundColor: "rgba(255, 167, 38, 0.04)",
            ml: 1
          }}
        >
          <Chip
            label="Podobne wydarzenia"
            color="warning"
            size="small"
            variant="outlined"
            sx={{ mb: 1 }}
          />
          <Box
            sx={{
              width: "100%",
              maxHeight: { xs: "none", md: "430px" },
              overflowX: { xs: "auto", md: "hidden" },
              overflowY: { xs: "auto", md: "auto" },
              display: "flex",
              flexDirection: { xs: "row", md: "column" },
              gap: "8px"
            }}
          >
            {activity.similarActivities.map(a => (
              <Box
                key={a.id}
                sx={{
                  flexShrink: 0,
                  width: { xs: "350px", md: "100%" }
                }}
              >
                <EventCard activity={a} />
              </Box>
            ))}
          </Box>
          <Button size="small" onClick={() => setShowSimilar(false)} sx={{ mt: 1 }}>
            <Typography variant="body2" sx={{ mr: 1 }}>
              Zamknij podobne
            </Typography>
            <CloseIcon fontSize="small" />
          </Button>
        </Paper>
      )}
    </>
  )
}

export default React.memo(EventCard)
