"use client"

import { Box, Button, Card } from "@mui/material"
import type { ReactNode } from "react"

interface InfoCardProps {
  content: ReactNode
  onHideClick?: () => void
}

export function InfoCard({ content, onHideClick }: InfoCardProps) {
  return (
    <Card
      sx={{
        minWidth: "300px",
        minHeight: "300px",
        width: "100%",
        backgroundColor: "rgba(255,255,255,1)",
        borderRadius: "8px",
        border: "2px solid",
        borderColor: "primary.main",
        position: "relative"
      }}
      elevation={8}
    >
      {content}
      {onHideClick && (
        <Box
          sx={{
            position: "absolute",
            bottom: "4px",
            right: "8px",
            bgcolor: "transparent"
          }}
        >
          <Button
            onClick={onHideClick}
            size="small"
            variant="text"
            sx={{
              color: "text.secondary",
              fontSize: "0.75rem",
              textTransform: "none",
              minWidth: "auto",
              padding: "4px 8px",
              "&:hover": {
                bgcolor: "transparent",
                textDecoration: "underline"
              }
            }}
          >
            Nie pokazuj wiecej
          </Button>
        </Box>
      )}
    </Card>
  )
}
