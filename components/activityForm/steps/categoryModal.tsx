"use client"

import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  Typography,
  useMediaQuery,
  useTheme
} from "@mui/material"
import React from "react"
import { Control, useWatch } from "react-hook-form"
import { CategoryDto } from "../../../models/dtos/GetCategoriesQueryResponse"
import { SubcategoryTree } from "./subcategoryTree"

const EVENTS_ID = "1"
const SPORT_ID = "2"
const KIDS_ID = "3"

interface CategoryModalProps {
  control: Control<any>
  open: boolean
  setOpen: (open: boolean) => void
  categories: CategoryDto[]
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  control,
  open,
  setOpen,
  categories
}) => {
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"))

  const audience = useWatch({ control, name: "audience" })
  const sportEvent = useWatch({ control, name: "sportEvent" })

  return (
    <Dialog open={open} onClose={() => setOpen(false)} fullScreen={fullScreen}>
      <DialogContent
        sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2, minWidth: "350px" }}
      >
        <Typography variant="h5" gutterBottom>
          Wybierz kategorie
        </Typography>

        <Alert severity="info">
          Wybierz co najmniej jedną podkategorię z dostępnych kategorii głównych (Rozrywka, Sport,
          Dla dzieci). Max 3 na kategorię.
        </Alert>

        {audience != "kids" && !sportEvent && (
          <>
            <Typography
              variant="h6"
              color="textSecondary"
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              Wydarzenia
            </Typography>
            <SubcategoryTree
              control={control}
              name="event"
              categories={categories.find(c => c.mainCategory === EVENTS_ID)?.children || []}
              onSelectedItemsChange={() => {}}
              checkboxOnlyForLeaves
              maxSelectedItems={3}
            />
            <Divider />
          </>
        )}
        {audience != "kids" && sportEvent && (
          <>
            <Typography
              variant="h6"
              color="textSecondary"
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              Sport
            </Typography>
            <SubcategoryTree
              control={control}
              name="sport"
              categories={categories.find(c => c.mainCategory === SPORT_ID)?.children || []}
              onSelectedItemsChange={() => {}}
              checkboxOnlyForLeaves
              maxSelectedItems={3}
            />
            <Divider />
          </>
        )}
        {audience != "adults" && (
          <>
            <Typography
              variant="h6"
              color="textSecondary"
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              Dla dzieci
            </Typography>
            <SubcategoryTree
              control={control}
              name="kids"
              categories={categories.find(c => c.mainCategory === KIDS_ID)?.children || []}
              onSelectedItemsChange={() => {}}
              checkboxOnlyForLeaves
              maxSelectedItems={3}
            />
            <Divider />
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpen(false)}>Zatwierdź</Button>
      </DialogActions>
    </Dialog>
  )
}
