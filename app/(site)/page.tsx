import { Box, Container, Typography } from "@mui/material"
import { CitySelector } from "components/citySelector/citySelector"
import { CtaButtons } from "components/ctaButtons/ctaButtons"
import { QuickSearchBar } from "components/quickSearchBar/quickSearchBar"
import { CategorySection } from "components/landingSections/categorySection"
import { EventsPlacesSection } from "components/landingSections/eventsPlacesSection"
import { FiltersSection } from "components/landingSections/filtersSection"
import { MapSection } from "components/landingSections/mapSection"
import { CATEGORIES } from "../../data/categories"
import type { Metadata } from "next"

function HeroImagePreload() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/main-pic.webp"
      alt=""
      fetchPriority="high"
      style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
    />
  )
}

export const dynamic = "force-static"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://simplygo.pl"
const HOME_TITLE = "Simplygo – Wydarzenia, miejsca i aktywności"
const HOME_DESCRIPTION =
  "Znajdź najpopularniejsze wydarzenia i miejsca sportowe, rozrywkowe oraz rodzinne w Twojej okolicy z Simplygo."

export const metadata: Metadata = {
  title: HOME_TITLE,
  description: HOME_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    url: SITE_URL,
    siteName: "Simplygo",
    images: [{ url: `${SITE_URL}/share.png`, alt: "Simplygo" }],
    locale: "pl_PL",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    images: [`${SITE_URL}/share.png`]
  },
  other: {
    "theme-color": "#ff6b35"
  }
}

export default function Home() {
  const categories = CATEGORIES

  return (
    <>
      <HeroImagePreload />
      <style>{`body { background-color: #050505; }`}</style>
      <Box
        component="section"
        sx={{
          position: "relative",
          color: "white",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          "&::before": {
            content: '""',
            position: "absolute",
            top: { xs: -56, sm: 0 },
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage:
              'linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.8)), image-set(url("/main-pic.webp") type("image/webp"), url("/main-pic.jpg") type("image/jpeg"))',
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat"
          }
        }}
      >
        <Container
          maxWidth="lg"
          sx={{
            position: "relative",
            py: { xs: 2, md: 12 },
            pb: { xs: 8, md: 12 },
            textAlign: "center"
          }}
        >
          <Box maxWidth="900px" mx="auto">
            <Typography
              variant="h1"
              className="no-select"
              sx={{
                fontSize: { xs: "2.5rem", sm: "3.5rem", lg: "3.8rem" },
                fontWeight: "bold",
                mb: 3,
                lineHeight: 1.2
                // display: { xs: "block", md: "none" }
              }}
            >
              Znajdź okazję, by{" "}
              <Box component="span" sx={{ color: "#ff6b35" }}>
                wyjść z domu.
              </Box>
            </Typography>

            {/* Subheading */}
            <Typography
              variant="h4"
              className="no-select"
              sx={{
                fontSize: { xs: "1.2rem", sm: "1.4rem" },
                color: "#d1d5db",
                mb: { xs: "44px", md: "74px" },
                fontWeight: 400
              }}
            >
              Nie przegap aktywności, które czynią dzień{" "}
              <Box component="span" sx={{ color: "#ff6b35" }}>
                wyjątkowym.
              </Box>
            </Typography>

            <CtaButtons categories={categories} />
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column-reverse", md: "column" },
              alignItems: "center",
              gap: { xs: "32px", md: "56px" }
            }}
          >
            <CitySelector />
          </Box>
          <Box
            sx={{
              width: "100%",
              mt: 6
            }}
          />
          <QuickSearchBar />
        </Container>
      </Box>
      <CategorySection />
      <EventsPlacesSection />
      <FiltersSection />
      <MapSection />
    </>
  )
}
