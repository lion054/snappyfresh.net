import { FC } from 'react';

/**
 * PayNow Payment Modal
 * Displays payment instructions for PayNow payments
 */
interface PayNowModalProps {
  isOpen: boolean;
  amount: number;
  invoiceId: any;
  onClose: () => void;
  onSuccess?: (data?: any) => void;
  onError?: (error: any) => void;
}

const PayNowModal: FC<PayNowModalProps> = ({
  isOpen,
  amount,
  invoiceId,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <>
      <style>{`
        @keyframes payNowSlideUp {
          from {
            transform: translateY(24px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .modal-dialog {
          animation: payNowSlideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
      <div className="modal show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered modal-sm">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">PayNow Payment</h5>
            <button type="button" className="btn-close" onClick={onClose} aria-label="Close payment dialog"></button>
          </div>
          <div className="modal-body">
            <p>Invoice ID: {invoiceId}</p>
            <p>Amount: ${amount}</p>
            <p>Please complete your PayNow payment.</p>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default PayNowModal;
