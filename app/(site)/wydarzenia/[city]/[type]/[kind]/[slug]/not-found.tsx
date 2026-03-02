import { Box, Button, Typography } from "@mui/material"
import Link from "next/link"

export default function ActivityNotFound() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "50vh",
        gap: 2,
        textAlign: "center",
        px: 2
      }}
    >
      <Typography variant="h4" component="h1">
        Nie znaleziono aktywności
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Aktywność, której szukasz, nie istnieje lub została usunięta.
      </Typography>
      <Button component={Link} href="/wydarzenia" variant="contained" sx={{ mt: 2 }}>
        Wróć do wydarzeń
      </Button>
    </Box>
  )
}
