import { FC, memo } from 'react';
import { toast } from 'react-toastify';
import { useFocusTrap } from '../hooks/useFocusTrap';

/**
 * InnBucks Payment Modal
 * Displays QR code and polling status for InnBucks mobile money payments
 * Based on Angular cart.component.ts Step 4 (Order Processing)
 */
interface InnBucksPaymentModalProps {
  isOpen: boolean;
  code: string;
  qrCode: string;
  isPolling: boolean;
  pollingAttempt: number;
  timeRemaining: number;
  pollingError?: string | null;
  onCancel: () => void;
  onSuccess?: (data?: any) => void;
  onRetry?: () => void;
}

const InnBucksPaymentModal: FC<InnBucksPaymentModalProps> = ({
  isOpen,
  code,
  qrCode,
  isPolling,
  pollingAttempt,
  timeRemaining,
  pollingError,
  onCancel,
  onRetry
}) => {
  const containerRef = useFocusTrap(isOpen);
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel} onKeyDown={(e) => { if (e.key === 'Escape' && !isPolling) onCancel(); }}>
      <div className="modal-content innbucks-modal" ref={containerRef} role="dialog" aria-modal="true" aria-labelledby="innbucks-title" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h2 id="innbucks-title">InnBucks Payment</h2>
          <button
            className="modal-close-btn"
            onClick={onCancel}
            disabled={isPolling}
            title={isPolling ? 'Cannot close while polling' : 'Close'}
            aria-label="Close payment dialog"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="modal-body">
          {pollingError ? (
            /* Error State */
            <div className="innbucks-error">
              <div className="error-icon">❌</div>
              <h3>Payment Timeout</h3>
              <p>{pollingError}</p>
              <p className="error-details">
                Please check if the payment was processed on your phone.
              </p>
              {onRetry && (
                <button className="innbucks-btn-primary" onClick={onRetry}>
                  Retry Payment
                </button>
              )}
              <button className={onRetry ? "innbucks-btn-secondary" : "innbucks-btn-primary"} onClick={onCancel}>
                {onRetry ? 'Change Payment Method' : 'Go Back to Checkout'}
              </button>
              <a href="/contact-us" style={{display:'block', marginTop:'12px', fontSize:'13px', color:'#42af57', textDecoration:'none', fontWeight:600}}>
                Contact Support
              </a>
            </div>
          ) : isPolling ? (
            /* Polling State - Waiting for Payment */
            <div className="innbucks-polling">
              <div className="polling-spinner">
                <div className="spinner"></div>
              </div>

              {qrCode && (
                <div className="qr-section">
                  <h3>Scan QR Code</h3>
                  <div className="qr-code-container">
                    <img
                      src={`data:image/png;base64,${qrCode}`}
                      alt="InnBucks QR Code"
                      className="qr-code-image"
                    />
                  </div>
                </div>
              )}

              <div className="code-section">
                <h3>Or Dial Code</h3>
                <div className="code-display">
                  <p className="code-instructions">Dial on your phone:</p>
                  <div className="code-box">
                    <code className="code-value">*569#{code}#</code>
                  </div>
                  <button
                    className="copy-btn"
                    onClick={() => {
                      navigator.clipboard.writeText(`*569#${code}#`);
                      toast.info('Code copied to clipboard');
                    }}
                  >
                    Copy Code
                  </button>
                </div>
              </div>

              <div className="polling-status">
                <p className="status-text">
                  Waiting for payment confirmation...
                </p>
                <p className="status-attempt">
                  Attempt {pollingAttempt} of 10
                </p>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${(pollingAttempt / 10) * 100}%` }}
                  ></div>
                </div>
                <p className="time-remaining">
                  Time remaining: <strong>{timeRemaining}</strong>
                </p>
              </div>

              <p className="polling-note">
                ℹ️ Keep this window open while you complete the payment on your phone.
              </p>

              <button
                className="innbucks-btn-secondary"
                onClick={onCancel}
              >
                Cancel Payment
              </button>
            </div>
          ) : (
            /* Initial State - Show Code Before Polling */
            <div className="innbucks-initial">
              <div className="initial-icon">📱</div>
              <h3>Complete Payment</h3>

              {qrCode && (
                <div className="qr-section">
                  <p>Scan this QR code with your phone:</p>
                  <div className="qr-code-container">
                    <img
                      src={`data:image/png;base64,${qrCode}`}
                      alt="InnBucks QR Code"
                      className="qr-code-image"
                    />
                  </div>
                </div>
              )}

              <div className="code-section">
                <p>Or dial on your phone:</p>
                <div className="code-box">
                  <code className="code-value">*569#{code}#</code>
                </div>
                <button
                  className="copy-btn"
                  onClick={() => {
                    navigator.clipboard.writeText(`*569#${code}#`);
                    toast.info('Code copied to clipboard');
                  }}
                >
                  Copy Code
                </button>
              </div>

              <p className="code-instructions">
                Enter the amount matching your order total when prompted.
              </p>

              <button
                className="innbucks-btn-primary"
                onClick={() => {
                  // Manual confirmation for testing or if user prefers
                  toast.info('Checking payment status...');
                }}
                disabled={isPolling}
              >
                I've Completed Payment
              </button>

              <button
                className="innbucks-btn-secondary"
                onClick={onCancel}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: var(--z-modal-backdrop, 900);
          padding: 20px;
        }

        .modal-content {
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
          max-width: 500px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          animation: slideUp 0.3s ease-out;
        }

        @keyframes slideUp {
          from {
            transform: translateY(30px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 24px 24px 16px;
          border-bottom: 1px solid #e0e0e0;
        }

        .modal-header h2 {
          margin: 0;
          font-size: 20px;
          font-weight: 600;
          color: #1a1a1a;
        }

        .modal-close-btn {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          padding: 0;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          transition: background-color 0.2s;
        }

        .modal-close-btn:hover:not(:disabled) {
          background-color: #f0f0f0;
        }

        .modal-close-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .modal-body {
          padding: 24px;
        }

        /* Error State */
        .innbucks-error {
          text-align: center;
        }

        .error-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }

        .innbucks-error h3 {
          font-size: 18px;
          font-weight: 600;
          color: #d32f2f;
          margin: 12px 0;
        }

        .innbucks-error p {
          color: #595959;
          margin: 8px 0;
          line-height: 1.5;
        }

        .error-details {
          font-size: 14px;
          color: #636363;
          margin-top: 16px;
          margin-bottom: 24px;
        }

        /* Initial State */
        .innbucks-initial {
          text-align: center;
        }

        .initial-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }

        .innbucks-initial h3 {
          font-size: 18px;
          font-weight: 600;
          color: #1a1a1a;
          margin: 12px 0 24px;
        }

        /* Polling State */
        .innbucks-polling {
          text-align: center;
        }

        .polling-spinner {
          display: flex;
          justify-content: center;
          margin-bottom: 24px;
        }

        .spinner {
          border: 3px solid #f3f3f3;
          border-top: 3px solid #2e7d32;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        /* QR Code Section */
        .qr-section {
          margin-bottom: 24px;
        }

        .qr-section h3 {
          font-size: 14px;
          font-weight: 600;
          text-transform: uppercase;
          color: #595959;
          margin-bottom: 12px;
        }

        .qr-code-container {
          background: #f9f9f9;
          padding: 16px;
          border-radius: 8px;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 200px;
        }

        .qr-code-image {
          max-width: 100%;
          height: auto;
          max-height: 180px;
        }

        /* Code Section */
        .code-section {
          margin-bottom: 24px;
        }

        .code-section h3 {
          font-size: 14px;
          font-weight: 600;
          text-transform: uppercase;
          color: #595959;
          margin-bottom: 12px;
        }

        .code-instructions {
          font-size: 13px;
          color: #595959;
          margin-bottom: 12px;
        }

        .code-box {
          background: #f0f5f0;
          border: 2px solid #2e7d32;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 12px;
        }

        .code-value {
          font-size: 20px;
          font-weight: 700;
          color: #2e7d32;
          font-family: 'Courier New', monospace;
          letter-spacing: 1px;
        }

        .copy-btn {
          background-color: #e8f5e9;
          border: 1px solid #2e7d32;
          color: #2e7d32;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
          transition: all 0.2s;
        }

        .copy-btn:hover {
          background-color: #2e7d32;
          color: white;
        }

        /* Polling Status */
        .polling-status {
          background: #f9f9f9;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 24px;
        }

        .status-text {
          font-size: 14px;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0 0 8px 0;
        }

        .status-attempt {
          font-size: 12px;
          color: #595959;
          margin: 0 0 8px 0;
        }

        .progress-bar {
          background: #e0e0e0;
          height: 6px;
          border-radius: 3px;
          overflow: hidden;
          margin-bottom: 8px;
        }

        .progress-fill {
          background: linear-gradient(90deg, #2e7d32, #66bb6a);
          height: 100%;
          transition: width 0.3s ease;
        }

        .time-remaining {
          font-size: 12px;
          color: #636363;
          margin: 0;
        }

        .time-remaining strong {
          font-size: 14px;
          color: #2e7d32;
          font-weight: 700;
        }

        /* Polling Note */
        .polling-note {
          background: #e8f5e9;
          border-left: 4px solid #2e7d32;
          padding: 12px;
          border-radius: 4px;
          font-size: 13px;
          color: #2e7d32;
          margin-bottom: 16px;
          text-align: left;
        }

        /* Buttons */
        .innbucks-btn-primary {
          background-color: #2e7d32;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          width: 100%;
          transition: background-color 0.2s;
          margin-bottom: 12px;
        }

        .innbucks-btn-primary:hover:not(:disabled) {
          background-color: #1b5e20;
        }

        .innbucks-btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .innbucks-btn-secondary {
          background-color: transparent;
          color: #595959;
          border: 1px solid #ddd;
          padding: 12px 24px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          width: 100%;
          transition: all 0.2s;
        }

        .innbucks-btn-secondary:hover:not(:disabled) {
          border-color: #636363;
          color: #333;
        }

        .innbucks-btn-secondary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Responsive */
        @media (max-width: 640px) {
          .modal-content {
            max-width: calc(100% - 40px);
          }

          .code-value {
            font-size: 16px;
          }

          .qr-code-container {
            min-height: 160px;
          }
        }
      `}</style>
    </div>
  );
};

export default memo(InnBucksPaymentModal);
