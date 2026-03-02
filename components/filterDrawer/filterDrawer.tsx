"use client"

import CloseIcon from "@mui/icons-material/Close"
import TuneIcon from "@mui/icons-material/Tune"
import { Box, Button, CircularProgress, Drawer, IconButton, Typography } from "@mui/material"
import { Filters } from "components/filters/filters"
import { useNavigation } from "components/navigationProvider/navigationProvider"
import type { GetActivitiesQuery } from "models/domainDtos"
import type { CategoryDto } from "models/dtos/GetCategoriesQueryResponse"
import type { TagDto } from "models/dtos/tagDto"
import { updateUrlWithQuery } from "models/services/filters.service"
import { usePathname } from "next/navigation"
import React from "react"

interface FilterDrawerProps {
  query: GetActivitiesQuery
  categories?: CategoryDto[]
  tags?: TagDto[]
}

export function FilterDrawer({ query, categories, tags }: FilterDrawerProps) {
  const { replace, isPending } = useNavigation()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = React.useState(false)
  const [draftQuery, setDraftQuery] = React.useState(query)
  const wasPendingRef = React.useRef(false)

  React.useEffect(() => {
    setDraftQuery(query)
  }, [query])

  React.useEffect(() => {
    if (wasPendingRef.current && !isPending) {
      setIsOpen(false)
    }
    wasPendingRef.current = isPending
  }, [isPending])

  const applyFilters = () => {
    updateUrlWithQuery({
      pathname,
      query: draftQuery,
      navigate: replace
    })
  }

  return (
    <>
      <Button
        component="nav"
        variant="text"
        sx={{ display: { xs: "flex", md: "none", gap: "8px" } }}
        onClick={() => setIsOpen(true)}
      >
        <TuneIcon className="primary-500" />
        <Typography variant="h6" className="primary-500">
          Filtruj
        </Typography>
      </Button>

      <Drawer
        anchor="right"
        open={isOpen}
        onClose={() => setIsOpen(false)}
        style={{ zIndex: 1300 }}
      >
        <IconButton sx={{ alignSelf: "flex-end", m: 1 }} onClick={() => setIsOpen(false)}>
          <CloseIcon />
        </IconButton>

        <Box sx={{ px: 3, width: "100%" }}>
          <Filters
            query={draftQuery}
            categories={categories}
            tags={tags}
            onQueryChange={setDraftQuery}
          />
        </Box>

        <Box sx={{ flex: 1 }} />

        <Box
          sx={{
            px: 3,
            pb: 2,
            pt: 2,
            bottom: 0,
            position: "sticky",
            width: "100%",
            background: "white",
            zIndex: 5,
            mt: 4,
            boxShadow: "0 -1px 2px rgba(0,0,0,0.1)"
          }}
        >
          <Button
            variant="contained"
            color="primary"
            onClick={applyFilters}
            disabled={isPending}
            fullWidth
          >
            {isPending ? <CircularProgress size={24} color="inherit" /> : "Zastosuj filtry"}
          </Button>
        </Box>
      </Drawer>
    </>
  )
}
