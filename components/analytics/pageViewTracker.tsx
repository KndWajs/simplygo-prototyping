"use client"

import { usePathname, useSearchParams } from "next/navigation"
import { useEffect } from "react"

export const PageViewTracker = ({ measurementId }: { measurementId: string }) => {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    const search = searchParams?.toString()
    const path = `${pathname}${search ? `?${search}` : ""}`
    // @ts-ignore
    window.gtag?.("config", measurementId, {
      page_path: path,
      page_title: document.title
    })
  }, [pathname, searchParams, measurementId])

  return null
}
