"use client"

import { Box, Container, Typography } from "@mui/material"


const SECTION_SCREENSHOT_SRC: string | undefined = undefined

const FILTER_FEATURES = [
  {
    label: "Wyszukiwarka tekstowa",
    description: "Wpisz nazwę, frazę lub słowo kluczowe i znajdź dokładnie to, co masz na myśli.",
    accentColor: "#ff6b35"
  },
  {
    label: "Cechy",
    description:
      'Filtruj po atrybutach miejsca lub wydarzenia: "dla dzieci", "bezpłatne", "na świeżym powietrzu", "dla par".',
    accentColor: "#ff8c5a"
  },
  {
    label: "Podkategorie",
    description:
      "Wybierz dokładnie to, czego szukasz — np. w Sporcie przełącz na Siłownię, Basen czy Bieganie.",
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
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: { xs: 6, md: 8 },
            alignItems: { md: "center" }
          }}
        >
          {/* Left: heading + feature cards */}
          <Box sx={{ flex: 1 }}>
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
                fontSize: { xs: "2rem", sm: "2.5rem", md: "2.75rem" },
                lineHeight: 1.2,
                mb: 1.5
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
                fontSize: { xs: "1rem", md: "1rem" },
                lineHeight: 1.7,
                mb: { xs: 4, md: 5 }
              }}
            >
              Wyszukiwarka tekstowa, cechy i podkategorie — trzy sposoby, żeby trafić dokładnie na to, co chcesz robić.
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {FILTER_FEATURES.map((feature, index) => (
                <Box
                  key={feature.label}
                  sx={{
                    padding: { xs: "16px 20px", md: "18px 24px" },
                    backgroundColor: "rgba(255, 255, 255, 0.04)",
                    border: `1px solid ${feature.accentColor}33`,
                    borderRadius: "14px",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 2,
                    position: "relative",
                    overflow: "hidden",
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: "3px",
                      backgroundColor: feature.accentColor,
                      opacity: 0.7
                    }
                  }}
                >
                  <Typography
                    sx={{
                      color: `${feature.accentColor}88`,
                      fontSize: "1.4rem",
                      fontWeight: 800,
                      lineHeight: 1,
                      flexShrink: 0,
                      minWidth: "2rem"
                    }}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </Typography>
                  <Box>
                    <Typography
                      sx={{ color: "white", fontWeight: 700, fontSize: "0.95rem", mb: 0.5 }}
                    >
                      {feature.label}
                    </Typography>
                    <Typography sx={{ color: "#9ca3af", fontSize: "0.85rem", lineHeight: 1.5 }}>
                      {feature.description}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Right: screenshot */}
          <Box
            sx={{
              flex: 1,
              borderRadius: "16px",
              overflow: "hidden",
              border: "1px solid rgba(255, 107, 53, 0.2)",
              backgroundColor: "rgba(255,255,255,0.03)",
              aspectRatio: { xs: "16/9", md: "9/16" },
              maxHeight: { md: "480px" },
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              flexShrink: 0,
              width: { md: "44%" }
            }}
          >
            {SECTION_SCREENSHOT_SRC ? (
              <img
                src={SECTION_SCREENSHOT_SRC}
                alt="Podgląd filtrów i wyszukiwarki w aplikacji"
                style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }}
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
        </Box>
      </Container>
    </Box>
  )
}
