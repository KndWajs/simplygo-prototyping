"use client"

import { Box, Chip, Stack, Typography } from "@mui/material"
import DeckIcon from "@mui/icons-material/Deck"
import EventIcon from "@mui/icons-material/Event"
import FavoriteIcon from "@mui/icons-material/Favorite"
import type { GetActivitiesQuery } from "models/domainDtos"
import { OccurrenceType } from "models/domainDtos"
import { updateUrlWithQuery } from "models/services/filters.service"
import { useNavigation } from "components/navigationProvider/navigationProvider"
import { usePathname } from "next/navigation"

interface PlacesSearchProps {
  query?: GetActivitiesQuery
}

export const PlacesSearch = ({ query }: PlacesSearchProps) => {
  const { replace } = useNavigation()
  const pathname = usePathname()

  const setType = (type?: OccurrenceType) => {
    updateUrlWithQuery({
      pathname,
      query: { ...query, occurrenceType: type } as never,
      navigate: replace
    })
  }

  const current = query?.occurrenceType

  return (
    <Box
      sx={{
        height: "100%",
        background: "linear-gradient(135deg, #ffffff, #f9f9f9)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        p: 3,
        textAlign: "center",
        color: "#333"
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: "#424242" }}>
        Szukasz miejsca, a nie wydarzenia?
      </Typography>
      <Typography
        variant="body2"
        sx={{ maxWidth: 320, color: "text.secondary", mb: 3, fontSize: 14, lineHeight: 1.4 }}
      >
        Wybierz, co chcesz zobaczyc:
      </Typography>
      <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center">
        <Chip
          icon={<FavoriteIcon />}
          label="Wszystko"
          onClick={() => setType(OccurrenceType.Both)}
          variant={current === OccurrenceType.Both ? "filled" : "outlined"}
          color={current === OccurrenceType.Both ? "primary" : "default"}
          sx={{ cursor: "pointer" }}
        />
        <Chip
          icon={<EventIcon />}
          label="Wydarzenia"
          onClick={() => setType(OccurrenceType.Events)}
          variant={current === OccurrenceType.Events ? "filled" : "outlined"}
          color={current === OccurrenceType.Events ? "primary" : "default"}
          sx={{ cursor: "pointer" }}
        />
        <Chip
          icon={<DeckIcon />}
          label="Miejsca"
          onClick={() => setType(OccurrenceType.OpeningHours)}
          variant={current === OccurrenceType.OpeningHours ? "filled" : "outlined"}
          color={current === OccurrenceType.OpeningHours ? "primary" : "default"}
          sx={{ cursor: "pointer" }}
        />
      </Stack>
    </Box>
  )
}
