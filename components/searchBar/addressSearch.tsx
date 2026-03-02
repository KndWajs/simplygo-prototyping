"use client"

import CloseIcon from "@mui/icons-material/Close"
import MapIcon from "@mui/icons-material/Map"
import { Autocomplete, Box, IconButton, InputAdornment, TextField } from "@mui/material"
import { DEFAULT_CITY } from "components/citySelector/citySelector"
import type { Address, GetActivitiesQuery } from "models/domainDtos"
import { getAddressCookie } from "models/services/cookies.service"
import { updateUrlWithQuery } from "models/services/filters.service"
import { useNavigation } from "components/navigationProvider/navigationProvider"
import { usePathname } from "next/navigation"
import { type ChangeEvent, useRef, useState } from "react"

const API_URL = process.env.NEXT_PUBLIC_API_URL

interface AddressSearchProps {
  query: GetActivitiesQuery
}

async function fetchSuggestions(input: string): Promise<string[]> {
  try {
    const res = await fetch(`${API_URL}/Addresses/prompt?address=${encodeURIComponent(input)}`)
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}

async function geocodeAddress(input: string): Promise<Address | null> {
  try {
    const res = await fetch(`${API_URL}/Addresses/geocode/${encodeURIComponent(input)}`)
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

export function AddressSearch({ query }: AddressSearchProps) {
  const { replace } = useNavigation()
  const pathname = usePathname()
  const [inputValue, setInputValue] = useState(
    () => query.region?.city || getAddressCookie()?.streetAddress || DEFAULT_CITY.label
  )
  const [suggestions, setSuggestions] = useState<string[]>([])
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const navigateWithAddress = (address: Address) => {
    updateUrlWithQuery({
      pathname,
      query: {
        ...query,
        coordinates: address.coordinates
      },
      navigate: replace
    })
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)

    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (value.length > 3) {
      debounceRef.current = setTimeout(() => {
        fetchSuggestions(value).then(setSuggestions)
      }, 300)
    } else {
      setSuggestions([])
    }
  }

  const handleSelect = async (value: string) => {
    setInputValue(value)
    setSuggestions([])
    const address = await geocodeAddress(value)
    if (address) navigateWithAddress(address)
  }

  const handleClear = () => {
    const savedAddress = getAddressCookie()
    const cityName = savedAddress?.streetAddress ?? DEFAULT_CITY.label
    const cityCoords = savedAddress?.coordinates ?? DEFAULT_CITY.coordinates
    setInputValue(cityName)
    setSuggestions([])
    updateUrlWithQuery({
      pathname,
      query: {
        ...query,
        region: { city: cityName, country: "Poland" },
        coordinates: cityCoords
      },
      navigate: replace
    })
  }

  const handleKeyDown = async (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && inputValue.length > 2) {
      const address = await geocodeAddress(inputValue)
      if (address) navigateWithAddress(address)
    }
  }

  return (
    <Autocomplete
      disableClearable
      disablePortal
      freeSolo
      options={suggestions}
      value={inputValue}
      onChange={async (_e, v, reason) => {
        if (typeof v === "string" && reason === "selectOption") {
          await handleSelect(v)
        }
      }}
      PaperComponent={props => (
        <Box
          {...props}
          sx={{
            color: "white",
            backgroundColor: "rgba(20, 20, 20, 0.98) !important",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255, 107, 53, 0.3)",
            borderRadius: "12px",
            "& .MuiAutocomplete-listbox li": {
              color: "#d1d5db",
              fontSize: "0.9rem",
              padding: "10px 16px",
              transition: "all 0.2s ease",
              "&:hover": {
                backgroundColor: "rgba(255, 107, 53, 0.2)",
                color: "white"
              }
            }
          }}
        />
      )}
      sx={{ width: { xs: "100%", md: "330px" } }}
      renderInput={params => (
        <TextField
          {...params}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Szukaj adresu lub miejsca..."
          variant="standard"
          slotProps={{
            input: {
              ...params.InputProps,
              disableUnderline: true,
              startAdornment: (
                <InputAdornment position="start">
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 36,
                      height: 36,
                      color: "#fff"
                    }}
                  >
                    <MapIcon fontSize="small" />
                  </Box>
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end" sx={{ display: "flex", gap: 0.5 }}>
                  {inputValue && (
                    <IconButton
                      sx={{
                        color: "rgba(255,255,255,0.7)",
                        width: 34,
                        height: 34,
                        "&:hover": {
                          background: "rgba(255,255,255,0.08)",
                          color: "#fff"
                        }
                      }}
                      aria-label="Wyczysc"
                      onClick={handleClear}
                    >
                      <CloseIcon sx={{ fontSize: 20 }} />
                    </IconButton>
                  )}
                </InputAdornment>
              )
            }
          }}
          sx={{
            width: "100%",
            borderRadius: "8px",
            position: "relative",
            boxShadow: `
              0 0 18px rgba(255,107,53,0.3),
              0 0 26px rgba(18,107,163,0.25),
              0 10px 30px rgba(0,0,0,0.65)
            `,
            "&::before": {
              content: '""',
              position: "absolute",
              inset: 0,
              borderRadius: "8px",
              padding: "2px",
              background: "linear-gradient(90deg, #ff6b35, #126ba3)",
              WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              WebkitMaskComposite: "xor",
              maskComposite: "exclude",
              zIndex: 2,
              pointerEvents: "none"
            },
            "& .MuiInputBase-root": {
              position: "relative",
              zIndex: 1,
              background: "rgba(255,255,255,0.05)",
              backdropFilter: "blur(8px)",
              borderRadius: "10px",
              padding: "8px 4px",
              color: "#fff",
              fontSize: 14
            },
            "& .MuiInputBase-input": {
              color: "#fff",
              fontSize: 14,
              padding: "0 8px",
              "&::placeholder": {
                color: "rgba(255,255,255,0.5)",
                opacity: 1
              }
            }
          }}
        />
      )}
    />
  )
}
