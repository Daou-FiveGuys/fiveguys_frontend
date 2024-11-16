export function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`))
  return match ? decodeURIComponent(match[2]) : null
}

export function deleteCookie(name: string): void {
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;`
}

interface CookieOptions {
  secure?: boolean
  maxAge?: number
  path?: string
}

export function setCookie(
  name: string,
  value: string,
  options: CookieOptions = {}
) {
  const { secure, maxAge, path } = options

  let cookieString = `${name}=${encodeURIComponent(value)};`

  if (maxAge) {
    cookieString += `Max-Age=${maxAge};`
  }

  if (path) {
    cookieString += `Path=${path};`
  }

  if (secure) {
    cookieString += `Secure;`
  }

  document.cookie = cookieString
}
