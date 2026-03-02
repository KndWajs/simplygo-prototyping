const API_URL = process.env.NEXT_PUBLIC_API_URL

export interface NewsletterSubscriptionPayload {
  categoryIds: number[]
  tagIds: number[]
  frequency: number
  regionId: number
}

export interface NewsletterSubscriptionResponse {
  subscriptionId: string | null
  categoryIds: number[]
  tagIds: number[]
  frequency: number | null
  regionId: number | null
  isActive: boolean
  nextSendAt: string | null
  hasSubscription: boolean
}

export async function subscribeToNewsletter(
  token: string,
  payload: NewsletterSubscriptionPayload
): Promise<{ subscriptionId: string }> {
  const res = await fetch(`${API_URL}/Newsletter/subscribe`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Subscribe failed: ${res.status} ${text}`)
  }

  return res.json()
}

export async function getNewsletterSubscription(
  token: string
): Promise<NewsletterSubscriptionResponse> {
  const res = await fetch(`${API_URL}/Newsletter`, {
    headers: { Authorization: `Bearer ${token}` }
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Get subscription failed: ${res.status} ${text}`)
  }

  return res.json()
}

export async function updateNewsletterSubscription(
  token: string,
  payload: NewsletterSubscriptionPayload
): Promise<void> {
  const res = await fetch(`${API_URL}/Newsletter`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Update failed: ${res.status} ${text}`)
  }
}

export async function unsubscribeFromNewsletter(token: string): Promise<void> {
  const res = await fetch(`${API_URL}/Newsletter/unsubscribe`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Unsubscribe failed: ${res.status} ${text}`)
  }
}
