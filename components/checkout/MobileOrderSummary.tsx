import { useState, FC } from 'react';

interface OrderItem {
  id: string | number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface MobileOrderSummaryProps {
  items: OrderItem[];
  subtotal: number;
  delivery: number;
  tax: number;
  total: number;
  onContinue: () => void;
  isLoading?: boolean;
}

const MobileOrderSummary: FC<MobileOrderSummaryProps> = ({
  items,
  subtotal,
  delivery,
  tax,
  total,
  onContinue,
  isLoading = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleBackdropClick = () => {
    setIsExpanded(false);
  };

  return (
    <>
      <style jsx>{`
        .mos-container {
          position: fixed;
          bottom: 60px;
          left: 0;
          right: 0;
          max-height: 75vh;
          background: #fff;
          border-radius: 20px 20px 0 0;
          box-shadow: ${isExpanded ? '0 -8px 32px rgba(0,0,0,0.15)' : '0 -2px 8px rgba(0,0,0,0.08)'};
          transform: translateY(${isExpanded ? '0' : 'calc(100% - 60px)'});
          transition: transform 300ms cubic-bezier(0.4,0,0.2,1);
          z-index: 400;
          display: flex;
          flex-direction: column;
        }

        /* Handle bar */
        .mos-handle {
          width: 36px;
          height: 4px;
          background: #d1d5db;
          border-radius: 2px;
          margin: 12px auto 0;
          flex-shrink: 0;
        }

        /* Collapsed bar */
        .mos-collapsed {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          height: 60px;
          cursor: pointer;
          flex-shrink: 0;
        }

        .mos-collapsed-content {
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1;
        }

        .mos-collapsed-text {
          font-size: 14px;
          font-weight: 600;
          color: #333;
        }

        .mos-collapsed-total {
          font-size: 16px;
          font-weight: 800;
          color: #3BB77E;
        }

        .mos-chevron {
          font-size: 20px;
          color: #636363;
          transition: transform 300ms;
          transform: ${isExpanded ? 'rotateX(180deg)' : 'rotateX(0)'};
        }

        /* Expanded content */
        .mos-expanded {
          flex: 1;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
          padding: 0;
          display: ${isExpanded ? 'flex' : 'none'};
          flex-direction: column;
        }

        /* Items list */
        .mos-items {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          border-bottom: 1px solid #e8e8e8;
        }

        .mos-item {
          display: flex;
          gap: 12px;
          margin-bottom: 12px;
          padding-bottom: 12px;
          border-bottom: 1px solid #f0f0f0;
        }

        .mos-item:last-child {
          border-bottom: none;
          margin-bottom: 0;
          padding-bottom: 0;
        }

        .mos-item-image {
          width: 56px;
          height: 56px;
          border-radius: 8px;
          background: #f5f5f5;
          overflow: hidden;
          flex-shrink: 0;
        }

        .mos-item-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .mos-item-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 4px;
        }

        .mos-item-name {
          font-size: 13px;
          font-weight: 600;
          color: #333;
          line-height: 1.3;
        }

        .mos-item-qty {
          font-size: 12px;
          color: #636363;
        }

        .mos-item-price {
          font-size: 14px;
          font-weight: 700;
          color: #3BB77E;
          text-align: right;
        }

        /* Breakdown */
        .mos-breakdown {
          padding: 16px;
          background: #f9f9f9;
          flex-shrink: 0;
        }

        .mos-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          font-size: 13px;
        }

        .mos-row-label {
          color: #595959;
          font-weight: 500;
        }

        .mos-row-value {
          color: #333;
          font-weight: 600;
        }

        .mos-row.mos-total {
          margin-top: 8px;
          padding-top: 8px;
          border-top: 1px solid #e0e0e0;
          font-size: 15px;
          font-weight: 800;
        }

        .mos-row.mos-total .mos-row-label {
          color: #1a1a2e;
          font-weight: 800;
        }

        .mos-row.mos-total .mos-row-value {
          color: #3BB77E;
          font-size: 18px;
        }

        /* CTA Button */
        .mos-cta {
          padding: 12px 16px;
          background: #fff;
          flex-shrink: 0;
        }

        .mos-cta-btn {
          width: 100%;
          background: #3BB77E;
          color: #fff;
          border: none;
          border-radius: 12px;
          padding: 14px;
          font-size: 15px;
          font-weight: 800;
          cursor: pointer;
          transition: background 0.2s;
          min-height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .mos-cta-btn:hover:not(:disabled) {
          background: #2a9d5f;
        }

        .mos-cta-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Backdrop overlay when expanded */
        .mos-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0);
          pointer-events: ${isExpanded ? 'auto' : 'none'};
          z-index: 390;
          opacity: ${isExpanded ? 0.4 : 0};
          transition: opacity 300ms;
        }
      `}</style>

      {/* Backdrop */}
      {isExpanded && <div className="mos-backdrop" onClick={handleBackdropClick} />}

      {/* Order Summary Sheet */}
      <div className="mos-container">
        {/* Handle bar (visible when expanded) */}
        {isExpanded && <div className="mos-handle" />}

        {/* Collapsed bar (always visible) */}
        <div className="mos-collapsed" onClick={() => setIsExpanded(!isExpanded)}>
          <div className="mos-collapsed-content">
            <span style={{ fontSize: '18px' }}>🛒</span>
            <span className="mos-collapsed-text">
              {items.length} {items.length === 1 ? 'item' : 'items'}
            </span>
          </div>
          <span className="mos-collapsed-total">${total.toFixed(2)}</span>
          <span className="mos-chevron">▲</span>
        </div>

        {/* Expanded content */}
        <div className="mos-expanded">
          {/* Items list */}
          <div className="mos-items">
            {items.map((item) => (
              <div key={item.id} className="mos-item">
                {item.image && (
                  <div className="mos-item-image">
                    <img src={item.image} alt={item.name} />
                  </div>
                )}
                <div className="mos-item-info">
                  <div className="mos-item-name">{item.name}</div>
                  <div className="mos-item-qty">Qty: {item.quantity}</div>
                </div>
                <div className="mos-item-price">${(item.price * item.quantity).toFixed(2)}</div>
              </div>
            ))}
          </div>

          {/* Breakdown */}
          <div className="mos-breakdown">
            <div className="mos-row">
              <span className="mos-row-label">Subtotal</span>
              <span className="mos-row-value">${subtotal.toFixed(2)}</span>
            </div>
            <div className="mos-row">
              <span className="mos-row-label">Delivery</span>
              <span className="mos-row-value">${delivery.toFixed(2)}</span>
            </div>
            {tax > 0 && (
              <div className="mos-row">
                <span className="mos-row-label">Tax</span>
                <span className="mos-row-value">${tax.toFixed(2)}</span>
              </div>
            )}
            <div className="mos-row mos-total">
              <span className="mos-row-label">Total</span>
              <span className="mos-row-value">${total.toFixed(2)}</span>
            </div>
          </div>

          {/* CTA */}
          <div className="mos-cta">
            <button className="mos-cta-btn" onClick={onContinue} disabled={isLoading}>
              {isLoading ? 'Processing...' : 'Continue to Payment'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileOrderSummary;
