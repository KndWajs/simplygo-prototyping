"use client"

import { Box, Button, LinearProgress, linearProgressClasses, styled } from "@mui/material"
import React, { ReactNode } from "react"

export interface StepProps {
  onCancel?: () => void
  onSubmit?: () => void
  submitDisabled?: boolean
  okText?: string
  cancelText?: string
  children: ReactNode
  progressValue?: number
}

const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
  width: "100%",
  height: 10,
  borderRadius: 5,
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor: theme.palette.grey[200]
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 5,
    backgroundColor: theme.palette.primary.main
  }
}))

export const StepTemplate: React.FC<StepProps> = ({
  onCancel,
  onSubmit,
  submitDisabled,
  okText,
  cancelText,
  children,
  progressValue = 0
}) => {
  const largeScreenButtonSx = {
    "@media (min-width: 2000px)": {
      fontSize: "1.15rem",
      padding: "14px 32px",
      minHeight: 56
    }
  }

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: "100%",
        flex: 1,
        justifyContent: "space-between",
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }}
    >
      <Box
        sx={{
          maxWidth: "1300px",
          minHeight: "500px",
          pt: { xs: 2, md: 6 },
          pb: "50px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          flex: 1,
          width: "100%"
        }}
      >
        {children}
      </Box>
      <Box
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          display: "flex",
          flexDirection: "column",
          gap: 1,
          width: "100vw",
          background:
            "linear-gradient(rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.8) 10%, rgba(255, 255, 255, 1) 35%) ",
          py: { xs: 2, md: 4 },
          px: { xs: 2, md: 4 },
          zIndex: 10
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "row" }}>
          <Button
            color="inherit"
            size="large"
            onClick={onCancel}
            sx={{ mr: 1, ...largeScreenButtonSx }}
          >
            {cancelText}
          </Button>
          <Box sx={{ flex: "1 1 auto" }} />
          <Button
            variant="contained"
            size="large"
            sx={{
              bgcolor: "warning.main",
              "&:hover": { bgcolor: "warning.dark" },
              ...largeScreenButtonSx
            }}
            onClick={onSubmit}
            disabled={submitDisabled}
          >
            {okText}
          </Button>
        </Box>
        <BorderLinearProgress variant="determinate" value={progressValue} />
      </Box>
    </Box>
  )
}
