"use client"

import AutoAwesome from "@mui/icons-material/AutoAwesome"
import Explore from "@mui/icons-material/Explore"
import { Card, CircularProgress, Stack, Typography } from "@mui/material"
import { ShowAllModal } from "components/ctaButtons/showAllModal"
import { AISearchModal } from "components/searchBar/aiSearchModal"
import type { CategoryDto } from "models/dtos/GetCategoriesQueryResponse"
import { getAddressCookie, getHideShowAllModalCookie } from "models/services/cookies.service"
import { serializeFilters } from "models/services/filters.service"
import { DEFAULT_OCCURENCE_RANGE } from "models/OccurrenceDateRangeDto"
import { OrderByDto } from "models/OrderByDto"
import { DEFAULT_CITY } from "components/citySelector/citySelector"
import { useRouter } from "next/navigation"
import { type ReactNode, useState, useTransition } from "react"

interface CtaButtonsProps {
  categories: CategoryDto[]
}

const cardSx = {
  flex: 1,
  width: { xs: "300px", md: "280px" },
  height: { xs: "95px", md: "180px" },
  minHeight: { xs: "95px", md: "180px" },
  padding: { xs: 2, md: 3 },
  backgroundColor: "rgba(255, 255, 255, 0.08)",
  backdropFilter: "blur(8px)",
  border: "1px solid rgba(255, 107, 53, 0.3)",
  borderRadius: "16px",
  cursor: "pointer",
  transition: "all 0.3s ease",
  "&:hover": {
    backgroundColor: "rgba(255, 107, 53, 0.15)",
    borderColor: "#ff6b35",
    transform: "translateY(-4px)"
  },
  display: "flex",
  flexDirection: { xs: "row", md: "column" },
  alignItems: "center",
  justifyContent: "flex-start",
  gap: "16px"
}

function Tile({
  icon,
  title,
  description,
  onClick,
  loading
}: {
  icon: ReactNode
  title: string
  description: string
  onClick: () => void
  loading?: boolean
}) {
  return (
    <Card onClick={onClick} sx={{ ...cardSx, opacity: loading ? 0.7 : 1 }} className="no-select">
      {loading ? <CircularProgress size={40} sx={{ color: "#ff6b35" }} /> : icon}
      <Stack
        sx={{
          display: "flex",
          alignItems: { xs: "flex-start", md: "center" },
          flexDirection: "column"
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            mb: 1,
            color: "white"
          }}
        >
          {title}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: "#d1d5db",
            fontSize: "0.875rem",
            textAlign: { xs: "left", md: "center" }
          }}
        >
          {description}
        </Typography>
      </Stack>
    </Card>
  )
}

export function CtaButtons({ categories }: CtaButtonsProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [aiSearchOpen, setAiSearchOpen] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [showAllOpen, setShowAllOpen] = useState(false)

  const buildCityUrl = (path: string) => {
    const address = getAddressCookie()
    const city = address?.streetAddress ?? DEFAULT_CITY.label
    const coords = address?.coordinates ?? DEFAULT_CITY.coordinates
    const params = serializeFilters({
      orderBy: OrderByDto.Recommended,
      dateRange: DEFAULT_OCCURENCE_RANGE,
      pageNumber: 1,
      pageSize: 10,
      region: { city, country: "Poland" },
      coordinates: coords
    })
    params.sort()
    return `${path}?${params.toString()}`
  }

  const handleShowAll = () => {
    if (getHideShowAllModalCookie()) {
      startTransition(() => {
        router.push(buildCityUrl("/wydarzenia"))
      })
      return
    }
    setShowAllOpen(true)
  }

  return (
    <Stack
      direction={{ xs: "column", md: "row" }}
      spacing={3}
      sx={{ mb: { xs: "32px", md: "64px" }, justifyContent: "center", alignItems: "center" }}
    >
      <Tile
        icon={<AutoAwesome sx={{ fontSize: 40, color: "#ff6b35" }} />}
        title="Napisz, czego szukasz"
        description="AI ustawi filtry za Ciebie"
        loading={aiLoading}
        onClick={() => setAiSearchOpen(true)}
      />
      <Tile
        icon={<Explore sx={{ fontSize: 40, color: "#ff6b35" }} />}
        title="Pokaż wszystko"
        description="Filtruj i sortuj po swojemu"
        loading={isPending}
        onClick={handleShowAll}
      />
      <AISearchModal
        open={aiSearchOpen}
        onClose={() => setAiSearchOpen(false)}
        onNavigate={() => setAiLoading(true)}
        targetPathname="/wydarzenia"
      />
      <ShowAllModal
        open={showAllOpen}
        onClose={() => setShowAllOpen(false)}
        categories={categories}
      />
    </Stack>
  )
}
