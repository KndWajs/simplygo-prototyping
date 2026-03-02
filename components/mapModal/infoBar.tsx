"use client"

import { Alert, Box } from "@mui/material"

interface InfoBarProps {
  count: number
  hasMore: boolean
}

export function InfoBar({ count, hasMore }: InfoBarProps) {
  if (!hasMore || count <= 0) return null

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-evenly",
        alignItems: "center",
        marginBottom: "8px"
      }}
    >
      <Alert severity="info" sx={{ borderRadius: "8px", border: "solid 1px", zIndex: 2 }}>
        Za dużo wyników ({count}), przybliż mapę lub użyj filtrów.
      </Alert>
    </Box>
  )
}
