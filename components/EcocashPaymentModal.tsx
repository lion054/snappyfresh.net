import { useState, useEffect, FC, memo } from 'react';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { maskPhoneNumber } from '../lib/validation';

/**
 * Ecocash Payment Modal
 * Displays payment instructions and status for Ecocash mobile money payments
 */
interface EcocashPaymentModalProps {
  isOpen: boolean;
  phoneNumber: string;
  amount: number;
  onCancel: () => void;
  onSuccess?: (data?: any) => void;
  onRetry?: () => void;
  isProcessing?: boolean;
}

const EcocashPaymentModal: FC<EcocashPaymentModalProps> = ({
  isOpen,
  phoneNumber,
  amount,
  onCancel,
  onSuccess,
  onRetry,
  isProcessing = false
}) => {
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes

  useEffect(() => {
    if (!isOpen || !isProcessing) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, isProcessing]);

  const containerRef = useFocusTrap(isOpen);
  if (!isOpen) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="modal-overlay" onClick={onCancel} onKeyDown={(e) => { if (e.key === 'Escape' && !isProcessing) onCancel(); }}>
      <div className="modal-content ecocash-modal" ref={containerRef} role="dialog" aria-modal="true" aria-labelledby="ecocash-title" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h2 id="ecocash-title">Ecocash Payment</h2>
          <button
            className="modal-close-btn"
            onClick={onCancel}
            disabled={isProcessing}
            title={isProcessing ? 'Processing payment...' : 'Close'}
            aria-label="Close payment dialog"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="modal-body">
          {isProcessing && timeRemaining <= 0 ? (
            /* Timeout State */
            <div className="ecocash-timeout">
              <div className="timeout-icon">&#9201;</div>
              <h3>Payment Timed Out</h3>
              <p>We didn't receive confirmation within the allotted time.</p>
              <p className="timeout-suggestion">
                Check your phone for an Ecocash prompt. If you already approved,
                your order may still process &mdash; check your order status.
              </p>
              <div className="timeout-actions">
                {onRetry && (
                  <button className="ecocash-btn-primary" onClick={onRetry}>
                    Retry Payment
                  </button>
                )}
                <button className="ecocash-btn-secondary" onClick={onCancel}>
                  Change Payment Method
                </button>
                <a href="/contact-us" className="timeout-support-link">
                  Contact Support
                </a>
              </div>
            </div>
          ) : isProcessing ? (
            /* Processing State */
            <div className="ecocash-processing">
              <div className="processing-spinner">
                <div className="spinner"></div>
              </div>

              <div className="payment-instructions">
                <h3>Complete Payment on Your Phone</h3>
                <p className="instruction-text">
                  A payment prompt will appear on your phone registered with number:
                </p>

                <div className="phone-display">
                  <p className="phone-number">{maskPhoneNumber(phoneNumber)}</p>
                </div>

                <div className="amount-display">
                  <p className="label">Amount to Pay:</p>
                  <p className="amount">${amount?.toFixed(2) || '0.00'}</p>
                </div>

                <div className="instruction-steps">
                  <h4>What to do:</h4>
                  <ol>
                    <li>Look for the Ecocash payment prompt on your phone</li>
                    <li>Follow the on-screen instructions to confirm payment</li>
                    <li>Enter your Ecocash PIN when prompted</li>
                    <li>Wait for payment confirmation</li>
                  </ol>
                </div>

                <div className="timer-section">
                  <p className="timer-label">Time remaining:</p>
                  <div className="timer-display">
                    {formatTime(timeRemaining)}
                  </div>
                </div>

                {/* USSD Quick Reference */}
                <div className="ussd-quick-ref">
                  <p className="ussd-hint">Dial <strong>*151#</strong> if you don't see a prompt</p>
                </div>

                <p className="notice">
                  Do not close this window while payment is processing
                </p>

                <button
                  className="ecocash-btn-secondary"
                  onClick={onCancel}
                  disabled={isProcessing}
                >
                  Cancel Payment
                </button>
              </div>
            </div>
          ) : (
            /* Initial State */
            <div className="ecocash-initial">
              <div className="ecocash-icon">💬</div>
              <h3>Ready for Ecocash Payment</h3>
              <p>You will receive a payment prompt on:</p>
              <div className="phone-display">
                <p className="phone-number">{maskPhoneNumber(phoneNumber)}</p>
              </div>
              <p className="amount-label">Amount:</p>
              <p className="amount">${amount?.toFixed(2) || '0.00'}</p>

              {/* USSD Instructions - Zimbabwe specific */}
              <div className="ussd-instructions">
                <h4>📱 USSD Dialing Instructions</h4>
                <p className="ussd-code">Dial: <strong>*151#</strong></p>
                <p className="ussd-steps">Then select: Pay Bills / Merchants</p>
              </div>

              <p className="confirmation-text">
                Click "Confirm Payment" to proceed. You will have 5 minutes to complete the payment on your phone.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        {!isProcessing && (
          <div className="modal-footer">
            <button className="ecocash-btn-secondary" onClick={onCancel}>
              Cancel
            </button>
            <button
              className="ecocash-btn-primary"
              onClick={onSuccess}
            >
              Confirm Payment
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: var(--z-modal-backdrop, 900);
        }

        .modal-content {
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
          max-width: 500px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          animation: slideUp 0.3s ease-out;
        }

        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px;
          border-bottom: 1px solid #eee;
        }

        .modal-header h2 {
          margin: 0;
          font-size: 20px;
          font-weight: 700;
          color: #253d4e;
        }

        .modal-close-btn {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #636363;
          padding: 0;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: all 0.2s;
        }

        .modal-close-btn:hover:not(:disabled) {
          background: #f5f5f5;
          color: #333;
        }

        .modal-close-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .modal-body {
          padding: 32px 24px;
          min-height: 300px;
        }

        .ecocash-processing,
        .ecocash-initial,
        .ecocash-timeout {
          text-align: center;
        }

        .timeout-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }

        .ecocash-timeout h3 {
          font-size: 18px;
          font-weight: 700;
          color: #d32f2f;
          margin: 0 0 12px 0;
        }

        .ecocash-timeout p {
          font-size: 14px;
          color: #595959;
          margin: 8px 0;
          line-height: 1.5;
        }

        .timeout-suggestion {
          background: #fff8e1;
          border-left: 4px solid #ffc107;
          padding: 12px;
          border-radius: 4px;
          text-align: left;
          margin: 16px 0 24px;
          font-size: 13px;
          color: #795548;
        }

        .timeout-actions {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .timeout-support-link {
          font-size: 13px;
          color: #42af57;
          text-decoration: none;
          font-weight: 600;
        }

        .timeout-support-link:hover {
          text-decoration: underline;
        }

        .processing-spinner {
          margin-bottom: 32px;
        }

        .spinner {
          width: 50px;
          height: 50px;
          border: 4px solid #f0f0f0;
          border-top: 4px solid #42af57;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .ecocash-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }

        .payment-instructions h3,
        .ecocash-initial h3 {
          font-size: 18px;
          font-weight: 700;
          color: #253d4e;
          margin: 0 0 16px 0;
        }

        .payment-instructions p,
        .ecocash-initial p {
          font-size: 14px;
          color: #595959;
          margin: 12px 0;
        }

        .phone-display {
          background: #f5f5f5;
          padding: 16px;
          border-radius: 8px;
          margin: 16px 0;
        }

        .phone-number {
          font-size: 16px;
          font-weight: 600;
          color: #42af57;
          margin: 0;
        }

        .amount-display {
          background: #f0f8f5;
          padding: 16px;
          border-radius: 8px;
          margin: 20px 0;
          border: 2px solid #42af57;
        }

        .amount-display .label,
        .amount-label {
          font-size: 12px;
          color: #636363;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin: 0;
        }

        .amount-display .amount,
        .amount {
          font-size: 28px;
          font-weight: 700;
          color: #42af57;
          margin: 8px 0 0 0;
        }

        .instruction-steps {
          text-align: left;
          background: #fafafa;
          padding: 16px;
          border-radius: 8px;
          margin: 20px 0;
        }

        .instruction-steps h4 {
          font-size: 14px;
          font-weight: 600;
          color: #253d4e;
          margin: 0 0 12px 0;
        }

        .instruction-steps ol {
          margin: 0;
          padding-left: 20px;
        }

        .instruction-steps li {
          font-size: 13px;
          color: #595959;
          margin: 8px 0;
          line-height: 1.5;
        }

        .timer-section {
          margin: 24px 0;
        }

        .timer-label {
          font-size: 12px;
          color: #636363;
          margin: 0 0 8px 0;
        }

        .timer-display {
          font-size: 32px;
          font-weight: 700;
          color: #42af57;
          font-family: monospace;
          letter-spacing: 2px;
        }

        .notice {
          font-size: 12px;
          color: #ff6b6b;
          background: #ffe0e0;
          padding: 12px;
          border-radius: 6px;
          margin: 16px 0;
        }

        .confirmation-text {
          background: #f0f8f5;
          padding: 12px;
          border-radius: 6px;
          font-size: 13px;
          color: #42af57;
          margin: 16px 0;
        }

        .ussd-instructions {
          background: #fff3e0;
          border-left: 4px solid #ff9800;
          padding: 16px;
          border-radius: 8px;
          margin: 20px 0;
          text-align: left;
        }

        .ussd-instructions h4 {
          font-size: 14px;
          font-weight: 700;
          color: #e65100;
          margin: 0 0 12px 0;
        }

        .ussd-code {
          font-size: 16px;
          font-weight: 600;
          color: #ff6f00;
          margin: 8px 0;
          font-family: 'Courier New', monospace;
          letter-spacing: 1px;
        }

        .ussd-code strong {
          font-size: 18px;
          color: #d84315;
        }

        .ussd-steps {
          font-size: 12px;
          color: #595959;
          margin: 4px 0 0 0;
        }

        .whatsapp-support {
          background: #e8f5e9;
          border: 1px solid #81c784;
          padding: 12px;
          border-radius: 8px;
          margin: 16px 0;
          text-align: center;
        }

        .whatsapp-support p {
          font-size: 12px;
          color: #595959;
          margin: 0 0 8px 0;
        }

        .whatsapp-link {
          display: inline-block;
          background: #25d366;
          color: white;
          padding: 10px 16px;
          border-radius: 6px;
          text-decoration: none;
          font-size: 13px;
          font-weight: 600;
          transition: all 0.3s;
        }

        .whatsapp-link:hover {
          background: #1fa952;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(37, 211, 102, 0.3);
        }

        .ussd-quick-ref {
          background: #fff9c4;
          border: 1px solid #fbc02d;
          padding: 10px;
          border-radius: 6px;
          margin: 12px 0;
        }

        .ussd-hint {
          font-size: 12px;
          color: #f57f17;
          margin: 0;
          font-weight: 500;
        }

        .modal-footer {
          display: flex;
          gap: 12px;
          padding: 24px;
          border-top: 1px solid #eee;
          justify-content: flex-end;
        }

        .ecocash-btn-primary,
        .ecocash-btn-secondary {
          padding: 12px 24px;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .ecocash-btn-primary {
          background: #42af57;
          color: white;
        }

        .ecocash-btn-primary:hover:not(:disabled) {
          background: #2a9d65;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(66, 175, 87, 0.3);
        }

        .ecocash-btn-secondary {
          background: #f5f5f5;
          color: #333;
        }

        .ecocash-btn-secondary:hover:not(:disabled) {
          background: #eee;
        }

        .ecocash-btn-primary:disabled,
        .ecocash-btn-secondary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default memo(EcocashPaymentModal);
