"use client"

import { useRouter } from "next/navigation"
import { createContext, useContext, useTransition, useCallback, type ReactNode } from "react"

interface NavigationContextValue {
  isPending: boolean
  replace: (url: string) => void
}

const NavigationContext = createContext<NavigationContextValue>({
  isPending: false,
  replace: () => {}
})

export function NavigationProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const replace = useCallback(
    (url: string) => {
      startTransition(() => {
        router.replace(url)
      })
    },
    [router]
  )

  return (
    <NavigationContext.Provider value={{ isPending, replace }}>
      {children}
    </NavigationContext.Provider>
  )
}

export function useNavigation() {
  return useContext(NavigationContext)
}
