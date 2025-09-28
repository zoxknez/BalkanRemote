import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("sr-RS", {
    day: "numeric",
    month: "long", 
    year: "numeric"
  })
}

export function formatSalary(min?: number, max?: number, currency = "USD") {
  if (!min && !max) return "Nije specificirano"
  if (min && max) return `${min.toLocaleString()} - ${max.toLocaleString()} ${currency}`
  if (min) return `Od ${min.toLocaleString()} ${currency}`
  if (max) return `Do ${max.toLocaleString()} ${currency}`
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-')
}

// Build absolute URL for scraping endpoints; supports absolute ep and {query}
export function buildUrl(baseUrl: string, endpoint: string, query?: string): string {
  const ep = endpoint.replace('{query}', encodeURIComponent(query ?? ''))
  if (/^https?:\/\//i.test(ep)) return ep
  try {
    return new URL(ep, baseUrl).toString()
  } catch {
    // Fallback string concat if URL fails
    const sep = baseUrl.endsWith('/') || ep.startsWith('/') ? '' : '/'
    return `${baseUrl}${sep}${ep}`
  }
}

// Copy utility with robust fallback (textarea + execCommand)
export async function copyToClipboard(value: string): Promise<void> {
  // Prefer the modern Clipboard API
  if (typeof navigator !== 'undefined' && navigator?.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value)
      return
    } catch {
      // Fall through to the legacy fallback below
    }
  }

  // Fallback: textarea + execCommand('copy')
  if (typeof document === 'undefined') {
    throw new Error('Clipboard API not available in this environment')
  }

  const ta = document.createElement('textarea')
  ta.value = value
  ta.setAttribute('readonly', '')
  ta.style.position = 'absolute'
  ta.style.left = '-9999px'
  document.body.appendChild(ta)
  ta.select()
  const ok = typeof document.execCommand === 'function' ? document.execCommand('copy') : false
  document.body.removeChild(ta)
  if (!ok) {
    throw new Error('Copy command is not supported or failed')
  }
}
