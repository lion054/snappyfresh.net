/**
 * App Error Boundary
 * Catches runtime errors and shows fallback UI
 */

import { Component, ReactNode } from 'react';
import { logger } from '../lib/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class AppErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    logger.error('Error Boundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="sf-error-page">
          <div className="sf-alert sf-alert--warning" style={{ maxWidth: '500px', margin: '0 auto' }}>
            <i className="fi-rs-exclamation" style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}></i>
            <h3 style={{ marginBottom: '12px' }}>Something Went Wrong</h3>
            <p style={{ marginBottom: '20px' }}>
              We encountered an unexpected error. This could be due to a network issue or temporary server problem.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="sf-btn sf-btn--green sf-btn--lg"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AppErrorBoundary;
