import { useState, FC } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

interface ProfileSwitcherProps {
  onSwitchSuccess?: () => void;
}

const ProfileSwitcher: FC<ProfileSwitcherProps> = ({ onSwitchSuccess }) => {
  const { user, businessPartners, loadingBusinessPartners, switchingProfile, switchProfile } = useAuth();
  const { cart, clearCart } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [pendingSwitchCardCode, setPendingSwitchCardCode] = useState<string | null>(null);
  const [pendingSwitchCardName, setPendingSwitchCardName] = useState<string | null>(null);

  // Don't show if still loading or no user
  if (loadingBusinessPartners || !user || user.customer?.isVisitor) {
    return null;
  }

  const currentCardCode = user?.customer?.cardCode;
  const currentCardName = user?.customer?.cardName || user?.userName || 'My Account';
  const hasCartItems = cart && cart.length > 0;

  // Get unique partners (filter duplicates by cardCode)
  const seenCodes = new Set<string>();
  const uniquePartners = businessPartners?.filter((partner) => {
    const cardCode = partner.u_CardCode || partner.U_CardCode || partner.code || partner.Code || (partner as any).cardCode;
    if (!cardCode || seenCodes.has(cardCode)) return false;
    seenCodes.add(cardCode);
    return true;
  }) || [];

  const hasMultiplePartners = uniquePartners.length > 1;

  // Don't render at all if user has only one (or no) partner
  if (!hasMultiplePartners) return null;

  const handleSwitch = async (cardCode: string, cardName: string) => {
    if (cardCode === currentCardCode || switchingProfile) return;

    // If user has cart items, show inline confirmation first
    if (hasCartItems) {
      setPendingSwitchCardCode(cardCode);
      setPendingSwitchCardName(cardName);
      return;
    }

    // No cart items, proceed with switch
    await executeSwitch(cardCode);
  };

  const executeSwitch = async (cardCode: string) => {
    clearCart();
    const result = await switchProfile(cardCode);
    if (result.success) {
      setPendingSwitchCardCode(null);
      setPendingSwitchCardName(null);
      setIsOpen(false);
      onSwitchSuccess?.();
      // Hard reload to reinitialize all contexts with the new profile
      window.location.reload();
    }
  };

  const cancelPendingSwitch = () => {
    setPendingSwitchCardCode(null);
    setPendingSwitchCardName(null);
  };

  return (
    <>
      <style>{`
        .ps-root {
          padding: 8px 14px;
          border-bottom: 1px solid #f0f0f0;
        }

        /* Mobile bottom sheet styling */
        @media (max-width: 640px) {
          .ps-root {
            position: relative;
          }

          .ps-list {
            position: fixed !important;
            bottom: 60px;
            left: 0;
            right: 0;
            margin: 0 !important;
            margin-top: 0 !important;
            border: none !important;
            border-radius: 20px 20px 0 0 !important;
            box-shadow: 0 -8px 32px rgba(0,0,0,0.15) !important;
            z-index: 900;
            max-height: 50vh;
            overflow-y: auto;
            -webkit-overflow-scrolling: touch;
            animation: psSlideUp 0.3s cubic-bezier(0.4,0,0.2,1);
          }

          @keyframes psSlideUp {
            from { transform: translateY(100%); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }

          .ps-list::before {
            content: '';
            display: block;
            width: 36px;
            height: 4px;
            background: #d1d5db;
            border-radius: 2px;
            margin: 12px auto 0;
            flex-shrink: 0;
          }

          .ps-toggle {
            width: 100%;
          }
        }
        .ps-toggle {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 8px 12px;
          background: #f8faf8;
          border: 1px solid #e8ece8;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.15s;
          text-align: left;
          font-family: inherit;
        }
        .ps-toggle:hover {
          background: #f0f5f0;
          border-color: #d0d8d0;
        }
        .ps-toggle.is-switching {
          opacity: 0.6;
          cursor: wait;
        }
        .ps-toggle-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border-radius: 6px;
          background: linear-gradient(135deg, #dcfce7, #bbf7d0);
          color: #16a34a;
          font-size: 12px;
          flex-shrink: 0;
        }
        .ps-toggle-info {
          flex: 1;
          min-width: 0;
        }
        .ps-toggle-label {
          font-size: 10px;
          font-weight: 600;
          color: #9ca3af;
          text-transform: uppercase;
          letter-spacing: 0.4px;
          margin-bottom: 1px;
        }
        .ps-toggle-name {
          font-size: 13px;
          font-weight: 500;
          color: #1f2937;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .ps-toggle-chevron {
          font-size: 14px;
          color: #9ca3af;
          transition: transform 0.2s;
          flex-shrink: 0;
        }
        .ps-toggle-chevron.is-open {
          transform: rotate(180deg);
        }
        .ps-list {
          margin-top: 6px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
          background: #fff;
          box-shadow: 0 1px 4px rgba(0,0,0,0.04);
          animation: psSlideDown 0.15s ease-out;
        }
        @keyframes psSlideDown {
          from { opacity: 0; max-height: 0; }
          to { opacity: 1; max-height: 300px; }
        }
        .ps-list-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 12px;
          cursor: pointer;
          transition: background 0.12s;
          border-bottom: 1px solid #f5f5f5;
        }
        .ps-list-item:last-child {
          border-bottom: none;
        }
        .ps-list-item:hover {
          background: #f0fdf4;
        }
        .ps-list-item.is-active {
          background: #f0fdf4;
          cursor: default;
        }
        .ps-list-item-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .ps-list-item-dot.active {
          background: #16a34a;
          box-shadow: 0 0 0 3px rgba(22,163,74,0.15);
        }
        .ps-list-item-dot.inactive {
          background: #d1d5db;
        }
        .ps-list-item-info {
          flex: 1;
          min-width: 0;
        }
        .ps-list-item-name {
          font-size: 13px;
          color: #1f2937;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .ps-list-item.is-active .ps-list-item-name {
          font-weight: 600;
          color: #16a34a;
        }
        .ps-list-item-code {
          font-size: 11px;
          color: #9ca3af;
        }
        .ps-list-item-check {
          color: #16a34a;
          font-size: 12px;
          flex-shrink: 0;
        }

        /* Inline confirmation styling */
        .ps-confirmation {
          padding: 14px 12px;
          background: #fef2f2;
          border: 1px solid #fed7d7;
          border-radius: 8px;
          margin-bottom: 8px;
          animation: psConfirmSlide 0.2s ease-out;
        }

        @keyframes psConfirmSlide {
          from { opacity: 0; max-height: 0; }
          to { opacity: 1; max-height: 200px; }
        }

        .ps-confirm-title {
          font-size: 13px;
          font-weight: 600;
          color: #7f1d1d;
          margin-bottom: 6px;
        }

        .ps-confirm-msg {
          font-size: 12px;
          color: #9ca3af;
          margin-bottom: 10px;
          line-height: 1.4;
        }

        .ps-confirm-actions {
          display: flex;
          gap: 8px;
        }

        .ps-confirm-btn {
          flex: 1;
          padding: 8px 12px;
          border: none;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s;
          min-height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .ps-confirm-cancel {
          background: #e5e7eb;
          color: #1f2937;
        }

        .ps-confirm-cancel:hover {
          background: #d1d5db;
        }

        .ps-confirm-switch {
          background: #dc2626;
          color: #fff;
        }

        .ps-confirm-switch:hover {
          background: #b91c1c;
        }
      `}</style>

      <div className="ps-root">
        <button
          type="button"
          className={`ps-toggle${switchingProfile ? ' is-switching' : ''}`}
          onClick={() => !switchingProfile && setIsOpen(!isOpen)}
        >
          <div className="ps-toggle-icon">
            {switchingProfile ? (
              <div className="spinner-border spinner-border-sm" style={{ width: 14, height: 14 }} role="status" />
            ) : (
              <i className="fi-rs-shuffle"></i>
            )}
          </div>
          <div className="ps-toggle-info">
            <div className="ps-toggle-label">Switch Account</div>
            <div className="ps-toggle-name">
              {switchingProfile ? 'Switching...' : currentCardName}
            </div>
          </div>
          <i className={`fi-rs-angle-small-down ps-toggle-chevron${isOpen ? ' is-open' : ''}`}></i>
        </button>

        {isOpen && !switchingProfile && (
          <div className="ps-list">
            {/* Inline confirmation when cart has items */}
            {pendingSwitchCardCode && (
              <div className="ps-confirmation">
                <div className="ps-confirm-title">Switch to {pendingSwitchCardName}?</div>
                <div className="ps-confirm-msg">
                  Your {cart.length} cart item{cart.length !== 1 ? 's' : ''} will be cleared.
                </div>
                <div className="ps-confirm-actions">
                  <button
                    type="button"
                    className="ps-confirm-btn ps-confirm-cancel"
                    onClick={cancelPendingSwitch}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="ps-confirm-btn ps-confirm-switch"
                    onClick={() => executeSwitch(pendingSwitchCardCode)}
                  >
                    Switch Account
                  </button>
                </div>
              </div>
            )}

            {uniquePartners
              .filter((partner) => {
                // Exclude current account from switchable list
                const cardCode = partner.u_CardCode || partner.U_CardCode || partner.code || partner.Code || (partner as any).cardCode;
                return cardCode !== currentCardCode;
              })
              .map((partner, idx) => {
                const cardCode = partner.u_CardCode || partner.U_CardCode || partner.code || partner.Code || (partner as any).cardCode;
                const cardName = partner.u_CardName || partner.U_CardName || (partner as any).name || (partner as any).Name || (partner as any).cardName;
                const key = partner.lineId !== undefined ? `${partner.lineId}` : `partner-${idx}`;

                return (
                  <div
                    key={key}
                    className="ps-list-item"
                    onClick={() => cardCode && handleSwitch(cardCode, cardName)}
                  >
                    <div className="ps-list-item-dot inactive" />
                    <div className="ps-list-item-info">
                      <div className="ps-list-item-name">{cardName}</div>
                      <div className="ps-list-item-code">{cardCode}</div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </>
  );
};

export default ProfileSwitcher;
