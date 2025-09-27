'use client'

import { useEffect, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

export function useCurrentUrl(): string {
  const pathname = usePathname()
  const params = useSearchParams()
  const [href, setHref] = useState('')

  useEffect(() => {
    const search = params.toString()
    const val = typeof window !== 'undefined'
      ? `${window.location.origin}${pathname}${search ? `?${search}` : ''}`
      : ''
    setHref(val)
  }, [pathname, params])

  return href
}
