const shouldLog = process.env.NODE_ENV !== 'production'

type ConsoleFn = (...args: unknown[]) => void

const safeCall = (fn: ConsoleFn | undefined, args: unknown[]) => {
  if (typeof fn === 'function') {
    fn(...args)
  }
}

export const logger = {
  info: (...args: unknown[]) => {
    if (!shouldLog) return
    safeCall(console.info, args)
  },
  log: (...args: unknown[]) => {
    if (!shouldLog) return
    safeCall(console.log, args)
  },
  warn: (...args: unknown[]) => {
    if (!shouldLog) return
    safeCall(console.warn, args)
  },
  error: (...args: unknown[]) => {
    safeCall(console.error, args)
  },
  debug: (...args: unknown[]) => {
    if (!shouldLog) return
    safeCall(console.debug, args)
  },
}

export type Logger = typeof logger
