export const dynamic = 'force-static'
export const revalidate = 0

export default function ScrapedRedirect() {
  if (typeof window !== 'undefined') {
    window.location.replace('/oglasi')
  }
  return null
}
