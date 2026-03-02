"use client"

import { useState } from "react"
import { useAuth0 } from "@auth0/auth0-react"
import ThumbDownAltIcon from "@mui/icons-material/ThumbDownAlt"
import ThumbDownOffAltIcon from "@mui/icons-material/ThumbDownOffAlt"
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt"
import ThumbUpOffAltIcon from "@mui/icons-material/ThumbUpOffAlt"
import { IconButton, Stack, Tooltip, Typography } from "@mui/material"
import { QueryActivityDto } from "../../models/domainDtos"
import { useLikes } from "../auth/likesContext"
import { LoginPopup } from "../auth/loginPopup"

interface LikeButtonProps {
  activity: QueryActivityDto
}

export const LikeButton = ({ activity }: LikeButtonProps) => {
  const { isAuthenticated } = useAuth0()
  const { likedIds, dislikedIds, like, dislike, unlike } = useLikes()
  const [showLogin, setShowLogin] = useState(false)

  const isInLiked = activity.id ? likedIds.has(activity.id) : false
  const isInDisliked = activity.id ? dislikedIds.has(activity.id) : false

  const handleLike = () => {
    if (!isAuthenticated) {
      setShowLogin(true)
      return
    }
    if (!activity.id) return
    if (isInLiked) {
      unlike(activity.id)
    } else {
      like(activity.id)
    }
  }

  const handleDislike = () => {
    if (!isAuthenticated) {
      setShowLogin(true)
      return
    }
    if (!activity.id) return
    if (isInDisliked) {
      unlike(activity.id)
    } else {
      dislike(activity.id)
    }
  }

  return (
    <Stack direction="row" spacing="8px" alignItems="center">
      <Tooltip title={isInDisliked ? "jest ok" : "Nie polecam"} placement="top">
        <IconButton
          onClick={handleDislike}
          sx={{
            backgroundColor: "transparent !important",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            alignSelf: "center",
            gap: 0.5
          }}
        >
          {isInDisliked ? (
            <ThumbDownAltIcon sx={{ color: "text.secondary" }} />
          ) : (
            <ThumbDownOffAltIcon sx={{ color: "text.secondary" }} />
          )}
        </IconButton>
      </Tooltip>
      <Tooltip title={isInLiked ? "Usuń z ulubionych" : "Dodaj do ulubionych"} placement="top">
        <IconButton
          onClick={handleLike}
          sx={{
            backgroundColor: "transparent !important",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            alignSelf: "center",
            gap: 0.5
          }}
        >
          {isInLiked ? (
            <ThumbUpAltIcon sx={{ color: "text.secondary" }} />
          ) : (
            <ThumbUpOffAltIcon sx={{ color: "text.secondary" }} />
          )}
          <Typography variant="body2" color="text.secondary">
            {activity.ratings?.likesCount != 0 ? activity.ratings?.likesCount : ""}
          </Typography>
        </IconButton>
      </Tooltip>
      <LoginPopup open={showLogin} onClose={() => setShowLogin(false)} />
    </Stack>
  )
}
