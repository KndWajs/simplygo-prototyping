"use client"

import { Box, Grid, Typography } from "@mui/material"
import React from "react"
import { SubmitHandler, useForm } from "react-hook-form"
import { ActivityMetadataDto, QueryActivityDto } from "../../../models/domainDtos"
import { CategoryDto } from "../../../models/dtos/GetCategoriesQueryResponse"
import { getImageUrl } from "../../../utils/activityUtils"
import { StepInterface } from "../stepInterface"
import { StepTemplate } from "../stepTemplate"
import { PictureFormUpload } from "./pictureFormUpload"

interface Step4Props extends StepInterface {
  categories?: CategoryDto[]
}

export const Step4: React.FC<Step4Props> = ({
  activity,
  submitButton,
  cancelButton,
  metadata,
  categories
}) => {
  const getFlatCategories = (cats?: CategoryDto[]): CategoryDto[] => {
    if (!cats) return []
    const flat: CategoryDto[] = []
    const walk = (nodes: CategoryDto[]) => {
      for (const n of nodes) {
        flat.push(n)
        if (n.children) walk(n.children)
      }
    }
    walk(cats)
    return flat
  }

  const flatCategories = getFlatCategories(categories)

  const getDefault = (
    activity: QueryActivityDto,
    metadata?: ActivityMetadataDto
  ): QueryActivityDto => {
    if (activity.photos && activity.photos.length > 0) {
      return activity
    }
    const activityForPic = { ...activity }
    if (metadata?.categoryIds && metadata.categoryIds.length > 0) {
      // @ts-ignore
      activityForPic.categories =
        metadata.categoryIds
          .map(id => flatCategories.find(cat => cat.id === id + ""))
          .filter(Boolean) || []
    }
    const imgUrl = getImageUrl(activityForPic)

    return {
      ...activity,
      // @ts-ignore
      photos: [{ url: imgUrl }]
    }
  }

  const {
    handleSubmit,
    control,
    getValues,
    formState: { isValid }
  } = useForm<QueryActivityDto>({
    defaultValues: getDefault(activity, metadata),
    mode: "onChange"
  })

  const onSubmit: SubmitHandler<QueryActivityDto> = data => {
    submitButton.action(data)
  }

  return (
    <StepTemplate
      onSubmit={handleSubmit(d => onSubmit(d))}
      onCancel={() => cancelButton?.action(getValues())}
      submitDisabled={!isValid}
      okText={submitButton.name}
      cancelText={cancelButton?.name}
      progressValue={75}
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
          Dodaj zdjęcie
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
          Jeśli chcesz zmień zdjęcie zaproponowane przez AI
        </Typography>
      </Box>
      <Grid
        container
        spacing={3}
        sx={{ maxWidth: "750px", margin: "0 auto", display: "flex", justifyContent: "center" }}
      >
        <PictureFormUpload control={control} />
      </Grid>
    </StepTemplate>
  )
}
