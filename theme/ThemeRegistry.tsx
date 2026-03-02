"use client"

import { createTheme, CssBaseline, ThemeProvider } from "@mui/material"
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter"

export const SPORT_COLOR = "#126BA3"
export const KIDS_COLOR = "#EF6C00"
export const EVENT_COLOR = "#F2AB28"

export const theme = createTheme({
  palette: {
    primary: {
      main: "#ff6b35",
      light: "#ffb9a0",
      dark: "#9e3f1d",
      contrastText: "#FFFFFF"
    },
    secondary: {
      main: "#9933FF",
      light: "#B366FF",
      dark: "#7a00cc",
      contrastText: "#FFFFFF"
    },
    info: {
      main: "#007BFF",
      light: "#339CFF",
      dark: "#0056b3",
      contrastText: "#FFFFFF"
    },
    // @ts-ignore TODO
    kids: {
      main: KIDS_COLOR,
      contrastText: "#FFFFFF"
    },
    sport: {
      main: SPORT_COLOR,
      contrastText: "#FFFFFF"
    },
    event: {
      main: EVENT_COLOR,
      contrastText: "#FFFFFF"
    },
    grey: {
      50: "#FFFFFF",
      300: "#E0E0E0",
      500: "#4A4A4A",
      700: "#212121"
    },
    background: {
      default: "#FFFFFF",
      paper: "#fcfcfc"
    },
    text: {
      primary: "#212121",
      secondary: "#4A4A4A"
    }
  },
  typography: {
    button: {
      textTransform: "none",
      fontWeight: 500,
      fontSize: "0.875rem"
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "50px"
        },
        contained: {},
        outlined: {}
      }
    }
  }
})

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  return (
    <AppRouterCacheProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </AppRouterCacheProvider>
  )
}
