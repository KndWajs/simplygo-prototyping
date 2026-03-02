import { Address } from "../domainDtos"

const API_URL = process.env.NEXT_PUBLIC_API_URL

export async function getAddressPrompt(
  address: string,
  includePlaces?: boolean
): Promise<string[]> {
  const params = new URLSearchParams({ address })
  if (includePlaces) params.set("includePlaces", "true")
  const res = await fetch(`${API_URL}/Addresses/prompt?${params.toString()}`)
  if (!res.ok) return []
  return await res.json()
}

export async function geocodeAddress(address: string): Promise<Address> {
  const res = await fetch(`${API_URL}/Addresses/geocode/${encodeURIComponent(address)}`)
  if (!res.ok) throw new Error("Geocode failed")
  return await res.json()
}

export async function reverseGeocode(latitude: number, longitude: number): Promise<Address> {
  const res = await fetch(`${API_URL}/Addresses/reversegeocode`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ latitude, longitude })
  })
  if (!res.ok) throw new Error("Reverse geocode failed")
  return await res.json()
}
