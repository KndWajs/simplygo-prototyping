import type { Metadata } from "next"
import Script from "next/script"
import { Suspense } from "react"
import "./globals.scss"
import ThemeRegistry from "../theme/ThemeRegistry"
import { AuthProvider } from "../components/auth/authProvider"
import { PageViewTracker } from "../components/analytics/pageViewTracker"
import "@fontsource/roboto/300.css"
import "@fontsource/roboto/400.css"
import "@fontsource/roboto/500.css"
import "@fontsource/roboto/700.css"

const GA_MEASUREMENT_ID = "G-VBFBHSM9Q4"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://simplygo.pl"
const isAnalyticsEnabled = process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === "true"

const DEFAULT_TITLE = "Simplygo – codziennie nowa porcja atrakcji."
const DEFAULT_DESCRIPTION =
  "Simplygo to aplikacja z codzienną porcją atrakcji. Wyszukuj sport, rozrywkę i wydarzenia dla dzieci, dodawaj własne aktywności. Wszystkie miejsca i wydarzenia znajdziesz na mapie."

export const metadata: Metadata = {
  title: {
    default: DEFAULT_TITLE,
    template: "%s | Simplygo"
  },
  description: DEFAULT_DESCRIPTION,
  icons: {
    icon: "/logo_icon.png"
  },
  openGraph: {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    url: SITE_URL,
    siteName: "Simplygo",
    images: [{ url: `${SITE_URL}/share.png`, alt: "Simplygo" }],
    locale: "pl_PL",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [`${SITE_URL}/share.png`]
  }
}

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Simplygo",
  url: SITE_URL,
  inLanguage: "pl",
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/wydarzenia?searchTerm={search_term_string}`,
    "query-input": "required name=search_term_string"
  }
}

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Simplygo",
  url: SITE_URL,
  logo: `${SITE_URL}/logo_icon.png`
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <body>
        {isAnalyticsEnabled && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
              strategy="lazyOnload"
            />
            <Script id="google-analytics" strategy="lazyOnload">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_MEASUREMENT_ID}');
              `}
            </Script>
          </>
        )}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <AuthProvider>
          <ThemeRegistry>
            {isAnalyticsEnabled && (
              <Suspense>
                <PageViewTracker measurementId={GA_MEASUREMENT_ID} />
              </Suspense>
            )}
            {children}
          </ThemeRegistry>
        </AuthProvider>
      </body>
    </html>
  )
}
