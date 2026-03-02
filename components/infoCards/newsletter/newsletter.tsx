"use client"

import { useState } from "react"
import { useAuth0 } from "@auth0/auth0-react"
import EmailIcon from "@mui/icons-material/Email"
import { Box, Button, Typography } from "@mui/material"
import { LoginPopup } from "components/auth/loginPopup"
import { NewsletterDialog } from "./newsletterDialog"
import "./newsletter.scss"

export const Newsletter = () => {
  const { isAuthenticated } = useAuth0()
  const [showLogin, setShowLogin] = useState(false)
  const [showDialog, setShowDialog] = useState(false)

  const handleClick = () => {
    if (!isAuthenticated) {
      setShowLogin(true)
      return
    }
    setShowDialog(true)
  }

  return (
    <Box className="newsletter">
      <EmailIcon sx={{ fontSize: 40, color: "primary.main", mb: 1 }} />
      <Typography variant="h6" fontWeight={700} gutterBottom>
        Bądź na bieżąco!
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, maxWidth: 320 }}>
        Zapisz się na newsletter i otrzymuj najciekawsze wydarzenia ze Szczecina prosto na swoją
        skrzynkę.
      </Typography>
      <Button variant="contained" color="primary" onClick={handleClick}>
        Zapisz się
      </Button>
      <LoginPopup open={showLogin} onClose={() => setShowLogin(false)} />
      <NewsletterDialog open={showDialog} onClose={() => setShowDialog(false)} />
    </Box>
  )
}
