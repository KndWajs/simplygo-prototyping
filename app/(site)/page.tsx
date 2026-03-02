import { Box, Container, Typography } from "@mui/material"
import { CitySelector } from "components/citySelector/citySelector"
import { CtaButtons } from "components/ctaButtons/ctaButtons"
import { QuickSearchBar } from "components/quickSearchBar/quickSearchBar"
import { CATEGORIES } from "../../data/categories"
import type { Metadata } from "next"

export const dynamic = "force-static"

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
      <style>{`body { background-color: #000; }`}</style>
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
              }}
            >
              Znajdź okazję, by{" "}
              <Box component="span" sx={{ color: "#ff6b35" }}>
                wyjść z domu.
              </Box>
            </Typography>

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
          <Box sx={{ width: "100%", mt: 6 }} />
          <QuickSearchBar />
        </Container>
      </Box>
      <CategorySection />
    </>
  )
}

function CategorySection() {
  return (
    <section style={{ backgroundColor: "#0a0a0a", padding: "64px 16px" }}>
      <div style={{ maxWidth: "1152px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <span
            style={{
              color: "#ff6b35",
              fontWeight: 600,
              letterSpacing: "0.15em",
              fontSize: "0.8rem",
              textTransform: "uppercase",
              display: "block",
              marginBottom: "12px"
            }}
          >
            3 kategorie
          </span>
          <h2
            style={{
              fontWeight: 700,
              color: "white",
              fontSize: "clamp(1.9rem, 4vw, 3rem)",
              lineHeight: 1.2,
              margin: "0 0 16px"
            }}
          >
            {"Wybierz "}
            <span style={{ color: "#ff6b35" }}>{"główną kategorię"}</span>
          </h2>
          <p
            style={{
              color: "#9ca3af",
              fontSize: "1rem",
              maxWidth: "560px",
              margin: "0 auto",
              lineHeight: 1.6
            }}
          >
            {"Przeglądaj aktywności według tego, co Cię interesuje."}
          </p>
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "24px",
            justifyContent: "center"
          }}
        >
          {[
            {
              id: "1",
              label: "Rozrywka",
              description: "Koncerty, wystawy, festiwale, warsztaty i wiele więcej",
              href: "/wydarzenia?occurrenceType=Events&orderBy=Recommended&dateRange=ThisWeek&categoryIds=1"
            },
            {
              id: "2",
              label: "Sport",
              description: "Zajęcia sportowe, siłownia, sporty wodne i drużynowe",
              href: "/wydarzenia?occurrenceType=Events&orderBy=Recommended&dateRange=ThisWeek&categoryIds=2"
            },
            {
              id: "3",
              label: "Dla dzieci",
              description: "Edukacja, zabawa, zajęcia kreatywne i wydarzenia rodzinne",
              href: "/wydarzenia?occurrenceType=Events&orderBy=Recommended&dateRange=ThisWeek&categoryIds=3"
            }
          ].map(cat => (
            <a
              key={cat.id}
              href={cat.href}
              style={{
                flex: "1 1 260px",
                maxWidth: "340px",
                padding: "32px 24px",
                backgroundColor: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,107,53,0.2)",
                borderRadius: "20px",
                cursor: "pointer",
                textDecoration: "none",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "16px",
                textAlign: "center"
              }}
            >
              <span style={{ fontWeight: 700, color: "white", fontSize: "1.25rem" }}>
                {cat.label}
              </span>
              <span style={{ color: "#9ca3af", fontSize: "0.9rem", lineHeight: 1.6 }}>
                {cat.description}
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
