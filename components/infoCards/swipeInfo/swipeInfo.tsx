import SwipeIcon from "@mui/icons-material/Swipe"
import ThumbDownAltOutlined from "@mui/icons-material/ThumbDownAltOutlined"
import ThumbUpAltOutlined from "@mui/icons-material/ThumbUpAltOutlined"
import { Box, Divider, Stack, Typography } from "@mui/material"

export const SwipeInfo = () => {
  return (
    <Box
      sx={{
        height: "100%",
        background: "linear-gradient(135deg, #ffffff, #f9f9f9)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        p: 3,
        textAlign: "center",
        color: "#333"
      }}
    >
      <SwipeIcon sx={{ fontSize: 60, color: "#ff6b35", mb: 2 }} />

      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: "#424242" }}>
        Przesuń, aby wybrać
      </Typography>
      <Typography
        variant="body2"
        sx={{ maxWidth: 320, color: "text.secondary", mb: 3, fontSize: 14, lineHeight: 1.4 }}
      >
        Przesuń w prawo, by dodać do ulubionych.
      </Typography>

      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ width: "100%", mt: 1 }}
      >
        <Stack alignItems="center" spacing={1}>
          <ThumbDownAltOutlined sx={{ color: "#999" }} />
          <Typography variant="body2" sx={{ color: "#424242" }}>
            W lewo - nie polecam
          </Typography>
        </Stack>

        <Divider orientation="vertical" flexItem />

        <Stack alignItems="center" spacing={1}>
          <ThumbUpAltOutlined color="primary" />
          <Typography variant="body2" sx={{ color: "#424242" }}>
            W prawo - ulubione
          </Typography>
        </Stack>
      </Stack>
    </Box>
  )
}
