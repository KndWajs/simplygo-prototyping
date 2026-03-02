"use client"

import { Link as MuiLink } from "@mui/material"
import type { SxProps } from "@mui/material"

interface TrackedContactLinkProps {
  href: string
  method: "email" | "phone"
  sx?: SxProps
  children: React.ReactNode
}

export const TrackedContactLink = ({ href, method, sx, children }: TrackedContactLinkProps) => {
  return (
    <MuiLink
      href={href}
      underline="hover"
      sx={sx}
      onClick={() => {
        // @ts-ignore
        window.gtag?.("event", "contact_click", { method })
      }}
    >
      {children}
    </MuiLink>
  )
}
