"use client"

import CloseIcon from "@mui/icons-material/Close"
import { Box, IconButton } from "@mui/material"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export function CloseButton() {
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const handleBack = () => {
    const isInternalNav = sessionStorage.getItem("sg_internal_nav")
    sessionStorage.removeItem("sg_internal_nav")
    if (isInternalNav) {
      router.back()
    } else {
      router.push("/wydarzenia")
    }
  }

  return (
    <Box
      sx={{
        position: { xs: "fixed", md: "static" },
        right: { xs: 8, md: "auto" },
        top: { xs: scrolled ? 8 : 61, md: "auto" },
        transition: "top 0.2s ease",
        zIndex: 10,
        marginLeft: "auto"
      }}
    >
      <IconButton
        onClick={handleBack}
        sx={{
          width: 36,
          height: 36,
          backgroundColor: "rgba(255, 255, 255, 0.9) !important",
          "&:hover": {
            backgroundColor: "rgba(255, 255, 255, 1) !important"
          }
        }}
      >
        <CloseIcon sx={{ color: "text.primary" }} />
      </IconButton>
    </Box>
  )
}
