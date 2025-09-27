'use client'

import { useCallback, useEffect, useState } from 'react'
import { logger } from '@/lib/logger'

type ClipboardButtonProps = {
  value: string
  copyText?: string
  copiedText?: string
  errorText?: string
  className?: string
  pulseOnCopy?: boolean
}

export function ClipboardButton({
  value,
  copyText = 'Kopiraj',
  copiedText = 'Kopirano!',
  errorText = 'Greška pri kopiranju',
  className = '',
  pulseOnCopy = true,
}: ClipboardButtonProps) {
  const [status, setStatus] = useState<'idle' | 'copied' | 'error'>('idle')

  useEffect(() => {
    if (status === 'idle') return

    const timeout = window.setTimeout(() => {
      setStatus('idle')
    }, 2000)

    return () => {
      window.clearTimeout(timeout)
    }
  }, [status])

  const handleCopy = useCallback(async () => {
    try {
      if (!navigator?.clipboard?.writeText) {
        throw new Error('Clipboard API nedostupna')
      }

      await navigator.clipboard.writeText(value)
      setStatus('copied')
    } catch (error) {
      logger.error('Copy failed', error)
      setStatus('error')
    }
  }, [value])

  const isCopied = status === 'copied'
  const isError = status === 'error'

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`inline-flex items-center gap-2 rounded-lg border border-indigo-200 px-3 py-1.5 text-sm font-medium text-indigo-600 transition focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 hover:bg-indigo-50 ${
        pulseOnCopy && isCopied ? 'animate-pulse' : ''
      } ${
        isError ? 'border-red-200 text-red-600 hover:bg-red-50 focus:ring-red-500' : ''
      } ${className}`.trim()}
      aria-live="polite"
    >
      <span aria-hidden="true" className="text-base leading-none">
        {isCopied ? '✓' : isError ? '⚠' : '⧉'}
      </span>
      <span>{isCopied ? copiedText : isError ? errorText : copyText}</span>
      <span className="sr-only">
        {isCopied
          ? `${copiedText}: ${value}`
          : isError
            ? `${errorText}: ${value}`
            : `${copyText}: ${value}`}
      </span>
    </button>
  )
}
