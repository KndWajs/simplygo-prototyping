"use client"

import { Box, Card, Container, Typography } from "@mui/material"
import { useRouter } from "next/navigation"
import { getAddressCookie } from "models/services/cookies.service"
import { serializeFilters } from "models/services/filters.service"
import { DEFAULT_OCCURENCE_RANGE } from "models/OccurrenceDateRangeDto"
import { OrderByDto } from "models/OrderByDto"
import { DEFAULT_CITY } from "components/citySelector/citySelector"
import { useTransition } from "react"
import type { ReactNode } from "react"

// Inline SVGs to avoid importing @mui/icons-material in a second client boundary
function TheaterSvg() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18 3a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3h12zm-5.5 9.5a4.5 4.5 0 0 1-4.472 4H8a4 4 0 0 0 8 0h-.028A4.5 4.5 0 0 1 12.5 12.5zm-4-5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm5 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z" />
    </svg>
  )
}

function SportsSvg() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM7.07 18.28c.43-.9 3.05-1.78 4.93-1.78s4.51.88 4.93 1.78C15.57 19.36 13.86 20 12 20s-3.57-.64-4.93-1.72zm11.29-1.45c-1.43-1.74-4.9-2.33-6.36-2.33s-4.93.59-6.36 2.33A7.95 7.95 0 0 1 4 12c0-4.41 3.59-8 8-8s8 3.59 8 8c0 1.82-.62 3.49-1.64 4.83zM12 6c-1.94 0-3.5 1.56-3.5 3.5S10.06 13 12 13s3.5-1.56 3.5-3.5S13.94 6 12 6zm0 5c-.83 0-1.5-.67-1.5-1.5S11.17 8 12 8s1.5.67 1.5 1.5S12.83 11 12 11z" />
    </svg>
  )
}

function KidsSvg() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm9 7h-6v13h-2v-6h-2v6H9V9H3V7h18v2z" />
    </svg>
  )
}

interface Category {
  id: string
  label: string
  description: string
  icon: ReactNode
}

const MAIN_CATEGORIES: Category[] = [
  {
    id: "1",
    label: "Rozrywka",
    description: "Koncerty, wystawy, festiwale, warsztaty i wiele więcej",
    icon: <TheaterSvg />
  },
  {
    id: "2",
    label: "Sport",
    description: "Zajęcia sportowe, siłownia, sporty wodne i drużynowe",
    icon: <SportsSvg />
  },
  {
    id: "3",
    label: "Dla dzieci",
    description: "Edukacja, zabawa, zajęcia kreatywne i wydarzenia rodzinne",
    icon: <KidsSvg />
  }
]

function CategoryCard({ category, onClick, loading }: { category: Category; onClick: () => void; loading: boolean }) {
  return (
    <Card
      onClick={onClick}
      sx={{
        flex: 1,
        minWidth: { xs: "100%", sm: 0 },
        padding: { xs: 3, md: 4 },
        backgroundColor: "rgba(255, 255, 255, 0.04)",
        border: "1px solid rgba(255, 107, 53, 0.2)",
        borderRadius: "20px",
        cursor: loading ? "default" : "pointer",
        transition: "all 0.3s ease",
        opacity: loading ? 0.6 : 1,
        "&:hover": {
          backgroundColor: "rgba(255, 107, 53, 0.1)",
          borderColor: "#ff6b35",
          transform: loading ? "none" : "translateY(-6px)",
          boxShadow: "0 12px 40px rgba(255, 107, 53, 0.15)"
        },
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
        textAlign: "center"
      }}
      className="no-select"
    >
      <Box
        sx={{
          width: { xs: 64, md: 80 },
          height: { xs: 64, md: 80 },
          borderRadius: "50%",
          backgroundColor: "rgba(255, 107, 53, 0.12)",
          border: "1px solid rgba(255, 107, 53, 0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#ff6b35"
        }}
      >
        {category.icon}
      </Box>
      <Typography
        variant="h5"
        sx={{
          fontWeight: 700,
          color: "white",
          fontSize: { xs: "1.25rem", md: "1.5rem" }
        }}
      >
        {category.label}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          color: "#9ca3af",
          fontSize: { xs: "0.875rem", md: "0.95rem" },
          lineHeight: 1.6
        }}
      >
        {category.description}
      </Typography>
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
        backgroundColor: "#0a0a0a",
        py: { xs: 8, md: 12 }
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: "center", mb: { xs: 6, md: 8 } }}>
          <Typography
            variant="overline"
            sx={{
              color: "#ff6b35",
              fontWeight: 600,
              letterSpacing: "0.15em",
              fontSize: "0.8rem",
              display: "block",
              mb: 1.5
            }}
          >
            3 kategorie
          </Typography>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 700,
              color: "white",
              fontSize: { xs: "1.9rem", sm: "2.5rem", md: "3rem" },
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
            variant="body1"
            sx={{
              color: "#9ca3af",
              fontSize: { xs: "1rem", md: "1.1rem" },
              maxWidth: "560px",
              mx: "auto",
              lineHeight: 1.6
            }}
          >
            Przeglądaj aktywności według tego, co Cię interesuje — rozrywka, sport lub zajęcia dla najmłodszych.
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: { xs: 3, md: 4 },
            alignItems: "stretch"
          }}
        >
          {MAIN_CATEGORIES.map(category => (
            <CategoryCard
              key={category.id}
              category={category}
              onClick={() => handleCategoryClick(category.id)}
              loading={false}
            />
          ))}
        </Box>
      </Container>
    </Box>
  )
}
