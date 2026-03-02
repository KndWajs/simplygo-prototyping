"use client"

import { useState } from "react"
import { Box, Button, Modal, Typography } from "@mui/material"
import { useAuth0 } from "@auth0/auth0-react"
import { QueryActivityDto } from "../../models/domainDtos"
import { deleteActivity } from "../../models/services/activities.service"

interface DeleteActivityButtonProps {
  activity: QueryActivityDto
  afterDeleteAction?: () => void
}

const deleteModalStyle = {
  position: "absolute" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4
}

export const DeleteActivityButton = ({
  activity,
  afterDeleteAction
}: DeleteActivityButtonProps) => {
  const { getAccessTokenSilently } = useAuth0()
  const [open, setOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleClose = () => {
    if (!deleting) setOpen(false)
  }

  const handleDelete = async () => {
    if (!activity.id) return
    setDeleting(true)
    try {
      const token = await getAccessTokenSilently()
      const success = await deleteActivity(activity.id, token)
      if (success) {
        setOpen(false)
        afterDeleteAction?.()
      }
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <Modal open={open} onClose={handleClose}>
        <Box sx={deleteModalStyle}>
          <Typography variant="h6" component="h2">
            Usuwanie aktywności
          </Typography>
          <Typography sx={{ mt: 2 }}>
            Czy na pewno chcesz usunąć aktywność <strong>{activity.base.title}</strong>?
          </Typography>
          <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
            <Button variant="outlined" onClick={handleDelete} disabled={deleting}>
              Tak
            </Button>
            <Button variant="outlined" onClick={handleClose} disabled={deleting}>
              Nie
            </Button>
          </Box>
        </Box>
      </Modal>
      <Button variant="text" color="error" onClick={() => setOpen(true)}>
        Usuń
      </Button>
    </>
  )
}
