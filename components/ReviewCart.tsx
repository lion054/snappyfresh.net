import { FC } from 'react';
import { formatCurrency } from '../lib/formatters';

interface ReviewCartProps {
  items: any[];
  formData: any;
  deliveryType: string;
  scheduledDate?: string;
  scheduledTimeSlot?: string;
  cartTotal: number;
  onEdit: (step: number) => void;
}

const ReviewCart: FC<ReviewCartProps> = ({
  items,
  formData,
  deliveryType,
  scheduledDate,
  scheduledTimeSlot,
  cartTotal,
  onEdit,
}) => {
  const formatDate = (iso?: string) => {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="review-cart">
      <style>{`
        .review-cart { padding: 24px; }
        .review-section {
          background: #f8f9fa;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 20px;
        }
        .review-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        .review-title {
          font-size: 16px;
          font-weight: 700;
          color: #1a1a2e;
        }
        .review-edit-btn {
          background: none;
          border: none;
          color: #42af57;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          padding: 0;
          text-decoration: none;
        }
        .review-edit-btn:hover { text-decoration: underline; }

        .customer-info { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .info-item { }
        .info-label { font-size: 11px; font-weight: 700; color: #a0aec0; text-transform: uppercase; }
        .info-value { font-size: 15px; font-weight: 500; color: #1a1a2e; margin-top: 4px; }

        .address-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .delivery-info { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 16px; }

        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 16px;
        }
        .items-table th {
          background: #f0f0f0;
          padding: 12px;
          text-align: left;
          font-size: 12px;
          font-weight: 700;
          color: #718096;
          text-transform: uppercase;
          border-bottom: 1px solid #e2e8f0;
        }
        .items-table td {
          padding: 12px;
          border-bottom: 1px solid #e2e8f0;
          font-size: 14px;
        }
        .item-name { font-weight: 600; color: #1a1a2e; }
        .item-qty { color: #718096; }
        .item-price { text-align: right; font-weight: 600; color: #1a1a2e; }

        .totals-box {
          background: #fff;
          padding: 16px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          font-size: 14px;
        }
        .total-row-label { color: #718096; }
        .total-row-value { font-weight: 600; color: #1a1a2e; }
        .total-row.final {
          border-top: 2px solid #e2e8f0;
          padding-top: 12px;
          margin-top: 12px;
          font-size: 18px;
        }
        .total-row.final .total-row-value { color: #42af57; }

        @media (max-width: 768px) {
          .customer-info, .address-grid, .delivery-info { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* Customer Info Section */}
      <div className="review-section">
        <div className="review-header">
          <h3 className="review-title">Customer Information</h3>
          <button className="review-edit-btn" onClick={() => onEdit(1)}>
            ✎ Edit
          </button>
        </div>
        <div className="customer-info">
          <div className="info-item">
            <div className="info-label">Name</div>
            <div className="info-value">
              {formData.firstName} {formData.lastName}
            </div>
          </div>
          <div className="info-item">
            <div className="info-label">Email</div>
            <div className="info-value">{formData.email}</div>
          </div>
          <div className="info-item">
            <div className="info-label">Phone</div>
            <div className="info-value">{formData.mobileNumber}</div>
          </div>
          <div className="info-item">
            <div className="info-label">Company</div>
            <div className="info-value">{formData.companyName || '—'}</div>
          </div>
        </div>
      </div>

      {/* Address & Delivery Section */}
      <div className="review-section">
        <div className="review-header">
          <h3 className="review-title">Delivery Address & Options</h3>
          <button className="review-edit-btn" onClick={() => onEdit(2)}>
            ✎ Edit
          </button>
        </div>

        {/* Billing Address */}
        <div>
          <div className="info-label" style={{ marginBottom: '8px' }}>Billing Address</div>
          <div className="address-grid">
            <div className="info-item">
              <div className="info-label">Address</div>
              <div className="info-value">{formData.billAddressLine1}</div>
            </div>
            <div className="info-item">
              <div className="info-label">City / Suburb</div>
              <div className="info-value">
                {formData.billCity}, {formData.billSuburb}
              </div>
            </div>
            <div className="info-item">
              <div className="info-label">Country</div>
              <div className="info-value">{formData.billCountryName || formData.billCountry}</div>
            </div>
          </div>
        </div>

        {/* Delivery Options */}
        <div className="delivery-info">
          <div className="info-item">
            <div className="info-label">Delivery Type</div>
            <div className="info-value">
              {deliveryType === 'asap' ? 'ASAP (2-4 hours)' : 'Scheduled'}
            </div>
          </div>
          {deliveryType === 'scheduled' && (
            <>
              <div className="info-item">
                <div className="info-label">Delivery Date</div>
                <div className="info-value">{formatDate(scheduledDate)}</div>
              </div>
              <div className="info-item">
                <div className="info-label">Time Slot</div>
                <div className="info-value">{scheduledTimeSlot}</div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Order Items Section */}
      <div className="review-section">
        <h3 className="review-title" style={{ marginBottom: '16px' }}>Order Items</h3>
        <table className="items-table">
          <thead>
            <tr>
              <th>Item</th>
              <th style={{ textAlign: 'center' }}>Qty</th>
              <th style={{ textAlign: 'right' }}>Price</th>
              <th style={{ textAlign: 'right' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx}>
                <td>
                  <div className="item-name">{item.itemName}</div>
                  <div className="item-qty" style={{ fontSize: '12px', marginTop: '4px' }}>
                    Code: {item.itemCode}
                  </div>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <span className="item-qty">{item.quantity}</span>
                </td>
                <td className="item-price">
                  {formatCurrency(item.uom?.price || item.price || 0)}
                </td>
                <td className="item-price">
                  {formatCurrency((item.uom?.price || item.price || 0) * item.quantity)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="totals-box">
          <div className="total-row">
            <span className="total-row-label">Subtotal</span>
            <span className="total-row-value">{formatCurrency(cartTotal)}</span>
          </div>
          <div className="total-row">
            <span className="total-row-label">Delivery</span>
            <span className="total-row-value">$0.00</span>
          </div>
          <div className="total-row">
            <span className="total-row-label">Tax (VAT)</span>
            <span className="total-row-value">$0.00</span>
          </div>
          <div className="total-row final">
            <span>Total</span>
            <span className="total-row-value">{formatCurrency(cartTotal)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewCart;
