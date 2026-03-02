"use client"

import ErrorIcon from "@mui/icons-material/Error"
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  MenuItem,
  TextField,
  Typography,
  useMediaQuery,
  useTheme
} from "@mui/material"
import { useState } from "react"
import type { IssueDto } from "../../models/dtos/IssueDto"

const API_URL = process.env.NEXT_PUBLIC_API_URL

interface ErrorReportModalProps {
  activityId?: string
}

export function ErrorReportModal({ activityId }: ErrorReportModalProps) {
  const muiTheme = useTheme()
  const fullScreen = useMediaQuery(muiTheme.breakpoints.down("md"))

  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [email, setEmail] = useState("")
  const [description, setDescription] = useState("")

  const handleSubmit = async () => {
    const payload: IssueDto = { activityId, contactEmail: email, title, description }
    try {
      await fetch(`${API_URL}/Issues/activity`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
      // @ts-ignore
      window.gtag?.("event", "form_submit", { form: "error_report" })
    } catch (error) {
      console.error("Failed to report issue:", error)
    }
    setOpen(false)
    setTitle("")
    setEmail("")
    setDescription("")
  }

  return (
    <>
      <Button variant="text" startIcon={<ErrorIcon />} color="error" onClick={() => setOpen(true)} sx={{ opacity: 0.7, "&:hover": { opacity: 1 } }}>
        Zgłoś błąd
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} fullScreen={fullScreen}>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2, minWidth: "350px" }}
        >
          <Typography variant="h5" gutterBottom>
            Zgłoś błąd
          </Typography>
          <TextField
            select
            label="Typ błędu"
            value={title}
            onChange={e => setTitle(e.target.value)}
          >
            {["Błąd danych", "Brakujące informacje", "Błąd lokalizacji", "Inny"].map(type => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Twój e-mail"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <TextField
            label="Opis"
            multiline
            rows={4}
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Anuluj</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={!title || !email}>
            Wyślij
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
