'use client'

import { useCallback, useEffect, useState } from 'react'

type ClipboardButtonProps = {
  value: string
  copyText?: string
  copiedText?: string
  className?: string
  pulseOnCopy?: boolean
}

export function ClipboardButton({
  value,
  copyText = 'Kopiraj',
  copiedText = 'Kopirano!',
  className = '',
  pulseOnCopy = true,
}: ClipboardButtonProps) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return

    const timeout = window.setTimeout(() => {
      setCopied(false)
    }, 2000)

    return () => {
      window.clearTimeout(timeout)
    }
  }, [copied])

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
    } catch (error) {
      console.error('Copy failed', error)
    }
  }, [value])

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`inline-flex items-center gap-2 rounded-lg border border-indigo-200 px-3 py-1.5 text-sm font-medium text-indigo-600 transition focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 hover:bg-indigo-50 ${
        pulseOnCopy && copied ? 'animate-pulse' : ''
      } ${className}`.trim()}
      aria-live="polite"
    >
      <span aria-hidden="true" className="text-base leading-none">
        {copied ? '✓' : '⧉'}
      </span>
      <span>{copied ? copiedText : copyText}</span>
      <span className="sr-only">{copied ? `${copiedText}: ${value}` : `${copyText}: ${value}`}</span>
    </button>
  )
}
