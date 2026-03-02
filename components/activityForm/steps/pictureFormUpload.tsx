"use client"

import { Box, Button, ButtonGroup } from "@mui/material"
import { useCallback, useEffect, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Control, Controller } from "react-hook-form"
import { QueryActivityDto } from "../../../models/domainDtos"

interface PictureFormUploadProps {
  control: Control<QueryActivityDto>
}

const MAX_SIZE_MB = 10
const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png"]

export const PictureFormUpload: React.FC<PictureFormUploadProps> = ({ control }) => {
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  return (
    <Controller
      control={control}
      name="photos"
      render={({ field: { onChange, value } }) => {
        useEffect(() => {
          if (value && value[0]?.url) {
            setPreview(value[0].url)
          }
        }, [])

        const onDrop = useCallback(
          (acceptedFiles: File[]) => {
            setError(null)
            const length = value && value.length ? value.length : 0
            if (acceptedFiles.length + length > 1) {
              setError("Możesz przesłać tylko 1 zdjęcie")
              return
            }

            const validFiles = acceptedFiles
              .filter(file => {
                if (file.size > MAX_SIZE_MB * 1024 * 1024) {
                  setError(`Plik ${file.name} jest za duży (max ${MAX_SIZE_MB}MB)`)
                  return false
                }
                if (!ACCEPTED_TYPES.includes(file.type)) {
                  setError(`Plik ${file.name} ma nieobsługiwany format`)
                  return false
                }
                return true
              })
              .map(file => ({ file }))

            if (validFiles.length > 0) {
              const previewUrl = URL.createObjectURL(validFiles[0].file)
              setPreview(previewUrl)
            }

            if (validFiles.length) {
              const currentFiles = value || []
              onChange([...currentFiles, ...validFiles])
            }
          },
          [value, onChange]
        )

        const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
          onDrop,
          noClick: true,
          noKeyboard: true,
          accept: {
            "image/*": [".jpeg", ".jpg", ".png"]
          }
        })

        const clearPreview = () => {
          setPreview(null)
          onChange(null)
        }

        const makePhoto = async () => {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({
              video: { facingMode: "environment" }
            })

            const video = document.createElement("video")
            video.srcObject = stream
            video.autoplay = true
            video.playsInline = true

            const container = document.createElement("div")
            container.style.position = "fixed"
            container.style.top = "0"
            container.style.left = "0"
            container.style.width = "100%"
            container.style.height = "100%"
            container.style.backgroundColor = "black"
            container.style.zIndex = "9999"
            container.style.display = "flex"
            container.style.flexDirection = "column"
            container.style.justifyContent = "center"
            container.style.alignItems = "center"

            const captureButton = document.createElement("button")
            captureButton.textContent = "Zrób zdjęcie"
            captureButton.style.position = "absolute"
            captureButton.style.bottom = "20px"
            captureButton.style.padding = "15px 30px"
            captureButton.style.fontSize = "16px"
            captureButton.style.backgroundColor = "#1976d2"
            captureButton.style.color = "white"
            captureButton.style.border = "none"
            captureButton.style.borderRadius = "5px"

            const backButton = document.createElement("button")
            backButton.textContent = "Cofnij"
            backButton.style.position = "absolute"
            backButton.style.bottom = "20px"
            backButton.style.left = "20px"
            backButton.style.padding = "15px 30px"
            backButton.style.fontSize = "16px"
            backButton.style.backgroundColor = "transparent"
            backButton.style.color = "white"
            backButton.style.border = "2px solid white"
            backButton.style.borderRadius = "5px"

            const closeButton = document.createElement("button")
            closeButton.textContent = "X"
            closeButton.style.position = "absolute"
            closeButton.style.top = "20px"
            closeButton.style.right = "20px"
            closeButton.style.padding = "10px"
            closeButton.style.fontSize = "20px"
            closeButton.style.backgroundColor = "transparent"
            closeButton.style.color = "white"
            closeButton.style.border = "2px solid white"
            closeButton.style.borderRadius = "50%"
            closeButton.style.width = "50px"
            closeButton.style.height = "50px"

            container.appendChild(video)
            container.appendChild(captureButton)
            container.appendChild(backButton)
            container.appendChild(closeButton)
            document.body.appendChild(container)

            const cleanup = () => {
              stream.getTracks().forEach(track => track.stop())
              document.body.removeChild(container)
            }

            closeButton.onclick = cleanup
            backButton.onclick = cleanup

            captureButton.onclick = () => {
              const canvas = document.createElement("canvas")
              const context = canvas.getContext("2d")
              canvas.width = video.videoWidth
              canvas.height = video.videoHeight
              context?.drawImage(video, 0, 0)

              canvas.toBlob(
                blob => {
                  if (blob) {
                    const file = new File([blob], `photo_${Date.now()}.jpg`, { type: "image/jpeg" })
                    if (file.size <= MAX_SIZE_MB * 1024 * 1024) {
                      const previewUrl = URL.createObjectURL(file)
                      setPreview(previewUrl)
                      onChange([{ file }])
                    } else {
                      setError("Zdjęcie jest za duże")
                    }
                  }
                  cleanup()
                },
                "image/jpeg",
                0.9
              )
            }
          } catch (err) {
            console.error("Error accessing camera:", err)
            setError("Nie można uzyskać dostępu do kamery")
          }
        }

        return (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            <div
              {...getRootProps()}
              style={{
                border: "2px dashed #ccc",
                borderRadius: "8px",
                padding: "20px",
                textAlign: "center",
                minHeight: "200px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                maxWidth: "500px"
              }}
            >
              <input {...getInputProps()} />
              {preview ? (
                <img
                  src={preview}
                  alt="Preview"
                  style={{ maxWidth: "100%", maxHeight: "300px", objectFit: "contain" }}
                />
              ) : null}
              {!preview && (
                <p style={{ color: "#999" }}>Obsługiwane formaty: .png, .jpeg, maksymalnie 10MB</p>
              )}
            </div>
            {error && <Box sx={{ color: "error.main", fontSize: "0.875rem" }}>{error}</Box>}
            <ButtonGroup variant="outlined">
              {!isDragActive && <Button onClick={makePhoto}>Zrób zdjęcie</Button>}
              <Button onClick={open}>
                {isDragActive
                  ? "Upuszczanie zdjęcia..."
                  : preview
                    ? "Przeciągnij lub kliknij, aby zmienić zdjęcie"
                    : "Przeciągnij lub prześlij zdjęcie"}
              </Button>
              {preview && (
                <Button type="button" onClick={clearPreview}>
                  Usuń zdjęcie
                </Button>
              )}
            </ButtonGroup>
          </Box>
        )
      }}
    />
  )
}
