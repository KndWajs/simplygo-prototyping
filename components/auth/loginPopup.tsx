"use client"

import { useAuth0 } from "@auth0/auth0-react"
import { Box, Button, Modal, Stack, Typography } from "@mui/material"

interface LoginPopupProps {
  open: boolean
  onClose: () => void
}

export const LoginPopup = ({ open, onClose }: LoginPopupProps) => {
  const { loginWithRedirect } = useAuth0()

  const handleLogin = () => {
    // @ts-ignore
    window.gtag?.("event", "signup")
    const returnTo = window.location.pathname + window.location.search
    localStorage.setItem("auth_return_to", returnTo)
    loginWithRedirect({ appState: { returnTo } })
  }

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)"
        }}
      >
        <Box
          sx={{
            minWidth: { xs: 300, sm: 400 },
            bgcolor: "white",
            p: { xs: 3, sm: 5 },
            borderRadius: "32px",
            boxShadow: 24,
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <Stack
            spacing={{ xs: 2, sm: 3 }}
            alignItems="center"
            textAlign="center"
            sx={{ minWidth: { xs: 150, sm: 300 } }}
          >
            <Typography variant="h5">Gotowy na przygodę?</Typography>
            <Typography variant="body1">Zaloguj się i sprawdź, co ciekawego się dzieje!</Typography>
            <Stack spacing={2} direction="row" justifyContent="center">
              <Button variant="contained" color="primary" onClick={handleLogin}>
                Wchodzę!
              </Button>
              <Button variant="outlined" color="primary" onClick={onClose}>
                Jeszcze nie teraz
              </Button>
            </Stack>
          </Stack>
          <Box
            component="img"
            src="/login_pic.jpg"
            alt="Login"
            sx={{
              height: 300,
              width: 300,
              borderRadius: "28px",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              objectFit: "cover"
            }}
          />
        </Box>
      </Box>
    </Modal>
  )
}
