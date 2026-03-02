"use client"

import CheckIcon from "@mui/icons-material/Check"
import ThumbUpOffAltIcon from "@mui/icons-material/ThumbUpOffAlt"
import { Box, Button } from "@mui/material"
import { useState } from "react"
import { useAuth0 } from "@auth0/auth0-react"
import { useLikes } from "../auth/likesContext"
import { LoginPopup } from "../auth/loginPopup"

interface AddToListButtonProps {
  activityId?: string
}

export function AddToListButton({ activityId }: AddToListButtonProps) {
  const { isAuthenticated } = useAuth0()
  const { likedIds, like, unlike } = useLikes()
  const [showLogin, setShowLogin] = useState(false)

  const isLiked = activityId ? likedIds.has(activityId) : false

  const handleClick = () => {
    if (!isAuthenticated) {
      setShowLogin(true)
      return
    }
    if (!activityId) return
    if (isLiked) {
      unlike(activityId)
    } else {
      like(activityId)
    }
  }

  return (
    <>
      {/* Desktop */}
      <Box sx={{ display: { xs: "none", md: "flex" }, justifyContent: "center", alignItems: "center", width: "100%", flex: 1 }}>
        <Button
          variant={isLiked ? "contained" : "outlined"}
          startIcon={isLiked ? <CheckIcon /> : <ThumbUpOffAltIcon />}
          onClick={handleClick}
          sx={{
            borderColor: "#ff6b35",
            color: isLiked ? "white" : "#ff6b35",
            backgroundColor: isLiked ? "#ff6b35" : "transparent",
            "&:hover": {
              borderColor: "#e55a2b",
              backgroundColor: isLiked ? "#e55a2b" : "rgba(255, 107, 53, 0.08)"
            }
          }}
        >
          {isLiked ? "Dodano do listy" : "Dodaj do listy"}
        </Button>
      </Box>

      {/* Mobile sticky bottom */}
      <Box
        sx={{
          display: { xs: "flex", md: "none" },
          position: "fixed",
          bottom: 20,
          left: "50%",
          transform: "translateX(-50%)",
          width: "auto",
          zIndex: 10
        }}
      >
        <Button
          variant="contained"
          startIcon={isLiked ? <CheckIcon /> : <ThumbUpOffAltIcon />}
          onClick={handleClick}
          sx={{
            borderRadius: "28px",
            px: 4,
            py: 1,
            fontSize: "0.875rem",
            color: "white",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            backgroundColor: isLiked ? "#e55a2b" : "#ff6b35",
            "&:hover": {
              backgroundColor: isLiked ? "#d14a1b" : "#e55a2b"
            }
          }}
        >
          {isLiked ? "Dodano do listy" : "Dodaj do listy"}
        </Button>
      </Box>

      <LoginPopup open={showLogin} onClose={() => setShowLogin(false)} />
    </>
  )
}
