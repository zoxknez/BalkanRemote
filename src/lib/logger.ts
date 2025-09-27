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
  event: (name: string, payload?: Record<string, unknown>) => {
    // Always log events (observability) but allow toggle to plain vs JSON
    const format = process.env.LOG_FORMAT || 'text'
    if (format === 'json') {
      const record = { ts: new Date().toISOString(), evt: name, ...(payload || {}) }
      safeCall(console.log, [JSON.stringify(record)])
    } else {
      safeCall(console.log, [`[evt:${name}]`, payload || {}])
    }
  }
}

export type Logger = typeof logger
