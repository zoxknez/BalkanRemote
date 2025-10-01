export const dynamic = 'force-static'
export const revalidate = 0

export default function ScrapedStatsRedirect() {
  if (typeof window !== 'undefined') {
    window.location.replace('/oglasi')
  }
  return null
}
