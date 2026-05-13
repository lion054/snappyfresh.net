import React, { ReactNode } from 'react'
import { logger } from '../lib/logger'

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to error reporting service
    logger.error('Error caught by boundary:', error, errorInfo)

    // In production, send to monitoring service (Sentry, etc.)
    if (process.env.NODE_ENV === 'production') {
      // Send to Sentry or similar service
      if (typeof window !== 'undefined' && (window as any).__SENTRY__) {
        (window as any).__SENTRY__.captureException(error, { contexts: { react: errorInfo } })
      }
      // Also log to server for monitoring
      fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          timestamp: new Date().toISOString(),
          url: typeof window !== 'undefined' ? window.location.href : 'unknown',
        }),
      }).catch(err => console.error('Failed to report error:', err))
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-fallback">
          <div className="container pt-150 pb-150">
            <div className="row">
              <div className="col-xl-8 col-lg-10 col-md-12 m-auto">
                <div className="text-center">
                  <h2 className="mb-30">Oops! Something went wrong</h2>
                  <p className="mb-30">
                    We're sorry for the inconvenience. Please try refreshing the page.
                  </p>
                  <button
                    className="btn btn-heading btn-lg"
                    onClick={() => window.location.reload()}
                  >
                    Refresh Page
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
