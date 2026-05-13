import Link from 'next/link';
import { useRef, useEffect, useState } from 'react';

interface ScheduledOrdersAccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    error?: string | null;
    onRetry?: () => void;
}

const ScheduledOrdersAccessModal = ({ isOpen, onClose, error, onRetry }: ScheduledOrdersAccessModalProps) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const firstButtonRef = useRef<HTMLButtonElement>(null);
    const [isRetrying, setIsRetrying] = useState(false);

    const handleRetry = () => {
        setIsRetrying(true);
        onRetry?.();
        // Simulate retry completion
        setTimeout(() => setIsRetrying(false), 1000);
    };

    // Handle keyboard shortcuts and focus management
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            // Close on Escape
            if (e.key === 'Escape') {
                onClose();
            }

            // Tab focus trap
            if (e.key === 'Tab') {
                const focusableElements = modalRef.current?.querySelectorAll(
                    'button, a, [tabindex]:not([tabindex="-1"])'
                );
                if (!focusableElements || focusableElements.length === 0) return;

                const firstElement = focusableElements[0] as HTMLElement;
                const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
                const activeElement = document.activeElement;

                if (e.shiftKey) {
                    // Shift + Tab
                    if (activeElement === firstElement) {
                        lastElement.focus();
                        e.preventDefault();
                    }
                } else {
                    // Tab
                    if (activeElement === lastElement) {
                        firstElement.focus();
                        e.preventDefault();
                    }
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        firstButtonRef.current?.focus();

        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleApplyClick = () => {
        onClose();
        // Navigate to the scheduled orders application/request page
        window.location.href = '/contact-us?subject=scheduled-orders-application';
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="soa-backdrop"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Modal */}
            <div
                ref={modalRef}
                className="soa-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="soa-title"
                aria-describedby="soa-description"
            >
                {/* Close button */}
                <button
                    className="soa-close"
                    onClick={onClose}
                    aria-label="Close dialog"
                    type="button"
                >
                    ×
                </button>

                {/* Icon */}
                <div className="soa-icon" aria-hidden="true">
                    <i className="fi-rs-calendar"></i>
                </div>

                {/* Title */}
                <h2 id="soa-title" className="soa-title">
                    Scheduled Orders
                </h2>

                {/* Error Banner */}
                {error && (
                    <div className="soa-error-banner" role="alert">
                        <div className="soa-error-icon">⚠️</div>
                        <div className="soa-error-content">
                            <p className="soa-error-text">{error}</p>
                            {onRetry && (
                                <button
                                    onClick={handleRetry}
                                    className="soa-error-retry"
                                    type="button"
                                    disabled={isRetrying}
                                    aria-label="Retry access check"
                                    aria-busy={isRetrying ? 'true' : 'false'}
                                >
                                    {isRetrying ? (
                                        <>
                                            <span className="soa-spinner"></span>
                                            Retrying...
                                        </>
                                    ) : (
                                        'Try Again'
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Description */}
                <p id="soa-description" className="soa-description">
                    This feature is available for pre-approved accounts only.
                    Scheduled orders allow you to automate recurring deliveries
                    on your preferred schedule.
                </p>

                {/* Benefits */}
                <div className="soa-benefits" role="region" aria-label="Feature benefits">
                    <div className="soa-benefit-item">
                        <span className="soa-checkmark">✓</span>
                        Automated recurring orders
                    </div>
                    <div className="soa-benefit-item">
                        <span className="soa-checkmark">✓</span>
                        Fixed delivery schedules
                    </div>
                    <div className="soa-benefit-item">
                        <span className="soa-checkmark">✓</span>
                        Volume discounts available
                    </div>
                    <div className="soa-benefit-item">
                        <span className="soa-checkmark">✓</span>
                        Priority customer support
                    </div>
                </div>

                {/* CTA Buttons */}
                <div className="soa-buttons">
                    <button
                        ref={firstButtonRef}
                        onClick={handleApplyClick}
                        className="soa-btn soa-btn-primary"
                        type="button"
                        aria-label="Apply for scheduled orders access"
                    >
                        Apply for Access
                    </button>

                    <Link
                        href="/contact-us?subject=scheduled-orders"
                        className="soa-btn soa-btn-secondary"
                        onClick={onClose}
                    >
                        Contact Sales
                    </Link>

                    <button
                        onClick={onClose}
                        className="soa-btn soa-btn-tertiary"
                        type="button"
                        aria-label="Dismiss dialog"
                    >
                        Maybe Later
                    </button>
                </div>
            </div>

            <style jsx>{`
                .soa-backdrop {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    z-index: 999;
                    backdrop-filter: blur(2px);
                }

                .soa-modal {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: #fff;
                    border-radius: 12px;
                    padding: 40px 30px;
                    max-width: 450px;
                    width: 90%;
                    z-index: 1000;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
                    max-height: 90vh;
                    overflow-y: auto;
                    font-family: 'Plus Jakarta Sans', sans-serif;
                }

                .soa-close {
                    position: absolute;
                    top: 16px;
                    right: 16px;
                    background: none;
                    border: none;
                    font-size: 28px;
                    color: #636363;
                    cursor: pointer;
                    padding: 4px 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 4px;
                    transition: all 0.2s;
                }

                .soa-close:hover {
                    background: #f4f4f4;
                    color: #333;
                }

                .soa-close:focus {
                    outline: 2px solid #1a5c38;
                    outline-offset: 2px;
                }

                .soa-icon {
                    font-size: 48px;
                    margin-bottom: 16px;
                    color: #1a5c38;
                }

                .soa-title {
                    font-size: 24px;
                    font-weight: 700;
                    color: #1a5c38;
                    margin-bottom: 12px;
                    margin-top: 0;
                }

                .soa-error-banner {
                    background: #fff3cd;
                    border: 1px solid #ffc107;
                    border-radius: 8px;
                    padding: 16px;
                    margin-bottom: 20px;
                    display: flex;
                    gap: 12px;
                    align-items: flex-start;
                }

                .soa-error-icon {
                    font-size: 20px;
                    flex-shrink: 0;
                }

                .soa-error-content {
                    flex: 1;
                }

                .soa-error-text {
                    font-size: 13px;
                    color: #856404;
                    margin: 0 0 8px 0;
                    line-height: 1.5;
                }

                .soa-error-retry {
                    background: #ffc107;
                    color: #333;
                    border: none;
                    padding: 6px 12px;
                    border-radius: 4px;
                    font-size: 12px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: background 0.2s;
                }

                .soa-error-retry:hover {
                    background: #e0a800;
                }

                .soa-error-retry:focus {
                    outline: 2px solid #856404;
                    outline-offset: 2px;
                }

                .soa-error-retry:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }

                .soa-spinner {
                    display: inline-block;
                    width: 12px;
                    height: 12px;
                    border: 2px solid rgba(51, 51, 51, 0.2);
                    border-radius: 50%;
                    border-top-color: #333;
                    animation: soa-spin 0.8s linear infinite;
                    margin-right: 6px;
                    vertical-align: middle;
                }

                @keyframes soa-spin {
                    to {
                        transform: rotate(360deg);
                    }
                }

                .soa-description {
                    font-size: 14px;
                    color: #595959;
                    line-height: 1.6;
                    margin-bottom: 24px;
                }

                .soa-benefits {
                    background: #f4f9f6;
                    padding: 16px;
                    border-radius: 8px;
                    margin-bottom: 24px;
                    text-align: left;
                }

                .soa-benefit-item {
                    font-size: 13px;
                    color: #555;
                    margin-bottom: 8px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .soa-benefit-item:last-child {
                    margin-bottom: 0;
                }

                .soa-checkmark {
                    color: #1a5c38;
                    font-weight: 700;
                    flex-shrink: 0;
                }

                .soa-buttons {
                    display: flex;
                    gap: 12px;
                    flex-direction: column;
                }

                .soa-btn {
                    padding: 12px 24px;
                    border-radius: 6px;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    font-family: 'Plus Jakarta Sans', sans-serif;
                    transition: all 0.2s;
                    border: none;
                    text-decoration: none;
                    display: block;
                    text-align: center;
                }

                .soa-btn:focus {
                    outline: 2px solid #1a5c38;
                    outline-offset: 2px;
                }

                .soa-btn-primary {
                    background: #1a5c38;
                    color: #fff;
                }

                .soa-btn-primary:hover {
                    background: #2a9d6e;
                }

                .soa-btn-primary:active {
                    background: #249060;
                }

                .soa-btn-secondary {
                    background: #fff;
                    color: #1a5c38;
                    border: 2px solid #1a5c38;
                }

                .soa-btn-secondary:hover {
                    background: #1a5c38;
                    color: #fff;
                }

                .soa-btn-secondary:active {
                    background: #2a9d6e;
                    border-color: #2a9d6e;
                }

                .soa-btn-tertiary {
                    background: transparent;
                    color: #636363;
                }

                .soa-btn-tertiary:hover {
                    background: #f4f4f4;
                    color: #595959;
                }

                .soa-btn-tertiary:active {
                    color: #333;
                }

                @media (max-width: 768px) {
                    .soa-modal {
                        max-width: calc(100% - 32px);
                        padding: 32px 24px;
                    }

                    .soa-title {
                        font-size: 20px;
                    }

                    .soa-description {
                        font-size: 13px;
                    }

                    .soa-icon {
                        font-size: 40px;
                    }
                }

                @media (prefers-reduced-motion: reduce) {
                    .soa-modal,
                    .soa-btn {
                        transition: none;
                    }
                }
            `}</style>
        </>
    );
};

export default ScheduledOrdersAccessModal;
