"use client"

import { useAuth0 } from "@auth0/auth0-react"
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline"
import GavelIcon from "@mui/icons-material/Gavel"
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined"
import MenuIcon from "@mui/icons-material/Menu"
import PrivacyTipIcon from "@mui/icons-material/PrivacyTip"
import ThumbUpOffAltIcon from "@mui/icons-material/ThumbUpOffAlt"
import {
  Button,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu as MuiMenu,
  Skeleton,
  Typography
} from "@mui/material"
import MenuItem from "@mui/material/MenuItem"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Logo } from "./logo/logo"
import UserAvatar from "../userAvatar/userAvatar"
import "./menu.scss"

const NAV_ITEMS = [
  { label: "Moje aktywności", icon: <ThumbUpOffAltIcon />, href: "/my-activities" },
  { label: "Dodaj aktywność", icon: <AddCircleOutlineIcon />, href: "/add-activity" }
]

const NAV_ITEMS_SECOND = [
  { label: "O nas", icon: <InfoOutlinedIcon />, href: "/about" },
  { label: "Regulamin", icon: <GavelIcon />, href: "/terms-conditions" },
  { label: "Polityka prywatności", icon: <PrivacyTipIcon />, href: "/privacy-policy" }
]

export const Menu: React.FC = () => {
  const { loginWithRedirect, isAuthenticated, isLoading, user, logout } = useAuth0()

  const handleLogin = () => {
    // @ts-ignore
    window.gtag?.("event", "signup")
    const returnTo = window.location.pathname + window.location.search
    localStorage.setItem("auth_return_to", returnTo)
    loginWithRedirect({ appState: { returnTo } })
  }

  const [openMenu, setOpenMenu] = useState(false)

  const toggleDrawer = (state: boolean) => {
    setOpenMenu(state)
  }

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }

  const pathname = usePathname()
  const isSm = window.matchMedia("(max-width: 600px)").matches
  const homePage = pathname === "/"

  return (
    <div className="menu-class">
      <Logo className={isSm && homePage ? "neutral-50" : "primary-500"} />
      <div className="buttons">
        <div className="top">
          <div className={"mobile-hidden"}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {NAV_ITEMS.map(item => (
                <Button
                  component={Link}
                  href={item.href}
                  size="medium"
                  // @ts-ignore
                  color="text"
                  startIcon={item.icon}
                  key={item.label}
                >
                  {item.label}
                </Button>
              ))}
              {isLoading ? (
                <Skeleton variant="rounded" width={80} height={36} />
              ) : isAuthenticated ? (
                <div>
                  <Button
                    id="basic-button"
                    aria-controls={open ? "basic-menu" : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? "true" : undefined}
                    onClick={handleClick}
                  >
                    <UserAvatar user={user} />
                  </Button>
                  <MuiMenu
                    id="basic-menu"
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                    slotProps={{
                      list: {
                        "aria-labelledby": "basic-button"
                      }
                    }}
                  >
                    <MenuItem
                      onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
                    >
                      Wyloguj
                    </MenuItem>
                  </MuiMenu>
                </div>
              ) : (
                <Button variant="contained" color="primary" onClick={handleLogin}>
                  Zaloguj
                </Button>
              )}
            </div>
          </div>
          <div className={"desktop-hidden"}>
            <IconButton component={Link} href="/add-activity">
              <AddCircleOutlineIcon className={homePage ? "neutral-100 " : "neutral-800"} />
            </IconButton>
            <IconButton className="blur-bg" aria-label="menu" onClick={() => toggleDrawer(true)}>
              <MenuIcon
                className={homePage ? "neutral-100 " : "neutral-800"}
                style={{ transition: "color 0.5s ease" }}
              />
            </IconButton>
          </div>
        </div>
      </div>
      <Drawer
        anchor="top"
        open={openMenu}
        onClose={() => toggleDrawer(false)}
        onClick={() => toggleDrawer(false)}
        onKeyDown={() => toggleDrawer(false)}
      >
        <List>
          {NAV_ITEMS.map(nav => (
            <ListItem key={nav.label} disablePadding>
              <ListItemButton component={Link} href={nav.href}>
                <ListItemIcon>{nav.icon}</ListItemIcon>
                <ListItemText primary={nav.label} />
              </ListItemButton>
            </ListItem>
          ))}

          {isLoading ? (
            <ListItem key={"loading"} disablePadding>
              <ListItemButton sx={{ display: "flex", justifyContent: "center" }}>
                <Skeleton variant="rounded" width={80} height={36} />
              </ListItemButton>
            </ListItem>
          ) : isAuthenticated ? (
            <ListItem key={"logout"} disablePadding>
              <ListItemButton
                sx={{ display: "flex", justifyContent: "center", gap: "8px" }}
                onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
              >
                <UserAvatar user={user} />
                Wyloguj
              </ListItemButton>
            </ListItem>
          ) : (
            <ListItem key={"login"} disablePadding>
              <ListItemButton
                sx={{ display: "flex", justifyContent: "center" }}
                onClick={handleLogin}
              >
                <Button variant="contained" color="primary">
                  Zaloguj
                </Button>
              </ListItemButton>
            </ListItem>
          )}
        </List>
        <Divider />
        <List>
          {NAV_ITEMS_SECOND.map(nav => (
            <ListItem key={nav.label + "_second"} disablePadding>
              <ListItemButton component={Link} href={nav.href} sx={{ height: "32px" }}>
                <Typography variant="overline">{nav.label}</Typography>
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
    </div>
  )
}
