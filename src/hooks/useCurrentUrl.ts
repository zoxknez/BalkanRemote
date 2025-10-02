'use client'

import { useEffect, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

export function useCurrentUrl(): string {
  const pathname = usePathname()
  const params = useSearchParams()
  const [href, setHref] = useState('')

  useEffect(() => {
    const search = params?.toString() ?? ''
    const path = pathname || '/'
    const val = typeof window !== 'undefined'
      ? `${window.location.origin}${path}${search ? `?${search}` : ''}`
      : ''
    setHref(val)
  }, [pathname, params])

  return href
}
