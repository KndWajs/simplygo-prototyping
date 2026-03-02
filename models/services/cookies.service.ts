import type { Address } from "../domainDtos"

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const COOKIE_VERSION = "1.0.0"

const MAX_AGE = {
  short: 604_800, // 7 days
  long: 2_592_000 // 30 days
} as const

export enum HideableContent {
  PlacesSearch = "placesSearch",
  SwipeInfo = "swipeInfo"
}

// Central registry – every cookie the app uses is listed here.
const COOKIE_KEYS = {
  version: "sg_v",
  address: "sg_address",
  hideShowAllModal: "sg_hide_show_all",
  hideContentPrefix: "sg_hide_"
} as const

// ---------------------------------------------------------------------------
// Low-level helpers
// ---------------------------------------------------------------------------

function parseCookieString(raw: string): Record<string, string> {
  const result: Record<string, string> = {}
  if (!raw) return result

  for (const pair of raw.split(";")) {
    const idx = pair.indexOf("=")
    if (idx === -1) continue
    const key = pair.slice(0, idx).trim()
    const value = pair.slice(idx + 1).trim()
    if (key) result[key] = value
  }
  return result
}

function getAllCookies(): Record<string, string> {
  if (typeof document === "undefined") return {}
  return parseCookieString(document.cookie)
}

function getRawCookie(name: string): string | undefined {
  return getAllCookies()[name]
}

function setCookie(name: string, value: string, maxAge: number): void {
  if (typeof document === "undefined") return

  const parts = [`${name}=${value}`, "path=/", `max-age=${maxAge}`, "SameSite=Lax"]

  if (location.protocol === "https:") {
    parts.push("Secure")
  }

  document.cookie = parts.join("; ")
}

function deleteCookie(name: string): void {
  if (typeof document === "undefined") return
  document.cookie = `${name}=; path=/; max-age=0`
}

// ---------------------------------------------------------------------------
// JSON helpers (safe encode / decode)
// ---------------------------------------------------------------------------

function setJsonCookie<T>(name: string, value: T, maxAge: number): void {
  try {
    setCookie(name, encodeURIComponent(JSON.stringify(value)), maxAge)
  } catch {
    // Silently fail – don't break the app over a cookie.
  }
}

function getJsonCookie<T>(name: string): T | null {
  const raw = getRawCookie(name)
  if (!raw) return null
  try {
    return JSON.parse(decodeURIComponent(raw)) as T
  } catch {
    deleteCookie(name)
    return null
  }
}

// ---------------------------------------------------------------------------
// Version guard
// ---------------------------------------------------------------------------

function ensureVersion(): boolean {
  const stored = getRawCookie(COOKIE_KEYS.version)
  if (stored === COOKIE_VERSION) return true

  // Version mismatch – wipe managed cookies and reset the version stamp.
  deleteCookie(COOKIE_KEYS.address)
  deleteCookie(COOKIE_KEYS.hideShowAllModal)
  for (const key of Object.values(HideableContent)) {
    deleteCookie(`${COOKIE_KEYS.hideContentPrefix}${key}`)
  }
  setCookie(COOKIE_KEYS.version, COOKIE_VERSION, MAX_AGE.long)
  return false
}

// ---------------------------------------------------------------------------
// Public API – Address
// ---------------------------------------------------------------------------

export function getAddressCookie(): Address | null {
  ensureVersion()
  return getJsonCookie<Address>(COOKIE_KEYS.address)
}

export function setAddressCookie(address: Address): void {
  ensureVersion()
  setJsonCookie(COOKIE_KEYS.address, address, MAX_AGE.short)
}

export function deleteAddressCookie(): void {
  deleteCookie(COOKIE_KEYS.address)
}

// ---------------------------------------------------------------------------
// Public API – UI preference: hide "Show All" modal
// ---------------------------------------------------------------------------

export function getHideShowAllModalCookie(): boolean {
  ensureVersion()
  return getRawCookie(COOKIE_KEYS.hideShowAllModal) === "1"
}

export function setHideShowAllModalCookie(hide: boolean): void {
  ensureVersion()
  if (hide) {
    setCookie(COOKIE_KEYS.hideShowAllModal, "1", MAX_AGE.long)
  } else {
    deleteCookie(COOKIE_KEYS.hideShowAllModal)
  }
}

// ---------------------------------------------------------------------------
// Public API – UI preference: hide inline content cards
// ---------------------------------------------------------------------------

export function getHideContentCookie(content: HideableContent): boolean {
  ensureVersion()
  return getRawCookie(`${COOKIE_KEYS.hideContentPrefix}${content}`) === "1"
}

export function setHideContentCookie(content: HideableContent, hide: boolean): void {
  ensureVersion()
  const key = `${COOKIE_KEYS.hideContentPrefix}${content}`
  if (hide) {
    setCookie(key, "1", MAX_AGE.long)
  } else {
    deleteCookie(key)
  }
}
