"use client"

import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { logger } from '@/lib/logger'
import { copyToClipboard, cn } from '@/lib/utils'

export type ClipboardStatus = 'idle' | 'copied' | 'error'

// Small pure helper for unit tests and external reuse
export function isClipboardDisabled(value: string, disabled?: boolean): boolean {
  return !!disabled || !value
}

/**
 * Accessible copy-to-clipboard button.
 *
 * Features:
 * - Uses Clipboard API with a robust fallback provided by copyToClipboard utility
 * - Announces status to screen readers only on changes (copied/error)
 * - Prevents copy when value is empty (disabled state)
 * - Optional custom animated label via renderLabel and optional icon hiding
 */
export type ClipboardButtonProps = {
  value: string
  copyText?: string
  copiedText?: string
  errorText?: string
  className?: string
  pulseOnCopy?: boolean
  title?: string
  ariaLabel?: string
  onCopy?: (value: string) => void
  onError?: (error: unknown) => void
  disabled?: boolean
  announceValue?: boolean
  showIcon?: boolean
  renderLabel?: (status: ClipboardStatus) => ReactNode
}

export function ClipboardButton({
  value,
  copyText = 'Kopiraj',
  copiedText = 'Kopirano!',
  errorText = 'Greška pri kopiranju',
  className = '',
  pulseOnCopy = true,
  title,
  ariaLabel,
  onCopy,
  onError,
  disabled = false,
  announceValue = true,
  showIcon = true,
  renderLabel,
}: ClipboardButtonProps) {
  const [status, setStatus] = useState<ClipboardStatus>('idle')
  const onCopyRef = useRef(onCopy)
  const onErrorRef = useRef(onError)
  const effectiveDisabled = isClipboardDisabled(value, disabled)

  useEffect(() => { onCopyRef.current = onCopy }, [onCopy])
  useEffect(() => { onErrorRef.current = onError }, [onError])

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
      if (effectiveDisabled) return
      await copyToClipboard(value)
      setStatus('copied')
      try { onCopyRef.current?.(value) } catch {}
    } catch (error) {
      logger.error('Copy failed', error)
      setStatus('error')
      try { onErrorRef.current?.(error) } catch {}
    }
  }, [value, effectiveDisabled])

  const isCopied = status === 'copied'
  const isError = status === 'error'

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={title}
      aria-label={ariaLabel ?? title ?? copyText}
      disabled={effectiveDisabled}
      className={cn(
        'inline-flex items-center gap-2 rounded-lg border border-indigo-200 px-3 py-1.5 text-sm font-medium text-indigo-600 transition focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 hover:bg-indigo-50',
        pulseOnCopy && isCopied && 'motion-safe:animate-pulse',
        isError && 'border-red-200 text-red-600 hover:bg-red-50 focus:ring-red-500',
        effectiveDisabled && 'cursor-not-allowed opacity-60 hover:bg-transparent',
        className,
      )}
      aria-disabled={effectiveDisabled || undefined}
    >
      {showIcon && (
        <span aria-hidden="true" className="text-base leading-none">
          {isCopied ? '✓' : isError ? '⚠' : '⧉'}
        </span>
      )}
      {renderLabel ? (
        <>{renderLabel(status)}</>
      ) : (
        <span>{isCopied ? copiedText : isError ? errorText : copyText}</span>
      )}
      <span className="sr-only" aria-live="polite" aria-atomic="true">
        {status === 'copied'
          ? `${copiedText}${announceValue ? `: ${value}` : ''}`
          : status === 'error'
            ? `${errorText}${announceValue ? `: ${value}` : ''}`
            : ''}
      </span>
    </button>
  )
}
