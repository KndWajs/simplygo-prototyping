"use client"

import { Box, Container, Typography } from "@mui/material"
import Image from "next/image"

// Replace undefined with a path like "/screenshots/switch.jpg" when ready
const SECTION_SCREENSHOT_SRC: string | undefined = undefined

const SWITCH_OPTIONS = [
  {
    label: "Wydarzenia",
    description: "Jednorazowe i cykliczne aktywności — koncerty, warsztaty, mecze.",
    accentColor: "#ff6b35"
  },
  {
    label: "Miejsca",
    description: "Stałe obiekty — kluby fitness, boiska, parki rozrywki, kina.",
    accentColor: "#ff8c5a"
  },
  {
    label: "Oba",
    description: "Pełny widok — wszystko razem w jednym przeszukiwaniu.",
    accentColor: "#ffaa7a"
  }
]

export function EventsPlacesSection() {
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
        {/* Section heading */}
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
            Jeden przełącznik
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
            Wydarzenia, miejsca{" "}
            <Box component="span" sx={{ color: "#ff6b35" }}>
              lub oba
            </Box>
          </Typography>
          <Typography
            sx={{
              color: "#6b7280",
              fontSize: { xs: "1rem", md: "1.1rem" },
              maxWidth: "520px",
              mx: "auto",
              lineHeight: 1.7
            }}
          >
            Jeden przełącznik decyduje o tym, co widzisz — jednorazowe wydarzenia, stałe miejsca albo wszystko naraz.
          </Typography>
        </Box>

        {/* Switch option pills */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: { xs: 2, md: 3 },
            mb: { xs: 4, md: 6 }
          }}
        >
          {SWITCH_OPTIONS.map((option) => (
            <Box
              key={option.label}
              sx={{
                flex: 1,
                padding: { xs: 3, md: "28px 32px" },
                backgroundColor: "rgba(255, 255, 255, 0.04)",
                border: `1px solid ${option.accentColor}33`,
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
                  backgroundColor: option.accentColor,
                  opacity: 0.6
                }
              }}
            >
              {/* Pill label mimicking app switch */}
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  px: 2,
                  py: 0.75,
                  borderRadius: "999px",
                  backgroundColor: `${option.accentColor}22`,
                  border: `1px solid ${option.accentColor}55`,
                  mb: 2
                }}
              >
                <Typography
                  sx={{
                    color: option.accentColor,
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    letterSpacing: "0.02em"
                  }}
                >
                  {option.label}
                </Typography>
              </Box>

              <Typography
                sx={{
                  color: "#9ca3af",
                  fontSize: { xs: "0.85rem", md: "0.9rem" },
                  lineHeight: 1.6
                }}
              >
                {option.description}
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
              alt="Podgląd przełącznika wydarzeń i miejsc w aplikacji"
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
