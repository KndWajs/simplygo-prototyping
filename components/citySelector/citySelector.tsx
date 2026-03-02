"use client"

import { Box, MenuItem, Select } from "@mui/material"
import type { SelectChangeEvent } from "@mui/material"
import type { GetActivitiesQuery } from "models/domainDtos"
import { getAddressCookie, setAddressCookie } from "models/services/cookies.service"
import { updateUrlWithQuery } from "models/services/filters.service"
import { useNavigation } from "components/navigationProvider/navigationProvider"
import { usePathname } from "next/navigation"
import { useState } from "react"

interface CityOption {
  label: string
  value: string
  disabled?: boolean
  coordinates: { latitude: number; longitude: number }
}

export const CITIES: CityOption[] = [
  {
    label: "Szczecin",
    value: "szczecin",
    coordinates: { latitude: 53.43786715839242, longitude: 14.542767164110858 }
  },
  {
    label: "Warszawa",
    value: "warsaw",
    disabled: true,
    coordinates: { latitude: 52.2297, longitude: 21.0122 }
  },
  {
    label: "Krakow",
    value: "krakow",
    disabled: true,
    coordinates: { latitude: 50.0647, longitude: 19.945 }
  },
  {
    label: "Wroclaw",
    value: "wroclaw",
    disabled: true,
    coordinates: { latitude: 51.1079, longitude: 17.0385 }
  },
  {
    label: "Gdansk",
    value: "gdansk",
    disabled: true,
    coordinates: { latitude: 54.352, longitude: 18.6466 }
  },
  {
    label: "Poznan",
    value: "poznan",
    disabled: true,
    coordinates: { latitude: 52.4064, longitude: 16.9252 }
  },
  {
    label: "Lodz",
    value: "lodz",
    disabled: true,
    coordinates: { latitude: 51.7592, longitude: 19.456 }
  }
]

export const DEFAULT_CITY = CITIES[0]

function getCityFromCookie(): CityOption {
  const address = getAddressCookie()
  if (!address) return DEFAULT_CITY
  const match = CITIES.find(c => c.label.toLowerCase() === address.streetAddress.toLowerCase())
  return match ?? DEFAULT_CITY
}

function getCityFromQuery(query: GetActivitiesQuery): CityOption {
  if (!query.region?.city) return DEFAULT_CITY
  const match = CITIES.find(c => c.label.toLowerCase() === query.region!.city!.toLowerCase())
  return match ?? DEFAULT_CITY
}

interface CitySelectorProps {
  query?: GetActivitiesQuery
}

export function CitySelector({ query }: CitySelectorProps) {
  const { replace } = useNavigation()
  const pathname = usePathname()
  const [selectedCity, setSelectedCity] = useState<CityOption>(
    query ? getCityFromQuery(query) : getCityFromCookie
  )

  const handleCityChange = (event: SelectChangeEvent) => {
    const city = CITIES.find(c => c.value === event.target.value) ?? DEFAULT_CITY
    setSelectedCity(city)
    setAddressCookie({
      streetAddress: city.label,
      coordinates: city.coordinates
    })
    if (query) {
      updateUrlWithQuery({
        pathname,
        query: {
          ...query,
          region: { city: city.label, country: "Poland" },
          coordinates: city.coordinates
        },
        navigate: replace
      })
    }
  }

  return (
    <Box sx={{ display: "flex", justifyContent: "center" }}>
      <Select
        value={selectedCity.value}
        onChange={handleCityChange}
        size="small"
        MenuProps={{
          slotProps: {
            paper: {
              sx: {
                color: "white",
                backgroundColor: "rgba(20, 20, 20, 0.98)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255, 107, 53, 0.3)",
                borderRadius: "12px",
                "& .MuiMenuItem-root": {
                  fontSize: "0.95rem",
                  padding: "10px 16px",
                  "&:hover": {
                    backgroundColor: "rgba(255, 107, 53, 0.2)",
                    color: "white"
                  },
                  "&.Mui-selected": {
                    backgroundColor: "rgba(255, 107, 53, 0.3)",
                    color: "#ff6b35"
                  }
                }
              }
            }
          }
        }}
        sx={{
          width: query ? { xs: 130, md: 160 } : 200,
          color: "white",
          backgroundColor: "rgba(255, 255, 255, 0.08)",
          backdropFilter: "blur(8px)",
          borderRadius: "12px",
          border: "1px solid rgba(255, 107, 53, 0.3)",
          transition: "border-color 0.3s ease",
          "&:hover": {
            backgroundColor: "rgba(255, 107, 53, 0.1)",
            borderColor: "#ff6b35"
          },
          "&.Mui-focused": {
            backgroundColor: "rgba(255, 107, 53, 0.15)",
            borderColor: "#ff6b35"
          },
          "& fieldset": {
            border: "none"
          },
          "& .MuiSvgIcon-root": {
            color: "#ff6b35"
          }
        }}
      >
        {CITIES.map(city => (
          <MenuItem key={city.value} value={city.value} disabled={city.disabled}>
            {city.label}
          </MenuItem>
        ))}
      </Select>
    </Box>
  )
}
