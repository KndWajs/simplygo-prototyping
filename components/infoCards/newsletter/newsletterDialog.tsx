"use client"

import {
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  FormControlLabel,
  FormGroup,
  MenuItem,
  TextField,
  Typography,
  useMediaQuery,
  useTheme
} from "@mui/material"
import { useAuth0 } from "@auth0/auth0-react"
import { useEffect, useMemo, useState } from "react"
import { CATEGORIES } from "data/categories"
import { TAGS } from "data/tags"
import { getTagType, getTagLabel, TagType } from "models/dtos/tagDto"
import {
  getNewsletterSubscription,
  subscribeToNewsletter,
  unsubscribeFromNewsletter,
  updateNewsletterSubscription
} from "models/services/newsletter.service"

const MAIN_CATEGORIES = CATEGORIES.map(c => ({ id: c.id, label: c.label }))

const FREQUENCIES = [
  { value: 1, label: "Tygodniowo" },
  { value: 2, label: "Co dwa tygodnie" },
  { value: 3, label: "Miesięcznie" }
]

interface NewsletterDialogProps {
  open: boolean
  onClose: () => void
}

export function NewsletterDialog({ open, onClose }: NewsletterDialogProps) {
  const muiTheme = useTheme()
  const fullScreen = useMediaQuery(muiTheme.breakpoints.down("md"))
  const { getAccessTokenSilently } = useAuth0()

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [hasSubscription, setHasSubscription] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [frequency, setFrequency] = useState(3)

  const tagGroups = useMemo(
    () =>
      [TagType.Vibe, TagType.Social, TagType.Role]
        .map(type => ({
          type,
          label: getTagLabel(type),
          tags: TAGS.filter(t => getTagType(t.id) === type)
        }))
        .filter(g => g.tags.length > 0),
    []
  )

  useEffect(() => {
    if (!open) return
    let cancelled = false

    async function load() {
      setLoading(true)
      try {
        const token = await getAccessTokenSilently()
        const sub = await getNewsletterSubscription(token)
        if (cancelled) return
        setHasSubscription(sub.hasSubscription)
        if (sub.hasSubscription) {
          setSelectedCategories(sub.categoryIds.map(String))
          setSelectedTags(sub.tagIds.map(String))
          setFrequency(sub.frequency ?? 3)
        }
      } catch (err) {
        console.error("Failed to load subscription:", err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [open, getAccessTokenSilently])

  const toggleCategory = (id: string) => {
    setSelectedCategories(prev => (prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]))
  }

  const toggleTag = (id: string) => {
    setSelectedTags(prev => (prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]))
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const token = await getAccessTokenSilently()
      const payload = {
        categoryIds: selectedCategories.map(Number),
        tagIds: selectedTags.map(Number),
        frequency,
        regionId: 1
      }
      if (hasSubscription) {
        await updateNewsletterSubscription(token, payload)
      } else {
        await subscribeToNewsletter(token, payload)
      }
      // @ts-ignore
      window.gtag?.("event", "newsletter_subscribe", {
        categories: selectedCategories.length,
        tags: selectedTags.length,
        frequency
      })
      onClose()
    } catch (err) {
      console.error("Newsletter submit error:", err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleUnsubscribe = async () => {
    setSubmitting(true)
    try {
      const token = await getAccessTokenSilently()
      await unsubscribeFromNewsletter(token)
      // @ts-ignore
      window.gtag?.("event", "newsletter_unsubscribe")
      setHasSubscription(false)
      setSelectedCategories([])
      setSelectedTags([])
      setFrequency(3)
      onClose()
    } catch (err) {
      console.error("Unsubscribe error:", err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullScreen={fullScreen} maxWidth="sm" fullWidth>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
        <Typography variant="h5" gutterBottom>
          {hasSubscription ? "Twoje preferencje newslettera" : "Zapisz się na newsletter"}
        </Typography>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Typography variant="subtitle2" color="text.secondary">
              Kategorie
            </Typography>
            <FormGroup>
              {MAIN_CATEGORIES.map(cat => (
                <FormControlLabel
                  key={cat.id}
                  control={
                    <Checkbox
                      checked={selectedCategories.includes(cat.id)}
                      onChange={() => toggleCategory(cat.id)}
                    />
                  }
                  label={cat.label}
                />
              ))}
            </FormGroup>

            <Typography variant="subtitle2" color="text.secondary">
              Cechy
            </Typography>
            {tagGroups.map(group => (
              <Box key={group.type} sx={{ mb: 1 }}>
                <Typography
                  sx={{
                    fontSize: "0.7rem",
                    fontWeight: 500,
                    color: "#9e9e9e",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    mb: 0.5
                  }}
                >
                  {group.label}
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {group.tags.map(tag => {
                    const isSelected = selectedTags.includes(tag.id)
                    return (
                      <Chip
                        key={tag.id}
                        label={tag.name}
                        size="small"
                        onClick={() => toggleTag(tag.id)}
                        sx={{
                          cursor: "pointer",
                          fontWeight: 500,
                          fontSize: "0.78rem",
                          transition: "all 0.15s ease",
                          ...(isSelected
                            ? {
                                backgroundColor: "#ff6b35",
                                color: "white",
                                borderColor: "#ff6b35",
                                "&:hover": { backgroundColor: "#e55a2b" }
                              }
                            : {
                                backgroundColor: "transparent",
                                color: "#424242",
                                border: "1px solid #bdbdbd",
                                "&:hover": {
                                  borderColor: "#ff6b35",
                                  color: "#ff6b35",
                                  backgroundColor: "rgba(255, 107, 53, 0.06)"
                                }
                              })
                        }}
                      />
                    )
                  })}
                </Box>
              </Box>
            ))}

            <TextField
              select
              label="Częstotliwość"
              value={frequency}
              onChange={e => setFrequency(Number(e.target.value))}
              sx={{ mt: 1 }}
            >
              {FREQUENCIES.map(f => (
                <MenuItem key={f.value} value={f.value}>
                  {f.label}
                </MenuItem>
              ))}
            </TextField>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        {hasSubscription && !loading && (
          <Button
            onClick={handleUnsubscribe}
            color="error"
            disabled={submitting}
            sx={{ mr: "auto" }}
          >
            Wypisz się
          </Button>
        )}
        <Button onClick={onClose} disabled={submitting}>
          Anuluj
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || submitting || selectedCategories.length === 0}
        >
          {submitting ? (
            <CircularProgress size={20} color="inherit" />
          ) : hasSubscription ? (
            "Zapisz zmiany"
          ) : (
            "Zapisz się"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
