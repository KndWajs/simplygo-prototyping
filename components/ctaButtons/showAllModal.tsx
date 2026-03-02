"use client"

import CloseIcon from "@mui/icons-material/Close"
import {
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Stack,
  Typography
} from "@mui/material"
import type { CategoryDto } from "models/dtos/GetCategoriesQueryResponse"
import {
  getHideShowAllModalCookie,
  setHideShowAllModalCookie
} from "models/services/cookies.service"
import { serializeFilters } from "models/services/filters.service"
import { getSubcategoryIds } from "utils/categoriesUtils"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface ShowAllModalProps {
  open: boolean
  onClose: () => void
  categories: CategoryDto[]
}

const chipSx = (active: boolean) => ({
  px: 2,
  py: 0.5,
  borderRadius: "50px",
  width: "122px",
  fontWeight: 500,
  fontSize: "0.875rem",
  transition: "all 0.2s ease",
  cursor: "pointer",
  ...(active
    ? {
        background: "linear-gradient(90deg, #de5c2d 0%, #ff6b35 40%, #ff6b35 60%, #ff8c64 100%)",
        color: "white",
        "&:hover": {
          background: "linear-gradient(90deg, #de5c2d 0%, #ff6b35 40%, #ff6b35 60%, #ff8c64 100%)"
        }
      }
    : {
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        color: "white",
        backdropFilter: "blur(8px)",
        "&:hover": {
          backgroundColor: "rgba(255, 255, 255, 0.3)"
        }
      })
})

export function ShowAllModal({ open, onClose, categories }: ShowAllModalProps) {
  const router = useRouter()
  const [selected, setSelected] = useState<Set<string>>(() => new Set(categories.map(c => c.id)))
  const [dontShow, setDontShow] = useState(() => getHideShowAllModalCookie())

  const toggle = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleSubmit = () => {
    setHideShowAllModalCookie(dontShow)

    const categoryIds =
      selected.size > 0 && selected.size < categories.length
        ? getSubcategoryIds(categories, Array.from(selected))
        : undefined

    const params = serializeFilters({ categoryIds })
    const qs = params.toString()
    router.push(qs ? `/wydarzenia?${qs}` : "/wydarzenia")
    onClose()
  }

  const handleClose = () => {
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: {
          width: "100%",
          height: "auto",
          maxWidth: "600px",
          borderRadius: "16px",
          backgroundColor: "rgba(26, 26, 26, 0.7)",
          backgroundImage:
            "linear-gradient(135deg, rgba(255, 107, 53, 0.05) 0%, rgba(255, 107, 53, 0.02) 100%)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(255, 107, 53, 0.15)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)"
        }
      }}
    >
      <IconButton onClick={handleClose} sx={{ position: "absolute", top: 16, right: 16 }}>
        <CloseIcon sx={{ color: "#efece6", transition: "color 0.5s ease" }} />
      </IconButton>

      <DialogTitle
        sx={{
          fontSize: "1.5rem",
          fontWeight: 700,
          color: "white",
          display: "flex",
          alignItems: "center",
          gap: 1,
          pb: 4
        }}
      >
        Co chcesz przeglądać?
      </DialogTitle>

      <DialogContent sx={{ pb: 2, gap: 2, display: "flex", flexDirection: "column" }}>
        <Stack direction="row" justifyContent="center" flexWrap="wrap" gap={1.5}>
          {categories.map(category => (
            <Chip
              key={category.id}
              label={category.label}
              onClick={() => toggle(category.id)}
              sx={chipSx(selected.has(category.id))}
            />
          ))}
        </Stack>

        <FormControlLabel
          control={
            <Checkbox
              checked={dontShow}
              onChange={(_e, checked) => setDontShow(checked)}
              sx={{
                color: "#ff6b35",
                "&.Mui-checked": { color: "#ff6b35" }
              }}
            />
          }
          label={
            <Typography variant="body2" sx={{ color: "#d1d5db" }}>
              Nie pokazuj więcej
            </Typography>
          }
          sx={{ ml: -1, mt: 1 }}
        />
      </DialogContent>

      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button
          onClick={handleSubmit}
          variant="contained"
          sx={{
            background: "linear-gradient(135deg, #ff6b35 0%, #ff8c64 100%)",
            color: "white",
            borderRadius: "10px",
            textTransform: "none",
            fontSize: "1rem",
            fontWeight: 600,
            px: 3,
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover:not(:disabled)": {
              background: "linear-gradient(135deg, #ff8c64 0%, #ffaa80 100%)",
              boxShadow: "0 8px 24px rgba(255, 107, 53, 0.35)",
              transform: "translateY(-2px)"
            },
            "&:disabled": {
              opacity: 0.5
            }
          }}
        >
          Pokaż wyniki
        </Button>
      </DialogActions>
    </Dialog>
  )
}
