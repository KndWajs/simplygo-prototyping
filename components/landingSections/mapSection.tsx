"use client"

import { Box, Container, Typography } from "@mui/material"
import Image from "next/image"

// Replace undefined with a path like "/screenshots/map.jpg" when ready
const SECTION_SCREENSHOT_SRC: string | undefined = undefined

const MAP_FEATURES = [
  {
    label: "Widok mapy",
    description: "Przełącz się na mapę i od razu zobacz, co dzieje się w pobliżu — piny pokazują miejsca i wydarzenia.",
    accentColor: "#ff6b35"
  },
  {
    label: "Filtruj na mapie",
    description: "Wszystkie filtry działają też w trybie mapy — zmieniaj kategorię czy cechy i mapa odświeża się na bieżąco.",
    accentColor: "#ff8c5a"
  },
  {
    label: "Twoja lokalizacja",
    description: "Pozwól aplikacji znaleźć Cię automatycznie albo wybierz miasto ręcznie — mapa dopasuje się do Twojej okolicy.",
    accentColor: "#ffaa7a"
  }
]

export function MapSection() {
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
            Widok mapy
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
            Wszystko widać na{" "}
            <Box component="span" sx={{ color: "#ff6b35" }}>
              mapie
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
            Jeden przycisk przełącza listę na mapę — natychmiast widzisz, co jest blisko Ciebie, bez zbędnego szukania adresów.
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
          {MAP_FEATURES.map((feature) => (
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
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: "2px",
                  backgroundColor: feature.accentColor,
                  opacity: 0.6
                }
              }}
            >
              {/* Decorative dot */}
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  backgroundColor: feature.accentColor,
                  mb: 2,
                  boxShadow: `0 0 10px ${feature.accentColor}88`
                }}
              />

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
              alt="Podgląd widoku mapy w aplikacji"
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
