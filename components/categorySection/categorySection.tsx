"use client"

import { Box, Card, Container, Typography } from "@mui/material"
import SportsIcon from "@mui/icons-material/SportsBasketball"
import ChildCareIcon from "@mui/icons-material/ChildCare"
import TheaterIcon from "@mui/icons-material/TheaterComedy"
import { useRouter } from "next/navigation"
import { getAddressCookie, getHideShowAllModalCookie } from "models/services/cookies.service"
import { serializeFilters } from "models/services/filters.service"
import { DEFAULT_OCCURENCE_RANGE } from "models/OccurrenceDateRangeDto"
import { OrderByDto } from "models/OrderByDto"
import { DEFAULT_CITY } from "components/citySelector/citySelector"
import { useTransition } from "react"
import type { ReactNode } from "react"

interface Category {
  id: string
  label: string
  description: string
  icon: ReactNode
  color: string
}

const MAIN_CATEGORIES: Category[] = [
  {
    id: "1",
    label: "Rozrywka",
    description: "Koncerty, wystawy, festiwale, warsztaty i wiele więcej",
    icon: <TheaterIcon sx={{ fontSize: { xs: 40, md: 52 } }} />,
    color: "#ff6b35"
  },
  {
    id: "2",
    label: "Sport",
    description: "Zajęcia sportowe, siłownia, sporty wodne i drużynowe",
    icon: <SportsIcon sx={{ fontSize: { xs: 40, md: 52 } }} />,
    color: "#ff6b35"
  },
  {
    id: "3",
    label: "Dla dzieci",
    description: "Edukacja, zabawa, zajęcia kreatywne i wydarzenia rodzinne",
    icon: <ChildCareIcon sx={{ fontSize: { xs: 40, md: 52 } }} />,
    color: "#ff6b35"
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
          color: category.color
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
