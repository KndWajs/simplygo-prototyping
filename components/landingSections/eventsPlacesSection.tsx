"use client"

import { Box, Container, Typography } from "@mui/material"
import Image from "next/image"

const SECTION_SCREENSHOT_SRC: string | undefined = undefined

const SWITCH_OPTIONS = [
  {
    label: "Wydarzenia",
    description: "Jednorazowe i cykliczne aktywności — koncerty, warsztaty, mecze.",
    accentColor: "#ff6b35",
    iconSrc: "/event_ico_ev.png"
  },
  {
    label: "Miejsca",
    description: "Stałe obiekty — kluby fitness, boiska, parki rozrywki, kina.",
    accentColor: "#ff8c5a",
    iconSrc: "/event_ico_pl.png"
  },
  {
    label: "Wszystko",
    description: "Pełny widok — wszystko razem w jednym przeszukiwaniu.",
    accentColor: "#ffaa7a",
    iconSrc: null
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
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: { xs: 6, md: 8 },
            alignItems: { md: "center" }
          }}
        >
          {/* Left: heading + option cards */}
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
              Jeden przełącznik
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
              Wydarzenia, miejsca{" "}
              <Box component="span" sx={{ color: "#ff6b35" }}>
                lub wszystko
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
              Jeden przełącznik decyduje o tym, co widzisz — jednorazowe wydarzenia, stałe miejsca albo wszystko naraz.
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {SWITCH_OPTIONS.map((option) => (
                <Box
                  key={option.label}
                  sx={{
                    padding: { xs: "16px 20px", md: "18px 24px" },
                    backgroundColor: "rgba(255, 255, 255, 0.04)",
                    border: `1px solid ${option.accentColor}33`,
                    borderRadius: "14px",
                    display: "flex",
                    alignItems: "center",
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
                      backgroundColor: option.accentColor,
                      opacity: 0.7
                    }
                  }}
                >
                  <Box
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 0.75,
                      px: 1.5,
                      py: 0.5,
                      borderRadius: "999px",
                      backgroundColor: `${option.accentColor}22`,
                      border: `1px solid ${option.accentColor}55`,
                      flexShrink: 0
                    }}
                  >
                    {option.iconSrc && (
                      <Image
                        src={option.iconSrc}
                        alt=""
                        width={18}
                        height={18}
                        style={{ borderRadius: "4px" }}
                      />
                    )}
                    <Typography
                      sx={{
                        color: option.accentColor,
                        fontWeight: 700,
                        fontSize: "0.8rem",
                        whiteSpace: "nowrap"
                      }}
                    >
                      {option.label}
                    </Typography>
                  </Box>
                  <Typography
                    sx={{ color: "#9ca3af", fontSize: "0.85rem", lineHeight: 1.5 }}
                  >
                    {option.description}
                  </Typography>
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
              <Image
                src={SECTION_SCREENSHOT_SRC}
                alt="Podgląd przełącznika wydarzeń i miejsc w aplikacji"
                fill
                style={{ objectFit: "cover", objectPosition: "top" }}
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
