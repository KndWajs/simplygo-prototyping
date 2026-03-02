"use client"

import { Box, Typography } from "@mui/material"
import React from "react"
import { QueryActivityDto } from "../../../models/domainDtos"
import { StepInterface } from "../stepInterface"
import { StepTemplate } from "../stepTemplate"

export const Step1: React.FC<StepInterface> = ({ activity, submitButton, cancelButton }) => {
  return (
    <StepTemplate
      onSubmit={() => submitButton.action(activity)}
      onCancel={() => cancelButton?.action({} as QueryActivityDto)}
      okText={submitButton.name}
      cancelText={cancelButton?.name}
      progressValue={1}
    >
      <Box sx={{ px: { xs: 2, md: 3 }, pt: { xs: 4, md: 0 } }}>
        <Typography
          variant="h1"
          className="no-select"
          sx={{
            fontSize: { xs: "2.5rem", sm: "3.5rem", lg: "4rem" },
            fontWeight: "bold",
            mb: 6,
            lineHeight: 1.2,
            textAlign: "center",
            width: "100%"
          }}
        >
          Dodaj{" "}
          <Box component="span" sx={{ color: "#ff6b35" }}>
            wydarzenie
          </Box>
        </Typography>

        <Typography
          variant="h4"
          className="no-select"
          sx={{
            fontSize: { xs: "1.25rem", sm: "1.5rem" },
            color: "#666",
            mb: { xs: "44px", md: "64px" },
            fontWeight: 300,
            lineHeight: 1.8
          }}
        >
          1. Napisz co będzie się działo
          <br />
          2. Dodaj adres, zdjęcie i termin
          <br />
          3. Potwierdź kategorie i{" "}
          <Box component="span" sx={{ color: "#ff6b35", fontWeight: 400 }}>
            opublikuj!
          </Box>
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
          Po pierwszym etapie (opisaniu wydarzenia) użytkownicy wypełniają resztę średnio w 47
          sekund, dzięki AI ;)
        </Typography>
      </Box>
    </StepTemplate>
  )
}
