"use client"

import { Box, CircularProgress, Typography } from "@mui/material"
import dynamic from "next/dynamic"
import React, { useState } from "react"
import { Controller, SubmitHandler, useForm } from "react-hook-form"
import {
  ActivityMetadataDto,
  Address,
  Coordinates,
  QueryActivityDto
} from "../../../models/domainDtos"
import { reverseGeocode } from "../../../models/services/address.service"
import { StepInterface } from "../stepInterface"
import { StepTemplate } from "../stepTemplate"
import { AddressSearch } from "./addressSearch"

const AddressPickerMap = dynamic(
  () => import("./addressPickerMap").then(m => ({ default: m.AddressPickerMap })),
  { ssr: false }
)

const DEFAULT_CENTER: Coordinates = { latitude: 53.43, longitude: 14.55 }

export const Step3: React.FC<StepInterface> = ({
  activity,
  submitButton,
  cancelButton,
  metadata
}) => {
  const [mapLoading, setMapLoading] = useState(false)

  const getDefault = (
    activity: QueryActivityDto,
    metadata?: ActivityMetadataDto
  ): QueryActivityDto => {
    if (!metadata?.fullAddress || activity.base.address.streetAddress) {
      return activity
    }
    return {
      ...activity,
      base: {
        ...activity.base,
        address: metadata.fullAddress
      }
    }
  }

  const {
    handleSubmit,
    control,
    getValues,
    setValue,
    watch,
    formState: { isValid }
  } = useForm<QueryActivityDto>({
    defaultValues: getDefault(activity, metadata),
    mode: "onChange"
  })

  const currentAddress = watch("base.address")

  const onSubmit: SubmitHandler<QueryActivityDto> = data => {
    submitButton.action(data)
  }

  const handleMapClick = async (coords: Coordinates) => {
    setMapLoading(true)
    try {
      const addr = await reverseGeocode(coords.latitude, coords.longitude)
      const street = addr.streetAddress || "Brak adresu"
      setValue(
        "base.address",
        { streetAddress: street, coordinates: coords },
        { shouldValidate: true }
      )
    } catch (e) {
      console.error(e)
      setValue(
        "base.address",
        { streetAddress: currentAddress?.streetAddress || "", coordinates: coords },
        { shouldValidate: true }
      )
    } finally {
      setMapLoading(false)
    }
  }

  return (
    <StepTemplate
      onSubmit={handleSubmit(d => onSubmit(d))}
      onCancel={() => cancelButton?.action(getValues())}
      submitDisabled={!isValid}
      okText={submitButton.name}
      cancelText={cancelButton?.name}
      progressValue={65}
    >
      <Box sx={{ px: { xs: 2, md: 3 } }}>
        <Typography
          variant="h1"
          className="no-select"
          sx={{
            fontSize: { xs: "2.5rem", sm: "3.5rem", lg: "4rem" },
            fontWeight: "bold",
            mb: 1,
            lineHeight: 1.2,
            textAlign: "center",
            width: "100%"
          }}
        >
          Ustaw adres
        </Typography>

        <Typography
          variant="body2"
          className="no-select"
          sx={{
            fontSize: { xs: "1rem", sm: "1.125rem" },
            color: "#a1a1aa",
            mb: { xs: "24px", md: "32px" },
            fontWeight: 300,
            textAlign: "center",
            width: "100%"
          }}
        >
          Wpisz adres lub kliknij na mapie
        </Typography>
      </Box>
      <Box
        sx={{
          display: "flex",
          maxWidth: "1100px",
          width: "100%",
          flex: 1,
          alignItems: "center",
          justifyContent: "flex-start",
          flexDirection: "column",
          gap: "8px"
        }}
      >
        <Controller
          name="base.address"
          control={control}
          rules={{
            required: "Adres jest wymagany",
            validate: {
              minLength: (value: Address) =>
                !value?.streetAddress || value.streetAddress.length >= 5
                  ? true
                  : "Adres musi mieć co najmniej 5 znaków",
              maxLength: (value: Address) =>
                !value?.streetAddress || value.streetAddress.length <= 70
                  ? true
                  : "Adres nie może być dłuższy niż 70 znaków",
              hasCoordinates: (value: Address) =>
                value?.coordinates ? true : "Wybierz adres z listy, aby uzyskać współrzędne"
            }
          }}
          render={({ field }) => (
            <AddressSearch
              address={field.value || { streetAddress: "" }}
              onSubmit={address => {
                field.onChange(address)
              }}
            />
          )}
        />
        <Box sx={{ width: "100%", position: "relative", mt: 2 }}>
          {mapLoading && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "rgba(255,255,255,0.6)",
                zIndex: 5
              }}
            >
              <CircularProgress />
            </Box>
          )}
          <AddressPickerMap
            center={currentAddress?.coordinates || DEFAULT_CENTER}
            onMapClick={handleMapClick}
          />
        </Box>
      </Box>
    </StepTemplate>
  )
}
