import React, { ReactNode } from 'react';
import { logger } from '../lib/logger';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Lightweight error boundary for lazy-loaded payment modals.
 * Shows a retry prompt instead of a full-page error when a payment
 * modal chunk fails to load (e.g. network interruption).
 */
class PaymentModalErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error('[PaymentModal] Failed to load payment modal:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '20px',
          textAlign: 'center',
          background: '#fff8f8',
          border: '1px solid #ffd0d0',
          borderRadius: 10,
          margin: '12px 0',
        }}>
          <p style={{ color: '#c0392b', marginBottom: 12, fontWeight: 600 }}>
            Failed to load payment module.
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            style={{
              padding: '8px 20px',
              background: '#1a5c38',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default PaymentModalErrorBoundary;
