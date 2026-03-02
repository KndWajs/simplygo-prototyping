"use client"

import ArrowForwardIcon from "@mui/icons-material/ArrowForward"
import { Box, Card, Container, Typography } from "@mui/material"
import { DEFAULT_CITY } from "components/citySelector/citySelector"
import { getAddressCookie } from "models/services/cookies.service"
import { serializeFilters } from "models/services/filters.service"
import { DEFAULT_OCCURENCE_RANGE } from "models/OccurrenceDateRangeDto"
import { OrderByDto } from "models/OrderByDto"
import { useRouter } from "next/navigation"

import { useTransition } from "react"

const SECTION_SCREENSHOT_SRC: string | undefined = "/screenshots/categories.png"

interface CategoryConfig {
  id: string
  label: string
  description: string
  iconSrc: string
  accentColor: string
}

const CATEGORY_CONFIGS: CategoryConfig[] = [
  {
    id: "1",
    label: "Rozrywka",
    description: "Koncerty, teatr, wystawy, festiwale i życie nocne",
    iconSrc: "/event_ico_2.png",
    accentColor: "#ff6b35"
  },
  {
    id: "2",
    label: "Sport",
    description: "Sporty zespołowe, fitness, sztuki walki i aktywność na świeżym powietrzu",
    iconSrc: "/sport_ico_2.png",
    accentColor: "#ff8c5a"
  },
  {
    id: "3",
    label: "Dla dzieci",
    description: "Warsztaty, place zabaw, przedstawienia i zajęcia rodzinne",
    iconSrc: "/kids_ico_2.png",
    accentColor: "#ffaa7a"
  }
]

function CategoryCard({
  config,
  onClick,
  loading
}: {
  config: CategoryConfig
  onClick: () => void
  loading: boolean
}) {
  return (
    <Card
      onClick={onClick}
      sx={{
        padding: { xs: 2.5, md: 3 },
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: "16px",
        cursor: "pointer",
        transition: "all 0.3s ease",
        opacity: loading ? 0.6 : 1,
        position: "relative",
        overflow: "hidden",
        "&:hover": {
          backgroundColor: `${config.accentColor}18`,
          borderColor: `${config.accentColor}66`,
          transform: "translateX(4px)",
          boxShadow: `0 8px 24px ${config.accentColor}22`
        }
      }}
      className="no-select"
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <img
          src={config.iconSrc}
          alt={config.label}
          width={44}
          height={44}
          style={{ borderRadius: "10px", flexShrink: 0 }}
        />
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Typography
              variant="h5"
              sx={{ fontWeight: 700, color: "white", fontSize: { xs: "1.1rem", md: "1.2rem" } }}
            >
              {config.label}
            </Typography>
            <ArrowForwardIcon sx={{ color: config.accentColor, fontSize: 18, opacity: 0.7 }} />
          </Box>
          <Typography
            variant="body2"
            sx={{ color: "#9ca3af", fontSize: "0.82rem", lineHeight: 1.5, mt: 0.25 }}
          >
            {config.description}
          </Typography>
        </Box>
      </Box>
    </Card>
  )
}

export function CategorySection() {
  const router = useRouter()
  const [, startTransition] = useTransition()

  const buildCategoryUrl = (categoryId: string) => {
    const address = getAddressCookie()
    const city = address?.streetAddress ?? DEFAULT_CITY.label
    const coords = address?.coordinates ?? DEFAULT_CITY.coordinates
    const params = serializeFilters({
      orderBy: OrderByDto.Recommended,
      dateRange: DEFAULT_OCCURENCE_RANGE,
      pageNumber: 1,
      pageSize: 10,
      region: { city, country: "Poland" },
      coordinates: coords,
      categoryIds: [categoryId]
    })
    params.sort()
    return `/wydarzenia?${params.toString()}`
  }

  const handleCategoryClick = (categoryId: string) => {
    startTransition(() => {
      router.push(buildCategoryUrl(categoryId))
    })
  }

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
        {/* Two-column layout on desktop */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: { xs: 6, md: 8 },
            alignItems: { md: "center" }
          }}
        >
          {/* Left: heading + cards */}
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
              3 kategorie
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
              Wybierz{" "}
              <Box component="span" sx={{ color: "#ff6b35" }}>
                główną kategorię
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
              Znajdź aktywność dopasowaną do Twoich zainteresowań spośród setek dostępnych wydarzeń.
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {CATEGORY_CONFIGS.map((config) => (
                <CategoryCard
                  key={config.id}
                  config={config}
                  loading={false}
                  onClick={() => handleCategoryClick(config.id)}
                />
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
              maxHeight: { md: "520px" },
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              flexShrink: 0,
              width: { md: "44%" },
              boxShadow: "0 40px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,107,53,0.08)",
              "&::after": {
                content: '""',
                position: "absolute",
                inset: 0,
                background: "linear-gradient(to bottom, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.03) 70%, rgba(5,5,5,0.55) 100%)",
                pointerEvents: "none",
                zIndex: 1
              }
            }}
          >
            {SECTION_SCREENSHOT_SRC ? (
              <img
                src={SECTION_SCREENSHOT_SRC}
                alt="Podgląd wyboru kategorii w aplikacji"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "top",
                  filter: "contrast(0.94) brightness(1.04)",
                  display: "block"
                }}
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
