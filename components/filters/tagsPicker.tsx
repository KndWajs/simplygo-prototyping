"use client"

import { Box, Chip, Divider, Typography } from "@mui/material"
import type { GetActivitiesQuery } from "models/domainDtos"
import type { TagDto } from "models/dtos/tagDto"
import { getTagType, getTagLabel, TagType } from "models/dtos/tagDto"
import { updateUrlWithQuery } from "models/services/filters.service"
import { useNavigation } from "components/navigationProvider/navigationProvider"
import { usePathname } from "next/navigation"
import { useMemo } from "react"

interface TagGroup {
  type: TagType
  label: string
  tags: TagDto[]
}

interface TagsPickerProps {
  tags: TagDto[]
  query: GetActivitiesQuery
  onQueryChange?: (q: GetActivitiesQuery) => void
}

export function TagsPicker({ tags, query, onQueryChange }: TagsPickerProps) {
  const { replace } = useNavigation()
  const pathname = usePathname()

  const groups: TagGroup[] = useMemo(() => {
    return [TagType.Vibe, TagType.Social, TagType.Role]
      .map(type => ({
        type,
        label: getTagLabel(type),
        tags: tags.filter(t => getTagType(t.id) === type)
      }))
      .filter(g => g.tags.length > 0)
  }, [tags])

  const selectedTagIds = query.tagIds ?? []

  const navigateWithQuery = (nextQuery: GetActivitiesQuery) => {
    if (onQueryChange) {
      onQueryChange(nextQuery)
      return
    }
    updateUrlWithQuery({
      pathname,
      query: nextQuery,
      navigate: replace
    })
  }

  const toggleTag = (tagId: string) => {
    const id = String(tagId)
    const isSelected = selectedTagIds.some(t => String(t) === id)
    const next = isSelected ? selectedTagIds.filter(t => String(t) !== id) : [...selectedTagIds, id]
    navigateWithQuery({
      ...query,
      tagIds: next.length > 0 ? next : undefined
    })
  }

  if (groups.length === 0) return null

  return (
    <>
      <Divider sx={{ mt: 2, mb: 1 }}>
        <Typography variant="subtitle2" textAlign="center">
          Cechy
        </Typography>
      </Divider>
      {groups.map(group => (
        <Box key={group.type} sx={{ mb: 1.5 }}>
          <Typography
            sx={{
              fontSize: "0.7rem",
              fontWeight: 500,
              color: "#9e9e9e",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              mb: 0.5
            }}
          >
            {group.label}
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            {group.tags.map(tag => {
              const isSelected = selectedTagIds.some(t => String(t) === String(tag.id))
              return (
                <Chip
                  key={tag.id}
                  label={tag.name}
                  size="small"
                  onClick={() => toggleTag(tag.id)}
                  sx={{
                    cursor: "pointer",
                    fontWeight: 500,
                    fontSize: "0.78rem",
                    transition: "all 0.15s ease",
                    ...(isSelected
                      ? {
                          backgroundColor: "#ff6b35",
                          color: "white",
                          borderColor: "#ff6b35",
                          "&:hover": {
                            backgroundColor: "#e55a2b"
                          }
                        }
                      : {
                          backgroundColor: "transparent",
                          color: "#424242",
                          border: "1px solid #bdbdbd",
                          "&:hover": {
                            borderColor: "#ff6b35",
                            color: "#ff6b35",
                            backgroundColor: "rgba(255, 107, 53, 0.06)"
                          }
                        })
                  }}
                />
              )
            })}
          </Box>
        </Box>
      ))}
    </>
  )
}
