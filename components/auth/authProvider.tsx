"use client"

import { Auth0Provider } from "@auth0/auth0-react"
import { LikesProvider } from "./likesContext"

const domain = process.env.NEXT_PUBLIC_AUTH0_DOMAIN ?? ""
const clientId = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID ?? ""
const audience = process.env.NEXT_PUBLIC_AUTH0_AUDIENCE ?? ""

export function AuthProvider({ children }: { children: React.ReactNode }) {
  if (!domain || !clientId) {
    return <>{children}</>
  }

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: typeof window !== "undefined" ? window.location.origin + "/callback" : "",
        audience,
        scope: "openid profile email offline_access"
      }}
      cacheLocation="localstorage"
      useRefreshTokens
      useRefreshTokensFallback
      onRedirectCallback={() => {
        const returnTo = localStorage.getItem("auth_return_to") || "/"
        localStorage.removeItem("auth_return_to")
        window.location.replace(returnTo)
      }}
    >
      <LikesProvider>{children}</LikesProvider>
    </Auth0Provider>
  )
}
