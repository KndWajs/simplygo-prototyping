import { Button } from "@mui/material"
import Link from "next/link"

import { MenuLoader } from "components/features/menuLoader"
import { NavigationProvider } from "components/navigationProvider/navigationProvider"
import "./layout.scss"

export const YOUR_LOCALIZATION_TEXT = "Twoja lokalizacja"

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="layout-menu">
        <MenuLoader />
      </div>
      <div className="layout">
        {/* <SnackbarProvider maxSnack={5} /> */}
        {/* <LoginPopup /> */}
        {/* <VersionMismatchModal /> */}
        <NavigationProvider>
          <div className="layout-content">{children}</div>
        </NavigationProvider>
        <footer className="layout-footer">
          <Button>© 2026 Simplygo. Wszelkie prawa zastrzeżone</Button>
          <div className={"mobile-hidden sticky-bottom"}>
            {" "}
            |
            <Button component={Link} href="/about" color="secondary">
              O nas
            </Button>{" "}
            |
            <Button component={Link} href="/terms-conditions" color="secondary">
              Regulamin
            </Button>{" "}
            |
            <Button component={Link} href="/privacy-policy" color="secondary">
              Polityka prywatności
            </Button>
          </div>
        </footer>
      </div>
    </>
  )
}
