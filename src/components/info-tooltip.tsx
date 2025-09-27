'use client'

import { CircleHelp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useId } from 'react'

type InfoTooltipProps = {
  text: string
  className?: string
  label?: string
  title?: string
  id?: string
  widthClass?: string
}

export function InfoTooltip({
  text,
  className,
  label = "Informacija",
  title,
  id,
  widthClass = 'w-64',
}: InfoTooltipProps) {
  const autoId = useId()
  const tooltipId = id || `info-tooltip-${autoId}`
  return (
    <span className={cn('relative inline-block group align-middle', className)}>
      <button
        type="button"
        aria-label={label}
        aria-describedby={tooltipId}
        className="inline-flex items-center justify-center rounded-full border border-transparent p-1 text-gray-400 transition hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        title={title || label}
      >
        <CircleHelp className="h-4 w-4" aria-hidden="true" />
      </button>
      <div
        id={tooltipId}
        role="tooltip"
        className={cn(
          'pointer-events-none absolute left-1/2 z-20 mt-2 -translate-x-1/2 rounded-lg border border-gray-200 bg-white p-2 text-xs text-gray-700 shadow-lg opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100',
          widthClass,
        )}
      >
        {text}
      </div>
    </span>
  )
}
