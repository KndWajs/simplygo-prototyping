"use client"

import MapIcon from "@mui/icons-material/Map"
import { Button, Typography } from "@mui/material"
import { useCallback } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import type { CategoryDto } from "../../models/dtos/GetCategoriesQueryResponse"
import type { TagDto } from "../../models/dtos/tagDto"
import type { Coordinates, GetActivitiesQuery } from "../../models/domainDtos"
import { MapModal } from "./mapModal"

interface MapButtonProps {
  query: GetActivitiesQuery
  categories?: CategoryDto[]
  tags?: TagDto[]
  userCoordinates?: Coordinates
}

export function MapButton({ query, categories, tags, userCoordinates }: MapButtonProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isOpen = searchParams.get("map") === "1"

  const open = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("map", "1")
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }, [router, pathname, searchParams])

  const close = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete("map")
    const qs = params.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }, [router, pathname, searchParams])

  return (
    <>
      <div className="map-icon">
        <Button
          size="small"
          title="Pokaż/Ukryj mapę"
          sx={{ display: { xs: "flex", gap: "8px" } }}
          onClick={open}
        >
          <MapIcon className="info-500" />
          <Typography variant="h6" className="info-500">
            Mapa
          </Typography>
        </Button>
      </div>
      <MapModal
        isOpen={isOpen}
        onClose={close}
        query={query}
        categories={categories}
        tags={tags}
        userCoordinates={userCoordinates}
      />
    </>
  )
}
