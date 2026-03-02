"use client"

import TheaterComedyIcon from "@mui/icons-material/TheaterComedy"
import SportsIcon from "@mui/icons-material/Sports"
import ChildCareIcon from "@mui/icons-material/ChildCare"
import ArrowForwardIcon from "@mui/icons-material/ArrowForward"
import { Box, Card, Container, Typography } from "@mui/material"
import { DEFAULT_CITY } from "components/citySelector/citySelector"
import { getAddressCookie } from "models/services/cookies.service"
import { serializeFilters } from "models/services/filters.service"
import { DEFAULT_OCCURENCE_RANGE } from "models/OccurrenceDateRangeDto"
import { OrderByDto } from "models/OrderByDto"
import { useRouter } from "next/navigation"
import { useTransition, type ReactNode } from "react"

interface CategoryConfig {
  id: string
  label: string
  description: string
  icon: ReactNode
  accentColor: string
}

const CATEGORY_CONFIGS: CategoryConfig[] = [
  {
    id: "1",
    label: "Rozrywka",
    description: "Koncerty, teatr, wystawy, festiwale i życie nocne",
    icon: <TheaterComedyIcon sx={{ fontSize: { xs: 36, md: 48 } }} />,
    accentColor: "#ff6b35"
  },
  {
    id: "2",
    label: "Sport",
    description: "Sporty zespołowe, fitness, sztuki walki i aktywność na świeżym powietrzu",
    icon: <SportsIcon sx={{ fontSize: { xs: 36, md: 48 } }} />,
    accentColor: "#ff8c5a"
  },
  {
    id: "3",
    label: "Dla dzieci",
    description: "Warsztaty, place zabaw, przedstawienia i zajęcia rodzinne",
    icon: <ChildCareIcon sx={{ fontSize: { xs: 36, md: 48 } }} />,
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
        flex: 1,
        minWidth: { xs: "100%", md: 0 },
        padding: { xs: 3, md: 4 },
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: "20px",
        cursor: "pointer",
        transition: "all 0.3s ease",
        opacity: loading ? 0.6 : 1,
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          borderRadius: "20px",
          border: "1px solid transparent",
          background: `linear-gradient(135deg, ${config.accentColor}33, transparent) border-box`,
          WebkitMask: "linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "destination-out",
          maskComposite: "exclude",
          opacity: 0,
          transition: "opacity 0.3s ease"
        },
        "&:hover": {
          backgroundColor: `${config.accentColor}18`,
          borderColor: `${config.accentColor}66`,
          transform: "translateY(-6px)",
          boxShadow: `0 20px 40px ${config.accentColor}22`
        },
        "&:hover::before": {
          opacity: 1
        }
      }}
      className="no-select"
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "row", md: "column" },
          alignItems: { xs: "center", md: "flex-start" },
          gap: { xs: 2, md: 3 }
        }}
      >
        <Box
          sx={{
            width: { xs: 56, md: 72 },
            height: { xs: 56, md: 72 },
            minWidth: { xs: 56, md: 72 },
            borderRadius: "16px",
            backgroundColor: `${config.accentColor}22`,
            border: `1px solid ${config.accentColor}44`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: config.accentColor
          }}
        >
          {config.icon}
        </Box>

        <Box sx={{ flex: 1 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 1
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: "white",
                fontSize: { xs: "1.25rem", md: "1.5rem" }
              }}
            >
              {config.label}
            </Typography>
            <ArrowForwardIcon
              sx={{
                color: config.accentColor,
                fontSize: 20,
                opacity: 0.7,
                display: { xs: "none", md: "block" }
              }}
            />
          </Box>
          <Typography
            variant="body2"
            sx={{
              color: "#9ca3af",
              fontSize: { xs: "0.8rem", md: "0.9rem" },
              lineHeight: 1.6
            }}
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
  const [pendingId, startTransition] = useTransition()

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
            3 kategorie
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
            Wybierz{" "}
            <Box component="span" sx={{ color: "#ff6b35" }}>
              główną kategorię
            </Box>
          </Typography>
          <Typography
            sx={{
              color: "#6b7280",
              fontSize: { xs: "1rem", md: "1.1rem" },
              maxWidth: "480px",
              mx: "auto",
              lineHeight: 1.7
            }}
          >
            Znajdź aktywność dopasowaną do Twoich zainteresowań spośród setek dostępnych wydarzeń.
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: { xs: 2, md: 3 }
          }}
        >
          {CATEGORY_CONFIGS.map((config) => (
            <CategoryCard
              key={config.id}
              config={config}
              loading={false}
              onClick={() => handleCategoryClick(config.id)}
            />
          ))}
        </Box>
      </Container>
    </Box>
  )
}
