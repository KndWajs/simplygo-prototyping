"use client"

import { Box, Container, Typography } from "@mui/material"
import Image from "next/image"

// Replace undefined with a path like "/screenshots/filters.jpg" when ready
const SECTION_SCREENSHOT_SRC: string | undefined = undefined

const FILTER_FEATURES = [
  {
    label: "Podkategorie",
    description:
      "Wybierz dokładnie to, czego szukasz — np. w Sporcie przełącz na Siłownię, Basen czy Bieganie.",
    accentColor: "#ff6b35"
  },
  {
    label: "Cechy",
    description:
      'Filtruj po atrybutach miejsca lub wydarzenia: "dla dzieci", "bezpłatne", "na świeżym powietrzu", "dla par".',
    accentColor: "#ff8c5a"
  },
  {
    label: "Wyszukiwarka tekstowa",
    description: "Wpisz nazwę, frazę lub słowo kluczowe i znajdź dokładnie to, co masz na myśli.",
    accentColor: "#ffaa7a"
  }
]

export function FiltersSection() {
  return (
    <Box
      component="section"
      sx={{
        backgroundColor: "#050505",
        py: { xs: 8, md: 12 },
        borderTop: "1px solid rgba(255,255,255,0.06)"
      }}
    >
      <Container maxWidth="lg">
        {/* Heading */}
        <Box sx={{ textAlign: "center", mb: { xs: 6, md: 8 } }}>
          <Typography
            variant="overline"
            sx={{
              color: "#ff6b35",
              letterSpacing: "0.15em",
              fontWeight: 600,
              fontSize: "0.75rem",
              mb: 1.5,
              display: "block"
            }}
          >
            Precyzyjne filtry
          </Typography>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 700,
              color: "white",
              fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
              lineHeight: 1.2,
              mb: 2
            }}
          >
            Znajdź to, czego{" "}
            <Box component="span" sx={{ color: "#ff6b35" }}>
              szukasz
            </Box>
          </Typography>
          <Typography
            sx={{
              color: "#6b7280",
              fontSize: { xs: "1rem", md: "1.1rem" },
              maxWidth: "540px",
              mx: "auto",
              lineHeight: 1.7
            }}
          >
            Podkategorie, cechy i wyszukiwarka tekstowa — trzy sposoby, żeby trafić dokładnie na to, co chcesz robić.
          </Typography>
        </Box>

        {/* Feature cards */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: { xs: 2, md: 3 },
            mb: { xs: 4, md: 6 }
          }}
        >
          {FILTER_FEATURES.map((feature, index) => (
            <Box
              key={feature.label}
              sx={{
                flex: 1,
                padding: { xs: 3, md: "28px 32px" },
                backgroundColor: "rgba(255, 255, 255, 0.04)",
                border: `1px solid ${feature.accentColor}33`,
                borderRadius: "16px",
                position: "relative",
                overflow: "hidden",
                "&::after": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "2px",
                  backgroundColor: feature.accentColor,
                  opacity: 0.6
                }
              }}
            >
              {/* Step number */}
              <Typography
                sx={{
                  color: `${feature.accentColor}55`,
                  fontSize: "2.5rem",
                  fontWeight: 800,
                  lineHeight: 1,
                  mb: 1.5,
                  userSelect: "none"
                }}
              >
                {String(index + 1).padStart(2, "0")}
              </Typography>

              <Typography
                sx={{
                  color: "white",
                  fontWeight: 700,
                  fontSize: { xs: "1rem", md: "1.1rem" },
                  mb: 1
                }}
              >
                {feature.label}
              </Typography>

              <Typography
                sx={{
                  color: "#9ca3af",
                  fontSize: { xs: "0.85rem", md: "0.9rem" },
                  lineHeight: 1.6
                }}
              >
                {feature.description}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Single section screenshot */}
        <Box
          sx={{
            borderRadius: "16px",
            overflow: "hidden",
            border: "1px solid rgba(255, 107, 53, 0.2)",
            backgroundColor: "rgba(255,255,255,0.03)",
            aspectRatio: "16/9",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative"
          }}
        >
          {SECTION_SCREENSHOT_SRC ? (
            <Image
              src={SECTION_SCREENSHOT_SRC}
              alt="Podgląd filtrów i wyszukiwarki w aplikacji"
              fill
              style={{ objectFit: "cover" }}
            />
          ) : (
            <Typography
              sx={{
                color: "rgba(255, 107, 53, 0.4)",
                fontSize: "0.75rem",
                fontWeight: 500,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                userSelect: "none"
              }}
            >
              Zrzut ekranu
            </Typography>
          )}
        </Box>
      </Container>
    </Box>
  )
}
