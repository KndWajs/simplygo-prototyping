import type { MetadataRoute } from "next"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://simplygo.pl"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/callback", "/maintenance", "/my-activities", "/add-activity"]
    },
    sitemap: `${SITE_URL}/sitemap.xml`
  }
}
