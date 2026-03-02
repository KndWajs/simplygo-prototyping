import type { Metadata } from "next"
import { Box, Container, Typography } from "@mui/material"

export const dynamic = "force-static"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://simplygo.pl"
const ABOUT_TITLE = "O nas - Simplygo"
const ABOUT_DESCRIPTION =
  "Simplygo to platforma aktywności lokalnych - odkrywaj wydarzenia, miejsca i atrakcje dla siebie oraz rodziny."

export const metadata: Metadata = {
  title: ABOUT_TITLE,
  description: ABOUT_DESCRIPTION,
  alternates: { canonical: "/about" },
  openGraph: {
    title: ABOUT_TITLE,
    description: ABOUT_DESCRIPTION,
    url: `${SITE_URL}/about`,
    siteName: "Simplygo",
    locale: "pl_PL",
    type: "website"
  },
  twitter: {
    card: "summary",
    title: ABOUT_TITLE,
    description: ABOUT_DESCRIPTION
  }
}

function Section({ title, paragraphs }: { title: string; paragraphs: string[] }) {
  return (
    <Box component="section" sx={{ mb: 4 }}>
      <Typography component="h2" variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
        {title}
      </Typography>
      {paragraphs.map(paragraph => (
        <Typography key={paragraph} paragraph sx={{ mb: 1.5 }}>
          {paragraph}
        </Typography>
      ))}
    </Box>
  )
}

export default function AboutPage() {
  return (
    <Container component="article" maxWidth="md" sx={{ py: { xs: 3, md: 6 } }}>
      <Typography component="h1" variant="h3" sx={{ mb: 3, fontWeight: 700 }}>
        O Simplygo
      </Typography>
      <Typography paragraph sx={{ mb: 4 }}>
        Simplygo to aplikacja z codzienną porcją inspiracji na aktywne spędzanie czasu. Sport,
        rozrywka i atrakcje dla dzieci - wszystko w jednym miejscu, zawsze pod ręką.
      </Typography>

      <Section
        title="Dla użytkowników"
        paragraphs={[
          "Simplygo powstało z myślą o tych, którzy lubią spędzać czas aktywnie i chcą korzystać z tego, co oferuje ich miasto i okolica.",
          "Wygodne wyszukiwanie pozwala przeglądać wydarzenia po adresie, dacie, kategorii i na mapie.",
          "Codzienna dawka inspiracji obejmuje treningi, koncerty, warsztaty i atrakcje rodzinne.",
          "Możesz dodawać i udostępniać aktywności, a zapisane wydarzenia trzymać w swojej prywatnej liście.",
          "Integracja z kalendarzem Google pomaga planować czas i niczego nie przegapić.",
          "Treści są moderowane przez AI i człowieka, dzięki czemu informacje są bardziej wiarygodne i aktualne."
        ]}
      />

      <Section
        title="Dla biznesu i organizatorów"
        paragraphs={[
          "Simplygo jest także narzędziem dla organizatorów i firm, które chcą docierać do nowych odbiorców.",
          "Wydarzenia i miejsca trafiają do osób, które aktywnie szukają atrakcji w danym mieście.",
          "Dodawanie aktywności jest proste i szybkie, co ułatwia codzienną promocję oferty.",
          "Użytkownicy mogą polubić i udostępniać wydarzenia, co wspiera budowanie społeczności.",
          "Transparentna moderacja treści zwiększa zaufanie i wiarygodność marki.",
          "Zaczynaliśmy lokalnie, a celem projektu jest dalszy rozwój w skali całego kraju."
        ]}
      />
    </Container>
  )
}
