export function getPublicBaseUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL
  if (explicit) return explicit
  const vercel = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined
  return vercel ?? 'https://remotebalkan.example'
}

export function buildOgImageUrl(title: string, subtitle?: string): string {
  const base = getPublicBaseUrl()
  const params = new URLSearchParams({ title })
  if (subtitle) params.set('subtitle', subtitle)
  return `${base}/api/og?${params.toString()}`
}
