"use client"

import { useAuth0 } from "@auth0/auth0-react"
import { Box, CircularProgress } from "@mui/material"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function CallbackPage() {
  const { error } = useAuth0()
  const router = useRouter()

  useEffect(() => {
    if (error) {
      const returnTo = localStorage.getItem("auth_return_to") || "/"
      localStorage.removeItem("auth_return_to")
      router.replace(returnTo)
    }
  }, [error, router])

  return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <CircularProgress color="primary" />
    </Box>
  )
}
