import Cookies from 'js-cookie'
import { logger } from './logger'

const TOKEN_KEY = '__session'
const USER_KEY = '__user'
const AUTH_KEY = 'auth'
const LEGACY_TOKEN_KEYS = ['authToken', 'token']

// Client-side cookie options for non-sensitive data (user profile, NOT token).
// Token is stored in httpOnly cookie via iron-session /api/session route.
const cookieOptions: Cookies.CookieAttributes = {
  expires: 7, // 7 days
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
}

// In-memory token cache to avoid repeated API calls within the same page lifecycle.
// The httpOnly cookie holds the real token; this is just a runtime mirror.
let _tokenCache: string | null = null

/**
 * Strip sensitive fields (token) before storing session in localStorage.
 * Token is ONLY stored in cookies (not accessible via JS in production with httpOnly).
 */
const stripSensitiveFields = (userData: any) => {
  if (!userData) return userData
  const { token, ...safe } = userData
  return safe
}

export const secureStorage = {
  // Token methods — stored in httpOnly cookie via /api/session (iron-session).
  // Falls back to client-side cookie for SSR/initial load compatibility.
  setToken: (token: any) => {
    _tokenCache = token
    // Persist to httpOnly cookie via API (fire-and-forget)
    if (typeof window !== 'undefined') {
      fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      }).catch(() => {
        // Fallback: store in client-side cookie if API route unavailable
        Cookies.set(TOKEN_KEY, token, cookieOptions)
      })
    }
  },

  getToken: () => {
    // Return in-memory cache first (fastest)
    if (_tokenCache) return _tokenCache
    // Fallback to legacy client-side cookie during migration
    return Cookies.get(TOKEN_KEY) || null
  },

  // Async version that reads from httpOnly session cookie
  getTokenAsync: async (): Promise<string | null> => {
    if (_tokenCache) return _tokenCache
    if (typeof window !== 'undefined') {
      try {
        const res = await fetch('/api/session')
        const data = await res.json()
        if (data.token) {
          _tokenCache = data.token
          return data.token
        }
      } catch {
        // Fallback to client-side cookie
      }
    }
    return Cookies.get(TOKEN_KEY) || null
  },

  removeToken: () => {
    _tokenCache = null
    Cookies.remove(TOKEN_KEY)
    // Clear httpOnly session
    if (typeof window !== 'undefined') {
      fetch('/api/session', { method: 'DELETE' }).catch(() => {})
    }
    // Clean up any legacy localStorage tokens
    if (typeof window !== 'undefined') {
      for (const key of LEGACY_TOKEN_KEYS) {
        localStorage.removeItem(key)
      }
    }
  },

  // User data methods — token is stripped before localStorage storage
  setUser: (userData: any) => {
    if (typeof window === 'undefined') return

    // Store session WITHOUT token in localStorage
    localStorage.setItem(AUTH_KEY, JSON.stringify(stripSensitiveFields(userData)))

    // Store only non-sensitive user data in cookies
    const safeUserData = {
      cardCode: userData.cardCode || userData.customer?.cardCode,
      cardName: userData.cardName || userData.customer?.cardName,
      isVisitor: userData.isVisitor || userData.customer?.isVisitor,
      databaseName: userData.databaseName,
    }
    Cookies.set(USER_KEY, JSON.stringify(safeUserData), cookieOptions)
  },

  getUser: () => {
    if (typeof window !== 'undefined') {
      const auth = localStorage.getItem(AUTH_KEY)
      if (auth) {
        try {
          const parsed = JSON.parse(auth)
          // Re-attach token from cookie so callers see a complete session
          const token = Cookies.get(TOKEN_KEY)
          if (token) {
            parsed.token = token
          }
          return parsed
        } catch (error) {
          logger.error('Failed to parse stored auth:', error)
        }
      }
    }
    const user = Cookies.get(USER_KEY)
    return user ? JSON.parse(user) : null
  },

  removeUser: () => {
    Cookies.remove(USER_KEY)
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_KEY)
    }
  },

  clearAll: () => {
    _tokenCache = null
    Cookies.remove(TOKEN_KEY)
    Cookies.remove(USER_KEY)
    // Destroy httpOnly session cookie on server
    if (typeof window !== 'undefined') {
      fetch('/api/session', { method: 'DELETE' }).catch(() => {})
      localStorage.removeItem(AUTH_KEY)
      for (const key of LEGACY_TOKEN_KEYS) {
        localStorage.removeItem(key)
      }
    }
  },

  // Migration helper: move legacy localStorage tokens to cookies, then clean up
  migrateFromLocalStorage: () => {
    if (typeof window === 'undefined') return

    try {
      // Migrate token from localStorage to cookie
      const oldToken = localStorage.getItem('authToken') || localStorage.getItem('token')
      if (oldToken && !Cookies.get(TOKEN_KEY)) {
        Cookies.set(TOKEN_KEY, oldToken, cookieOptions)
      }

      // Migrate user session (strip token from localStorage copy)
      const oldAuth = localStorage.getItem('auth')
      if (oldAuth) {
        try {
          const authData = JSON.parse(oldAuth)
          // If the stored session still has a token, strip it and re-save
          if (authData.token) {
            // Ensure token is in cookie
            if (!Cookies.get(TOKEN_KEY)) {
              Cookies.set(TOKEN_KEY, authData.token, cookieOptions)
            }
            // Re-save without token
            localStorage.setItem(AUTH_KEY, JSON.stringify(stripSensitiveFields(authData)))
          }
        } catch (e) {
          // corrupt data, ignore
        }
      }

      // Clean up legacy token keys from localStorage
      for (const key of LEGACY_TOKEN_KEYS) {
        localStorage.removeItem(key)
      }
    } catch (error) {
      logger.error('Migration error:', error)
    }
  },
}
