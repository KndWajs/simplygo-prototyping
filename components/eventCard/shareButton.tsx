"use client"

import ShareIcon from "@mui/icons-material/Share"
import { Button, Snackbar } from "@mui/material"
import { useState } from "react"
import { QueryActivityDto } from "../../models/domainDtos"
import { generateActivityHref } from "../../utils/slugUtils"

interface ShareButtonProps {
  activity: QueryActivityDto
}

export const ShareButton = ({ activity }: ShareButtonProps) => {
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string }>({
    open: false,
    message: ""
  })

  const href = generateActivityHref(activity)
  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}${href}` : href

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: activity.base.title, url: shareUrl })
      } else {
        await navigator.clipboard.writeText(shareUrl)
        setSnackbar({ open: true, message: "Skopiowano link do schowka" })
      }
    } catch (error) {
      console.error(error)
      setSnackbar({ open: true, message: "Nie udało się udostępnić" })
    }
  }

  return (
    <>
      <Button startIcon={<ShareIcon />} onClick={handleShare} sx={{ color: "text.secondary" }}>
        Udostępnij
      </Button>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ open: false, message: "" })}
        message={snackbar.message}
      />
    </>
  )
}
