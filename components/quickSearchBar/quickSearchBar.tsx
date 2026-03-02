import ChevronLeftIcon from "@mui/icons-material/ChevronLeft"
import ChevronRightIcon from "@mui/icons-material/ChevronRight"
import { Box, IconButton, Stack } from "@mui/material"
import Link from "next/link"
import React from "react"

const QUICK_SEARCH_ENTRIES = [
  { label: "Weekend w Szczecinie", href: "/wydarzenia/szczecin/weekend" },
  { label: "Koncerty Szczecin", href: "/wydarzenia/szczecin/koncerty" },
  { label: "Dla dzieci Szczecin", href: "/wydarzenia/szczecin/dla-dzieci" },
  { label: "Sport w okolicy", href: "/wydarzenia/szczecin/sport" },
  { label: "Rozrywka Szczecin", href: "/wydarzenia/szczecin/rozrywka" },
  { label: "Wszystko w Szczecinie", href: "/wydarzenia/szczecin" }
]

export function QuickSearchBar() {
  return (
    <Stack direction="row" alignItems="center" justifyContent="center" mt={1} gap={1}>
      <IconButton
        size="small"
        sx={{ display: { xs: "none", sm: "flex" }, color: "#d1d5db", visibility: "hidden" }}
        aria-hidden
        tabIndex={-1}
      >
        <ChevronLeftIcon />
      </IconButton>

      <Box
        sx={{
          overflowX: "auto",
          maxWidth: "100%",
          "&::-webkit-scrollbar": { display: "none" },
          scrollbarWidth: "none"
        }}
      >
        <Stack direction="row" alignItems="center" gap="2px" flexWrap="nowrap">
          {QUICK_SEARCH_ENTRIES.map(({ label, href }, index) => (
            <React.Fragment key={label}>
              <Link href={href} prefetch={false} style={{ textDecoration: "none" }}>
                <Box
                  sx={{
                    px: 1,
                    py: 1,
                    borderRadius: "50px",
                    fontSize: "0.875rem",
                    color: "#d1d5db",
                    transition: "all 0.3s ease",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    "&:hover": {
                      backgroundColor: "rgba(255, 107, 53, 0.15)",
                      borderColor: "#ff6b35",
                      color: "#ff6b35",
                      transform: "translateY(-2px)"
                    }
                  }}
                >
                  {label}
                </Box>
              </Link>
              {index < QUICK_SEARCH_ENTRIES.length - 1 && (
                <Box
                  component="span"
                  sx={{ mx: 0.5, color: "rgba(255,255,255,0.5)", fontSize: "0.75rem" }}
                >
                  &bull;
                </Box>
              )}
            </React.Fragment>
          ))}
        </Stack>
      </Box>

      <IconButton
        size="small"
        sx={{ display: { xs: "none", sm: "flex" }, color: "#d1d5db", visibility: "hidden" }}
        aria-hidden
        tabIndex={-1}
      >
        <ChevronRightIcon />
      </IconButton>
    </Stack>
  )
}
