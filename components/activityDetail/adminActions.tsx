"use client"

import DeleteIcon from "@mui/icons-material/Delete"
import EditIcon from "@mui/icons-material/Edit"
import MoreVertIcon from "@mui/icons-material/MoreVert"
import {
  Box,
  Button,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Modal,
  Typography
} from "@mui/material"
import { useAuth0 } from "@auth0/auth0-react"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import type { QueryActivityDto } from "models/domainDtos"
import { deleteActivity, fetchCurrentUser } from "models/services/activities.service"
import { revalidateActivity } from "app/actions"

interface AdminActionsProps {
  activity: QueryActivityDto
}

const modalStyle = {
  position: "absolute" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  borderRadius: 2,
  boxShadow: 24,
  p: 4
}

export function AdminActions({ activity }: AdminActionsProps) {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) return
    let cancelled = false
    getAccessTokenSilently().then(token =>
      fetchCurrentUser(token).then(user => {
        if (!cancelled && user?.role === 1) setIsAdmin(true)
      })
    )
    return () => {
      cancelled = true
    }
  }, [isAuthenticated, getAccessTokenSilently])

  const handleDelete = useCallback(async () => {
    if (!activity.id) return
    setDeleting(true)
    try {
      const token = await getAccessTokenSilently()
      const success = await deleteActivity(activity.id, token)
      if (success) {
        await revalidateActivity(activity.id)
        setDeleteOpen(false)
        router.push("/wydarzenia")
      }
    } finally {
      setDeleting(false)
    }
  }, [activity.id, getAccessTokenSilently, router])

  if (!isAdmin) return null

  return (
    <>
      <IconButton
        onClick={e => setAnchorEl(e.currentTarget)}
        size="small"
        sx={{ color: "text.secondary" }}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        <MenuItem
          onClick={() => {
            setAnchorEl(null)
            router.push(`/add-activity?editId=${activity.id}`)
          }}
        >
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edytuj</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            setAnchorEl(null)
            setDeleteOpen(true)
          }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText sx={{ color: "error.main" }}>Usuń</ListItemText>
        </MenuItem>
      </Menu>
      <Modal open={deleteOpen} onClose={() => !deleting && setDeleteOpen(false)}>
        <Box sx={modalStyle}>
          <Typography variant="h6" component="h2">
            Usuwanie aktywności
          </Typography>
          <Typography sx={{ mt: 2 }}>
            Czy na pewno chcesz usunąć aktywność <strong>{activity.base.title}</strong>?
          </Typography>
          <Box sx={{ mt: 3, display: "flex", gap: 1 }}>
            <Button variant="contained" color="error" onClick={handleDelete} disabled={deleting}>
              Tak, usuń
            </Button>
            <Button variant="outlined" onClick={() => setDeleteOpen(false)} disabled={deleting}>
              Anuluj
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  )
}
