import StarIcon from "@mui/icons-material/Star"
import { Box, Typography } from "@mui/material"

interface RatingProps {
  rating: number
}

export const RatingComponent = ({ rating }: RatingProps) => {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <StarIcon fontSize="medium" sx={{ color: "#f5c518" }} />
      <Typography variant="body2" color="text.secondary">
        {rating == 0 ? "-/5" : `${rating.toFixed(1)}/5`}
      </Typography>
    </Box>
  )
}
