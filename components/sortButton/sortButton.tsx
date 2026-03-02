"use client"

import CloseIcon from "@mui/icons-material/Close"
import SortIcon from "@mui/icons-material/SwapVert"
import CheckIcon from "@mui/icons-material/Check"
import {
  Box,
  Button,
  Drawer,
  FormControl,
  IconButton,
  InputLabel,
  List,
  ListItemButton,
  ListItemText,
  MenuItem,
  Select,
  type SelectChangeEvent,
  Typography
} from "@mui/material"
import type { GetActivitiesQuery } from "models/domainDtos"
import { OrderByDtoArray, OrderByDtoLabel, type OrderByDto } from "models/OrderByDto"
import { updateUrlWithQuery } from "models/services/filters.service"
import { useNavigation } from "components/navigationProvider/navigationProvider"
import { usePathname } from "next/navigation"
import { useState, useId } from "react"

interface SortButtonProps {
  label: string
  query: GetActivitiesQuery
}

export function SortButton({ label, query }: SortButtonProps) {
  const { replace } = useNavigation()
  const pathname = usePathname()
  const labelId = useId()
  const [isOpen, setIsOpen] = useState(false)

  const handleChange = (event: SelectChangeEvent<OrderByDto>) => {
    updateUrlWithQuery({
      pathname,
      query: {
        ...query,
        orderBy: event.target.value as OrderByDto
      },
      navigate: replace
    })
  }

  const handleSelect = (orderBy: OrderByDto) => {
    updateUrlWithQuery({
      pathname,
      query: { ...query, orderBy },
      navigate: replace
    })
    setIsOpen(false)
  }

  return (
    <>
      {/* Desktop: inline Select */}
      <Box sx={{ display: { xs: "none", md: "block" } }}>
        <FormControl size="small" fullWidth>
          <InputLabel id={labelId}>{label}</InputLabel>
          <Select labelId={labelId} value={query.orderBy} label={label} onChange={handleChange}>
            {OrderByDtoArray.map(orderBy => (
              <MenuItem key={orderBy} value={orderBy}>
                {OrderByDtoLabel[orderBy]}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Mobile: button that opens drawer */}
      <Box sx={{ display: { xs: "block", md: "none" } }}>
        <Button variant="text" sx={{ display: "flex", gap: "8px" }} onClick={() => setIsOpen(true)}>
          <SortIcon className="primary-500" />
          <Typography variant="h6" className="primary-500">
            Sortuj
          </Typography>
        </Button>

        <Drawer
          anchor="right"
          open={isOpen}
          onClose={() => setIsOpen(false)}
          style={{ zIndex: 1300 }}
        >
          <IconButton sx={{ alignSelf: "flex-end", m: 1 }} onClick={() => setIsOpen(false)}>
            <CloseIcon />
          </IconButton>

          <Box sx={{ px: 3, width: "100%" }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              {label}
            </Typography>
            <List disablePadding>
              {OrderByDtoArray.map(orderBy => (
                <ListItemButton
                  key={orderBy}
                  selected={query.orderBy === orderBy}
                  onClick={() => handleSelect(orderBy)}
                  sx={{ borderRadius: "8px", mb: 0.5 }}
                >
                  <ListItemText primary={OrderByDtoLabel[orderBy]} />
                  {query.orderBy === orderBy && <CheckIcon color="primary" />}
                </ListItemButton>
              ))}
            </List>
          </Box>

          <Box sx={{ flex: 1 }} />

          <Box
            sx={{
              px: 3,
              pb: 2,
              pt: 2,
              bottom: 0,
              position: "sticky",
              width: "100%",
              background: "white",
              zIndex: 5,
              mt: 4,
              boxShadow: "0 -1px 2px rgba(0,0,0,0.1)"
            }}
          >
            <Button variant="contained" color="primary" onClick={() => setIsOpen(false)} fullWidth>
              Gotowe
            </Button>
          </Box>
        </Drawer>
      </Box>
    </>
  )
}
