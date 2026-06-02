// Centralized logging utility
const isDevelopment = process.env.NODE_ENV === 'development'
const isTest = process.env.NODE_ENV === 'test'

export const logger = {
  debug: (...args: any[]) => {
    if (isDevelopment && !isTest) {
      console.log('[DEBUG]', ...args)
    }
  },

  info: (...args: any[]) => {
    if (isDevelopment && !isTest) {
      console.info('[INFO]', ...args)
    }
  },

  warn: (...args: any[]) => {
    if (isDevelopment && !isTest) {
      console.warn('[WARN]', ...args)
    }
    // In production: stealth mode - silent
  },

  error: (...args: any[]) => {
    if (isDevelopment && !isTest) {
      console.error('[ERROR]', ...args)
    }
    // In production: stealth mode - silent (could send to monitoring service like Sentry)
  },
}
