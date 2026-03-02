"use client"

import { Box, CircularProgress } from "@mui/material"
import { useNavigation } from "components/navigationProvider/navigationProvider"
import type { ReactNode } from "react"

export function LoadingOverlay({ children }: { children: ReactNode }) {
  const { isPending } = useNavigation()

  return (
    <Box sx={{ position: "relative" }}>
      {isPending && (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            zIndex: 20,
            display: "flex",
            justifyContent: "center",
            pt: 8,
            backgroundColor: "rgba(255, 255, 255, 0.7)"
          }}
        >
          <CircularProgress size={40} />
        </Box>
      )}
      {children}
    </Box>
  )
}
