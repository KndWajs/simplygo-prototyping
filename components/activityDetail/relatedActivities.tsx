"use client"

import { Box, Button } from "@mui/material"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import { useState } from "react"
import EventCard from "../eventCard/eventCard"
import type { QueryActivityDto } from "../../models/domainDtos"

interface RelatedActivitiesProps {
  activities: QueryActivityDto[]
}

export function RelatedActivities({ activities }: RelatedActivitiesProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <Box sx={{ position: "relative" }}>
      <Box
        sx={{
          maxHeight: expanded ? "none" : "140px",
          overflow: "hidden",
          position: "relative"
        }}
      >
        <Box display="flex" flexWrap="wrap" gap={2} justifyContent="center">
          {activities.map((activity, index) => (
            <EventCard key={activity.id || `related-${index}`} activity={activity} replace />
          ))}
        </Box>
      </Box>
      {!expanded && (
        <Box
          onClick={() => setExpanded(true)}
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 10,
            cursor: "pointer",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            paddingBottom: 5,
            background:
              "linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 35%)"
          }}
        >
          <Button
            onClick={() => setExpanded(true)}
            endIcon={<ExpandMoreIcon />}
            variant="outlined"
            sx={{ minHeight: 44, borderWidth: 1.5, "&:hover": { borderWidth: 1.5 } }}
          >
            Pokaż więcej
          </Button>
        </Box>
      )}
    </Box>
  )
}
