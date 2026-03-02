"use client"

import { Backdrop, Box, IconButton } from "@mui/material"
import CloseIcon from "@mui/icons-material/Close"
import { useState } from "react"

interface ImageViewerProps {
  src: string
  alt: string
  sx?: object
}

export function ImageViewer({ src, alt, sx }: ImageViewerProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Box
        component="img"
        src={src}
        alt={alt}
        onClick={() => setOpen(true)}
        sx={{
          cursor: "zoom-in",
          ...sx
        }}
      />
      <Backdrop
        open={open}
        onClick={() => setOpen(false)}
        sx={{
          zIndex: 9999,
          backgroundColor: "rgba(0, 0, 0, 0.92)",
          cursor: "zoom-out"
        }}
      >
        <IconButton
          onClick={() => setOpen(false)}
          sx={{
            position: "absolute",
            top: 16,
            right: 16,
            color: "white"
          }}
        >
          <CloseIcon />
        </IconButton>
        <Box
          component="img"
          src={src}
          alt={alt}
          sx={{
            maxWidth: "95vw",
            maxHeight: "95vh",
            objectFit: "contain"
          }}
        />
      </Backdrop>
    </>
  )
}
