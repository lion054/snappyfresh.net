import { useState, useEffect, FC } from 'react';

/**
 * Cookie Consent Banner — GDPR/Privacy compliance
 * Shows on first visit, stores preference in localStorage.
 * Blocks analytics/tracking scripts until user consents.
 */
const CookieConsent: FC = () => {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      // Small delay so it doesn't flash on page load
      const timer = setTimeout(() => setVisible(true), 1000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, []);

  const acceptAll = () => {
    localStorage.setItem('cookie-consent', JSON.stringify({ essential: true, analytics: true, marketing: true, timestamp: Date.now() }));
    setVisible(false);
    // Reload to enable tracking scripts
    window.location.reload();
  };

  const acceptEssential = () => {
    localStorage.setItem('cookie-consent', JSON.stringify({ essential: true, analytics: false, marketing: false, timestamp: Date.now() }));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <>
      <style>{`
        .cc-banner {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 9999;
          background: #fff;
          border-top: 2px solid #1a5c38;
          box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.12);
          padding: 20px 24px;
          animation: ccSlideUp 0.4s ease;
        }
        @keyframes ccSlideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .cc-inner {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
        }
        .cc-text {
          flex: 1;
          min-width: 280px;
          font-size: 14px;
          line-height: 1.6;
          color: #333;
        }
        .cc-text a {
          color: #1a5c38;
          font-weight: 700;
          text-decoration: underline;
        }
        .cc-details {
          font-size: 13px;
          color: #595959;
          margin-top: 10px;
          line-height: 1.6;
        }
        .cc-description {
          margin: 0;
        }
        .cc-details-toggle {
          background: none;
          border: none;
          color: #1a5c38;
          font-weight: 700;
          cursor: pointer;
          font-size: 13px;
          padding: 0;
          text-decoration: underline;
        }
        .cc-buttons {
          display: flex;
          gap: 10px;
          flex-shrink: 0;
          flex-wrap: wrap;
        }
        .cc-btn {
          padding: 10px 22px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          border: 2px solid #1a5c38;
          font-family: inherit;
        }
        .cc-btn-accept {
          background: #1a5c38;
          color: #fff;
        }
        .cc-btn-accept:hover {
          background: #236b43;
        }
        .cc-btn-essential {
          background: #fff;
          color: #1a5c38;
        }
        .cc-btn-essential:hover {
          background: #f4f9f6;
        }
        @media (max-width: 640px) {
          .cc-inner { flex-direction: column; text-align: center; }
          .cc-buttons { width: 100%; justify-content: center; }
        }
      `}</style>

      <div className="cc-banner" role="dialog" aria-label="Cookie consent" aria-describedby="cc-description">
        <div className="cc-inner">
          <div className="cc-text">
            <p id="cc-description" className="cc-description">
              We use cookies to improve your shopping experience, analyze site traffic, and personalize content.
              By clicking "Accept All", you consent to our use of cookies.
              Read our <a href="/privacy-policy">Privacy Policy</a> for more information.
            </p>
            {showDetails && (
              <div className="cc-details">
                <strong>Essential cookies:</strong> Required for basic site functionality (cart, login, preferences).<br />
                <strong>Analytics cookies:</strong> Google Analytics — helps us understand how you use our site.<br />
                <strong>Marketing cookies:</strong> Facebook Pixel — used for relevant advertising.
              </div>
            )}
            <button type="button" className="cc-details-toggle" onClick={() => setShowDetails(!showDetails)}>
              {showDetails ? 'Hide details' : 'Learn more about our cookies'}
            </button>
          </div>
          <div className="cc-buttons">
            <button type="button" className="cc-btn cc-btn-accept" onClick={acceptAll}>Accept All</button>
            <button type="button" className="cc-btn cc-btn-essential" onClick={acceptEssential}>Essential Only</button>
          </div>
        </div>
      </div>
    </>
  );
};

/**
 * Helper to check if user has consented to a specific cookie category.
 * Use this before initializing analytics/marketing scripts.
 */
export function hasConsent(category: 'analytics' | 'marketing'): boolean {
  try {
    const raw = localStorage.getItem('cookie-consent');
    if (!raw) return false;
    const consent = JSON.parse(raw);
    return consent[category] === true;
  } catch {
    return false;
  }
}

export default CookieConsent;
