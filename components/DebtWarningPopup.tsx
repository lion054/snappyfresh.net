import { useState, useEffect, FC } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency } from '../lib/formatters';

const DISMISS_KEY = 'debt_warning_dismissed';

const DebtWarningPopup: FC = () => {
    const { user } = useAuth();
    const [show, setShow] = useState(false);

    const customer = user?.customer;
    const balance =
        customer?.balance ?? customer?.Balance ??
        customer?.currentAccountBalance ?? customer?.CurrentAccountBalance ?? 0;
    const isInDebt = balance > 0 && !customer?.isVisitor;

    useEffect(() => {
        if (!isInDebt) return;
        // Only show once per session (per cardCode)
        const key = `${DISMISS_KEY}_${customer?.cardCode}`;
        if (sessionStorage.getItem(key)) return;
        setShow(true);
    }, [isInDebt, customer?.cardCode]);

    const dismiss = () => {
        setShow(false);
        if (customer?.cardCode) {
            sessionStorage.setItem(`${DISMISS_KEY}_${customer.cardCode}`, '1');
        }
    };

    if (!show) return null;

    return (
        <div className="debt-overlay">
            <div className="debt-popup">
                <div className="debt-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                        <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                </div>
                <h2>Account Has Outstanding Balance</h2>
                <p>
                    Your account <strong>{customer?.cardName}</strong> has an outstanding balance of{' '}
                    <strong className="debt-amount">{formatCurrency(balance)}</strong>.
                </p>
                <p className="debt-sub">Please settle your account to avoid service interruptions. Contact support if you need assistance.</p>
                <div className="debt-actions">
                    <button className="debt-btn-primary" onClick={dismiss}>
                        I Understand
                    </button>
                </div>
            </div>
            <style jsx>{`
                .debt-overlay {
                    position: fixed; inset: 0; z-index: 10000;
                    background: rgba(0,0,0,0.6); backdrop-filter: blur(4px);
                    display: flex; align-items: center; justify-content: center; padding: 20px;
                }
                .debt-popup {
                    background: #fff; border-radius: 20px; padding: 40px 32px;
                    max-width: 440px; width: 100%; text-align: center;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                    animation: debtSlideIn 0.3s ease;
                }
                @keyframes debtSlideIn {
                    from { opacity: 0; transform: translateY(20px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .debt-icon { margin-bottom: 20px; }
                .debt-popup h2 {
                    font-size: 22px; font-weight: 800; color: #1a202c; margin: 0 0 12px;
                }
                .debt-popup p {
                    font-size: 15px; color: #4a5568; line-height: 1.6; margin: 0 0 8px;
                }
                .debt-amount { color: #dc2626; font-size: 18px; }
                .debt-sub { font-size: 13px; color: #718096; margin-bottom: 24px !important; }
                .debt-actions { display: flex; gap: 12px; justify-content: center; }
                .debt-btn-primary {
                    background: #dc2626; color: #fff; border: none;
                    padding: 14px 40px; border-radius: 10px;
                    font-size: 15px; font-weight: 700; cursor: pointer;
                    transition: background 0.2s;
                }
                .debt-btn-primary:hover { background: #b91c1c; }
                @media (max-width: 480px) {
                    .debt-popup { padding: 28px 20px; }
                    .debt-popup h2 { font-size: 19px; }
                }
            `}</style>
        </div>
    );
};

export default DebtWarningPopup;
