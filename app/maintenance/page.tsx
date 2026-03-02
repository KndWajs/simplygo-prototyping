"use client"

import { Box, CircularProgress, Container, Typography, Button } from "@mui/material"
import BuildIcon from "@mui/icons-material/Build"
import { useState } from "react"

export default function MaintenancePage() {
  const [loading, setLoading] = useState(false)

  const handleRefresh = () => {
    setLoading(true)
    window.location.href = "/wydarzenia"
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)"
      }}
    >
      <Container maxWidth="sm" sx={{ textAlign: "center" }}>
        <Box
          sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 2, mb: 3 }}
        >
          <BuildIcon sx={{ fontSize: 80, color: "#ff6b35" }} />
          <Typography
            sx={{
              fontFamily: "sans-serif",
              fontSize: "3.4rem",
              fontWeight: 750,
              color: "#ff6b35",
              userSelect: "none"
            }}
          >
            simplygo
          </Typography>
        </Box>
        <Typography variant="h3" sx={{ fontWeight: 700, color: "#fff", mb: 2 }}>
          Przerwa techniczna
        </Typography>
        <Typography variant="h6" sx={{ color: "#d1d5db", mb: 4, fontWeight: 400 }}>
          Przepraszamy, nasz serwer jest chwilowo niedostępny. Pracujemy nad przywróceniem usługi.
          Spróbuj ponownie za kilka minut.
        </Typography>
        <Button
          variant="contained"
          disabled={loading}
          onClick={handleRefresh}
          sx={{
            backgroundColor: "#ff6b35",
            "&:hover": { backgroundColor: "#e55a2b" },
            px: 4,
            py: 1.5,
            fontSize: "1rem"
          }}
        >
          {loading ? <CircularProgress size={24} sx={{ color: "#fff" }} /> : "Odśwież stronę"}
        </Button>
      </Container>
    </Box>
  )
}
