"use client"

import AutoAwesome from "@mui/icons-material/AutoAwesome"
import CloseIcon from "@mui/icons-material/Close"
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  TextField,
  Typography
} from "@mui/material"
import {
  type GetActivitiesQuery,
  type GetUserFiltersQueryResponse,
  getFiltersOccurrenceTypes
} from "models/domainDtos"
import { updateUrlWithQuery } from "models/services/filters.service"
import { useNavigation } from "components/navigationProvider/navigationProvider"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"

const API_URL = process.env.NEXT_PUBLIC_API_URL

interface AISearchModalProps {
  open: boolean
  onClose: () => void
  onNavigate?: () => void
  query?: GetActivitiesQuery
  targetPathname?: string
}

export function AISearchModal({
  open,
  onClose,
  onNavigate,
  query,
  targetPathname
}: AISearchModalProps) {
  const router = useRouter()
  const { replace } = useNavigation()
  const pathname = usePathname()
  const [aiFilter, setAiFilter] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const navigateWithQuery = (nextQuery: GetActivitiesQuery) =>
    updateUrlWithQuery({
      pathname: targetPathname ?? pathname,
      query: nextQuery,
      navigate: targetPathname ? router.push : replace
    })

  const runAction = (responseData: GetUserFiltersQueryResponse) => {
    const base = query ?? {}
    const newQuery: GetActivitiesQuery = {
      ...base,
      categoryIds: responseData.categoryIds || base.categoryIds,
      tagIds: responseData.tagIds,
      customDateRange: responseData.customDateRange || base.customDateRange,
      dateRange: responseData.dateRange || base.dateRange,
      kidsFilters: responseData.kidsFilters || base.kidsFilters,
      sportFilters: responseData.sportFilters || base.sportFilters,
      occurrenceType: getFiltersOccurrenceTypes(responseData.occurrenceType) || base.occurrenceType,
      orderBy: responseData.orderBy || base.orderBy
    }

    if (responseData.address?.coordinates) {
      newQuery.coordinates = responseData.address.coordinates
    }

    onNavigate?.()
    navigateWithQuery(newQuery)
    onClose()
    setLoading(false)
  }

  const handleSubmit = async () => {
    if (aiFilter.trim().length < 20) {
      setError("Wpisz co najmniej 20 znakow, aby AI moglo lepiej zrozumiec Twoje zapytanie.")
      return
    }
    if (aiFilter.trim().length > 499) {
      setError("Twoje zapytanie jest zbyt dlugie (maks. 499 znakow). Skroc je, prosze.")
      return
    }
    setLoading(true)
    setError("")

    try {
      const res = await fetch(`${API_URL}/filters?userPrompt=${encodeURIComponent(aiFilter)}`)
      if (!res.ok) throw new Error("API error")
      const responseData: GetUserFiltersQueryResponse = await res.json()
      runAction(responseData)
    } catch {
      setError(
        "AIndrzej napotkal problem podczas przetwarzania Twojego zapytania. Sprobuj ponownie pozniej."
      )
      setLoading(false)
    }
  }

  const handleClose = () => {
    setError("")
    onClose()
  }

  const handleClear = () => {
    setAiFilter("")
    setError("")
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
      {loading && (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 10,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            borderRadius: "16px"
          }}
        >
          <CircularProgress sx={{ color: "#ff6b35" }} />
        </Box>
      )}
      <Box sx={{ position: "absolute", top: 16, right: 16 }}>
        <IconButton onClick={handleClose}>
          <CloseIcon sx={{ color: "#efece6", transition: "color 0.5s ease" }} />
        </IconButton>
      </Box>
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
        <AutoAwesome sx={{ fontSize: 24, color: "#ff6b35" }} />
        Co chcesz robic?
      </DialogTitle>

      <DialogContent sx={{ pb: 4, gap: 2, display: "flex", flexDirection: "column" }}>
        <Typography variant="body2" sx={{ color: "#d1d5db", fontSize: "1rem", textAlign: "left" }}>
          Ai ustawi filtry za Ciebie!
        </Typography>
        <TextField
          autoFocus
          fullWidth
          placeholder="Co? Gdzie? Kiedy? Z kim?"
          value={aiFilter}
          onChange={e => setAiFilter(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter") handleSubmit()
          }}
          variant="outlined"
          error={!!error}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={handleClear}
                  sx={{
                    color: "rgba(255,255,255,0.7)",
                    width: 34,
                    height: 34,
                    background: "rgba(255,255,255,0.01)",
                    border: "1px solid rgba(255,255,255,0.0)",
                    "&:hover": {
                      background: "rgba(255,255,255,0.08)",
                      color: "#fff"
                    }
                  }}
                  aria-label="Wyczysc"
                >
                  <CloseIcon sx={{ fontSize: 20 }} />
                </IconButton>
              </InputAdornment>
            )
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              color: "white",
              backgroundColor: "rgba(255, 107, 53, 0.08)",
              borderRadius: "12px",
              border: "1.5px solid rgba(255, 107, 53, 0.2)",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              "& fieldset": {
                borderColor: "rgba(255, 107, 53, 0.2)"
              },
              "&:hover": {
                backgroundColor: "rgba(255, 107, 53, 0.12)",
                borderColor: "rgba(255, 107, 53, 0.3)"
              },
              "&.Mui-focused": {
                backgroundColor: "rgba(255, 107, 53, 0.12)",
                borderColor: "#ff6b35",
                boxShadow: "0 0 0 3px rgba(255, 107, 53, 0.1)",
                "& fieldset": {
                  borderColor: "#ff6b35"
                }
              }
            },
            "& .MuiOutlinedInput-input::placeholder": {
              color: "rgba(255, 255, 255, 0.5)",
              opacity: 1
            }
          }}
        />
        {error && (
          <Typography sx={{ mt: 1, color: "#ff8c64", fontSize: "0.9rem" }}>{error}</Typography>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!aiFilter.trim() || loading}
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
          Znajdz z AI
        </Button>
      </DialogActions>
    </Dialog>
  )
}
