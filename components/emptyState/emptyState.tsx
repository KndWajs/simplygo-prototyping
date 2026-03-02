import Activity from "@icons/activity.svg?react"
import { Box, Typography } from "@mui/material"

interface EmptyStateProps {
  title?: string
  description?: string
  minHeight?: string | number
}

export function EmptyState({
  title = "Brak Aktywności",
  description = "Nie znaleziono żadnych aktywności do wyświetlenia",
  minHeight = "400px"
}: EmptyStateProps) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: minHeight,
        p: 4,
        textAlign: "center"
      }}
    >
      <Box sx={{ position: "relative", mb: 3 }}>
        {/* Background circle with gradient */}
        <Box
          sx={{
            width: 96,
            height: 96,
            borderRadius: "50%",
            background:
              "linear-gradient(135deg, rgba(255, 107, 53, 0.1) 0%, rgba(153, 51, 255, 0.1) 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          {/* Icon with custom color, square size and block display for proper centering */}
          <Activity
            width={32}
            height={32}
            color="#ff6b35"
            style={{ display: "block", flexShrink: 0 }}
          />
        </Box>

        {/* Decorative elements */}
        <Box
          sx={{
            position: "absolute",
            top: -4,
            right: -4,
            width: 16,
            height: 16,
            borderRadius: "50%",
            bgcolor: "rgba(255, 183, 51, 0.3)"
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: -8,
            left: -8,
            width: 12,
            height: 12,
            borderRadius: "50%",
            bgcolor: "rgba(153, 51, 255, 0.3)"
          }}
        />
      </Box>

      <Typography
        variant="h6"
        sx={{
          color: "text.primary",
          mb: 1,
          fontWeight: 500
        }}
      >
        {title}
      </Typography>

      <Typography
        variant="body2"
        sx={{
          color: "text.secondary",
          maxWidth: "384px"
        }}
      >
        {description}
      </Typography>
    </Box>
  )
}
