"use client"

import MyLocationIcon from "@mui/icons-material/MyLocation"
import { Autocomplete, IconButton, InputAdornment, TextField } from "@mui/material"
import React, { ChangeEvent, useEffect, useState } from "react"
import { useGeolocated } from "react-geolocated"
import { Address } from "../../../models/domainDtos"
import { getAddressPrompt, geocodeAddress } from "../../../models/services/address.service"

interface AddressSearchProps {
  onSubmit: (address: Address) => void
  address?: Address
  label?: string
}

const DEFAULT_ADDRESS: Address = {
  streetAddress: "",
  coordinates: { latitude: 53.43, longitude: 14.55 }
}

export const AddressSearch: React.FC<AddressSearchProps> = ({
  onSubmit,
  address,
  label = "Wpisz adres"
}) => {
  const [addressInput, setAddressInput] = useState(address?.streetAddress ?? "")

  useEffect(() => {
    setAddressInput(address?.streetAddress ?? "")
  }, [address])

  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isGettingLocation, setIsGettingLocation] = useState(false)

  const { coords, isGeolocationAvailable, isGeolocationEnabled } = useGeolocated({
    positionOptions: { enableHighAccuracy: false },
    userDecisionTimeout: 5000
  })
  const canUseGeoLocation =
    isGeolocationAvailable && isGeolocationEnabled && coords && coords.latitude && coords.longitude

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setAddressInput(value)
    if (value.length > 3) {
      getAddressPrompt(value, true)
        .then(data => setSuggestions(data))
        .catch(() => setSuggestions([]))
    } else {
      setSuggestions([])
    }
  }

  const handleSelect = (value: string) => {
    setAddressInput(value)
    setSuggestions([])
  }

  const getCurrentLocationWrapper = async () => {
    if (!canUseGeoLocation || !coords) return
    setIsGettingLocation(true)
    try {
      const { reverseGeocode } = await import("../../../models/services/address.service")
      const addr = await reverseGeocode(coords.latitude, coords.longitude)
      if (addr) {
        setAddressInput(addr.streetAddress)
        onSubmit(addr)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsGettingLocation(false)
    }
  }

  const handleButtonClick = async (input?: string) => {
    const aInput = input || addressInput
    if (!aInput) return

    setSuggestions([])
    setAddressInput(aInput)

    try {
      const addr = await geocodeAddress(aInput)
      onSubmit(addr)
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <Autocomplete
      disablePortal
      freeSolo
      options={suggestions}
      value={addressInput}
      fullWidth
      onChange={async (_e, v, r) => {
        if (typeof v === "string") {
          handleSelect(v)
          if (r === "selectOption") {
            await handleButtonClick(v)
          }
        } else {
          handleSelect("")
        }
      }}
      renderInput={params => (
        <TextField
          {...params}
          label={label}
          variant="outlined"
          fullWidth
          size="small"
          onChange={handleChange}
          slotProps={{
            input: {
              ...params.InputProps,
              endAdornment: (
                <>
                  <InputAdornment position="end">
                    {canUseGeoLocation && (
                      <IconButton
                        onClick={getCurrentLocationWrapper}
                        disabled={isGettingLocation}
                        size="small"
                        sx={{
                          mr: 0.5,
                          color: "warning.main",
                          "&:hover": { color: "warning.dark" }
                        }}
                        title="Użyj mojej lokalizacji"
                      >
                        <MyLocationIcon fontSize="small" />
                      </IconButton>
                    )}
                  </InputAdornment>
                  {params.InputProps.endAdornment}
                </>
              )
            }
          }}
        />
      )}
    />
  )
}
