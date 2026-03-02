import { Box, Button, Typography } from "@mui/material"
import Link from "next/link"

export default function NotFound() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        gap: 2,
        textAlign: "center",
        px: 2
      }}
    >
      <Typography
        variant="h1"
        sx={{ fontSize: { xs: "4rem", md: "6rem" }, fontWeight: 700, color: "text.disabled" }}
      >
        404
      </Typography>
      <Typography variant="h5" component="h1">
        Strona nie została znaleziona
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400 }}>
        Strona, której szukasz, nie istnieje lub została przeniesiona.
      </Typography>
      <Button component={Link} href="/" variant="contained" sx={{ mt: 2 }}>
        Wróć na stronę główną
      </Button>
    </Box>
  )
}
