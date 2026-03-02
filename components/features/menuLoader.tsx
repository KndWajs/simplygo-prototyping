"use client"

import dynamic from "next/dynamic"
import { Skeleton, Stack } from "@mui/material"
import { Logo } from "./logo/logo"
import "./menu.scss"

const Menu = dynamic(() => import("./menu").then(m => ({ default: m.Menu })), {
  ssr: false,
  loading: () => (
    <div className="menu-class">
      <Logo />
      <Stack direction="row" spacing={1} alignItems="center">
        <Skeleton
          variant="rounded"
          width={120}
          height={32}
          sx={{ display: { xs: "none", md: "block" } }}
        />
        <Skeleton
          variant="rounded"
          width={120}
          height={32}
          sx={{ display: { xs: "none", md: "block" } }}
        />
        <Skeleton
          variant="rounded"
          width={80}
          height={36}
          sx={{ display: { xs: "none", md: "block" } }}
        />
        <Skeleton
          variant="circular"
          width={32}
          height={32}
          sx={{ display: { xs: "block", md: "none" } }}
        />
        <Skeleton
          variant="circular"
          width={32}
          height={32}
          sx={{ display: { xs: "block", md: "none" } }}
        />
      </Stack>
    </div>
  )
})

export function MenuLoader() {
  return <Menu />
}
