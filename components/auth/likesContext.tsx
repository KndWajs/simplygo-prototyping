"use client"

import { useAuth0 } from "@auth0/auth0-react"
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react"
import {
  fetchCurrentUser,
  fetchUserRatedActivities,
  rateActivity
} from "../../models/services/activities.service"

interface LikesContextValue {
  likedIds: Set<string>
  dislikedIds: Set<string>
  like: (activityId: string) => Promise<void>
  dislike: (activityId: string) => Promise<void>
  unlike: (activityId: string) => Promise<void>
  isReady: boolean
}

const LikesContext = createContext<LikesContextValue>({
  likedIds: new Set(),
  dislikedIds: new Set(),
  like: async () => {},
  dislike: async () => {},
  unlike: async () => {},
  isReady: false
})

export function useLikes() {
  return useContext(LikesContext)
}

export function LikesProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0()
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set())
  const [dislikedIds, setDislikedIds] = useState<Set<string>>(new Set())
  const [isReady, setIsReady] = useState(false)
  const loadedRef = useRef(false)

  useEffect(() => {
    if (!isAuthenticated) {
      setLikedIds(new Set())
      setDislikedIds(new Set())
      setIsReady(false)
      loadedRef.current = false
      return
    }
    if (loadedRef.current) return
    loadedRef.current = true
    ;(async () => {
      try {
        const token = await getAccessTokenSilently()
        const user = await fetchCurrentUser(token)
        if (!user?.id) return

        const [liked, disliked] = await Promise.all([
          fetchUserRatedActivities(user.id, 1, token),
          fetchUserRatedActivities(user.id, -1, token)
        ])
        setLikedIds(new Set(liked))
        setDislikedIds(new Set(disliked))
        setIsReady(true)
      } catch (err) {
        console.error("Failed to load user likes:", err)
      }
    })()
  }, [isAuthenticated, getAccessTokenSilently])

  const like = useCallback(
    async (activityId: string) => {
      try {
        const token = await getAccessTokenSilently()
        const res = await rateActivity(activityId, 1, token)
        if (res) {
          setLikedIds(prev => new Set(prev).add(activityId))
          setDislikedIds(prev => {
            const next = new Set(prev)
            next.delete(activityId)
            return next
          })
        }
      } catch (err) {
        console.error("Failed to like activity:", err)
      }
    },
    [getAccessTokenSilently]
  )

  const dislike = useCallback(
    async (activityId: string) => {
      try {
        const token = await getAccessTokenSilently()
        const res = await rateActivity(activityId, -1, token)
        if (res) {
          setDislikedIds(prev => new Set(prev).add(activityId))
          setLikedIds(prev => {
            const next = new Set(prev)
            next.delete(activityId)
            return next
          })
        }
      } catch (err) {
        console.error("Failed to dislike activity:", err)
      }
    },
    [getAccessTokenSilently]
  )

  const unlike = useCallback(
    async (activityId: string) => {
      try {
        const token = await getAccessTokenSilently()
        const res = await rateActivity(activityId, 0, token)
        if (res) {
          setLikedIds(prev => {
            const next = new Set(prev)
            next.delete(activityId)
            return next
          })
          setDislikedIds(prev => {
            const next = new Set(prev)
            next.delete(activityId)
            return next
          })
        }
      } catch (err) {
        console.error("Failed to unlike activity:", err)
      }
    },
    [getAccessTokenSilently]
  )

  return (
    <LikesContext.Provider value={{ likedIds, dislikedIds, like, dislike, unlike, isReady }}>
      {children}
    </LikesContext.Provider>
  )
}
