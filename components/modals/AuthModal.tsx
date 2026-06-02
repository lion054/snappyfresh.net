import { useEffect, useRef, useState, memo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuthModal } from '../../contexts/AuthModalContext';
import { useSwipeClose } from '../../hooks/useSwipeClose';
import LoginForm from '../auth/LoginForm';

const AuthModal = () => {
  const { isOpen, closeAuthModal, pendingRedirect, view } = useAuthModal();
  const router = useRouter();
  const modalRef = useRef<HTMLDivElement>(null);
  const mobileSheetRef = useRef<HTMLDivElement>(null);
  const justOpenedRef = useRef(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(view || 'login');

  // Sync active tab when view from context changes
  useEffect(() => {
    setActiveTab(view || 'login');
  }, [view]);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close on route change (except when login.tsx intentionally opens modal then redirects to home)
  useEffect(() => {
    const handleRouteChange = (url: string) => {
      // login.tsx opens the modal then calls router.replace('/'). Don't close on that specific transition.
      if (router.pathname === '/login' && url === '/') return;
      closeAuthModal();
    };
    router.events.on('routeChangeStart', handleRouteChange);
    return () => router.events.off('routeChangeStart', handleRouteChange);
  }, [router, closeAuthModal]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeAuthModal(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, closeAuthModal]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Swipe-to-close gesture (desktop modal + mobile sheet)
  useSwipeClose(closeAuthModal, modalRef, { threshold: 80 });
  useSwipeClose(closeAuthModal, mobileSheetRef, { threshold: 80 });

  // Suppress overlay click for 300ms after modal opens (prevents mobile tap-to-open from immediately closing)
  useEffect(() => {
    if (!isOpen) {
      justOpenedRef.current = false;
      return;
    }

    justOpenedRef.current = true;
    const timer = setTimeout(() => {
      justOpenedRef.current = false;
    }, 300);
    return () => clearTimeout(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  // MOBILE: Render as bottom-sheet
  if (isMobile) {
    return (
      <>
        <style jsx global>{`
          /* === MOBILE BOTTOM-SHEET === */
          .ms-backdrop {
            position: fixed; inset: 0; background: rgba(0,0,0,0.45); z-index: 1100;
            display: flex; align-items: flex-end; animation: msBackdropIn 0.25s ease;
          }
          @keyframes msBackdropIn { from { opacity: 0; } to { opacity: 1; } }

          .ms-sheet {
            background: #fff; border-radius: 24px 24px 0 0; width: 100%; max-height: 92vh;
            overflow-y: auto; overscroll-behavior: contain;
            display: flex; flex-direction: column;
            box-shadow: 0 -8px 40px rgba(0,0,0,0.18);
            animation: msSheetUp 0.35s cubic-bezier(0.32,0.72,0,1);
          }
          @keyframes msSheetUp { from { transform: translateY(100%); } to { transform: translateY(0); } }

          .ms-handle { width: 36px; height: 4px; background: #d1d5db; border-radius: 2px; margin: 12px auto 0; flex-shrink: 0; }

          .ms-header { display: flex; justify-content: center; padding: 10px 20px 6px; flex-shrink: 0; }
          .ms-brand-pill {
            background: linear-gradient(135deg, #1a5c38 0%, #0d3d22 100%); color: #fff;
            font-size: 13px; font-weight: 700; padding: 6px 18px; border-radius: 20px;
          }

          .ms-tabs {
            display: flex; position: relative; margin: 10px 20px 0;
            background: #f3f4f6; border-radius: 12px; padding: 4px; flex-shrink: 0;
          }
          .ms-tab {
            flex: 1; background: none; border: none; padding: 9px 0 !important;
            font-family: 'Plus Jakarta Sans', sans-serif; font-size: 14px !important;
            font-weight: 700; color: #6b7c74; cursor: pointer; border-radius: 9px;
            position: relative; z-index: 1; transition: color 0.2s;
            min-height: 0 !important; -webkit-tap-highlight-color: transparent;
          }
          .ms-tab--active { color: #1a5c38; }
          .ms-tab-indicator {
            position: absolute; top: 4px; left: 4px;
            width: calc(50% - 4px); height: calc(100% - 8px);
            background: #fff; border-radius: 9px; box-shadow: 0 1px 4px rgba(0,0,0,0.12);
            transition: transform 0.22s cubic-bezier(0.4,0,0.2,1); pointer-events: none;
          }

          .ms-body { flex: 1; overflow: visible; }
          .ms-panel { padding: 4px 20px 40px; animation: msFadeIn 0.2s ease; }
          @keyframes msFadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }

          /* === Form input styles for mobile bottom-sheet === */
          .ms-panel .am-title { font-size: 16px; font-weight: 800; color: #111a14; margin-bottom: 4px; }
          .ms-panel .am-sub { font-size: 12px; color: #6b7c74; margin-bottom: 14px; line-height: 1.5; }
          .ms-panel .am-input-wrap {
            border: 2px solid #e0e6e2; border-radius: 14px; overflow: hidden;
            display: flex; align-items: center; margin-bottom: 12px;
            background: #fafbfa; transition: all 0.3s ease;
            box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          }
          .ms-panel .am-input-wrap:focus-within {
            border-color: #1a5c38; background: #fff;
            box-shadow: 0 0 0 3px rgba(26,92,56,0.1), 0 4px 12px rgba(26,92,56,0.15);
          }
          .ms-panel .am-input-wrap.am-error {
            border-color: #e74c3c; box-shadow: 0 0 0 3px rgba(231,76,60,0.1);
          }
          .ms-panel .am-input-prefix {
            padding: 0 12px; height: 48px; display: flex; align-items: center;
            font-size: 18px; flex-shrink: 0;
          }
          .ms-panel .am-input-wrap input {
            flex: 1; border: none; outline: none; padding: 0 12px;
            font-family: 'Plus Jakarta Sans', sans-serif; font-size: 15px;
            color: #111a14; height: 48px; background: transparent;
          }
          .ms-panel .am-input-wrap input::placeholder { color: #b0bab0; }
          .ms-panel .am-pwd-toggle {
            padding: 0 10px; cursor: pointer; font-size: 18px;
            background: none; border: none; color: #6b7c74;
            width: 44px; height: 44px; display: flex; align-items: center;
            justify-content: center; flex-shrink: 0; border-radius: 8px;
          }
          .ms-panel .am-pwd-toggle:hover { background: rgba(26,92,56,0.1); color: #1a5c38; }
          .ms-panel .am-field-error { margin-top: -6px; margin-bottom: 4px; font-size: 12px; }
          .ms-panel .am-forgot {
            display: block; text-align: center; font-size: 12px;
            color: #1a5c38; font-weight: 700; margin-bottom: 14px; text-decoration: none;
          }
          .ms-panel .am-go-btn {
            width: 100%; background: linear-gradient(135deg, #1a5c38 0%, #0d3d22 100%);
            color: #fff; border: none; border-radius: 14px; padding: 14px;
            font-family: 'Plus Jakarta Sans', sans-serif; font-size: 15px;
            font-weight: 800; cursor: pointer; margin-bottom: 10px; min-height: 48px;
            display: flex; align-items: center; justify-content: center;
            box-shadow: 0 4px 15px rgba(26,92,56,0.25);
          }
          .ms-panel .am-go-btn:disabled { opacity: 0.75; cursor: not-allowed; background: #6b9b7e; }
          .ms-panel .am-divider { display: flex; align-items: center; gap: 12px; margin: 12px 0; }
          .ms-panel .am-div-line { flex: 1; height: 1px; background: #e0e6e2; }
          .ms-panel .am-div-txt { font-size: 11px; color: #6b7c74; font-weight: 600; }
          .ms-panel .am-signup { text-align: center; font-size: 12px; color: #6b7c74; }
          .ms-panel .am-signup a, .ms-panel .am-signup button { color: #1a5c38; font-weight: 700; }
        `}</style>

        <div className="ms-backdrop" onClick={() => { if (!justOpenedRef.current) closeAuthModal(); }}>
          <div className="ms-sheet" ref={mobileSheetRef} onClick={e => e.stopPropagation()}>
            <div className="ms-handle" aria-hidden="true" />

            <div className="ms-header">
              <span className="ms-brand-pill">🥛 SnappyFresh 🧀</span>
            </div>

            <div className="ms-tabs" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'login' ? 'true' : 'false'}
                onClick={() => setActiveTab('login')}
                className={`ms-tab ${activeTab === 'login' ? 'ms-tab--active' : ''}`}
              >
                Sign In
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'register' ? 'true' : 'false'}
                onClick={() => setActiveTab('register')}
                className={`ms-tab ${activeTab === 'register' ? 'ms-tab--active' : ''}`}
              >
                Sign Up
              </button>
              <div
                className="ms-tab-indicator"
                style={{ transform: `translateX(${activeTab === 'login' ? '0%' : '100%'})` }}
              />
            </div>

            <div className="ms-body">
              {activeTab === 'login' && (
                <div className="ms-panel">
                  <LoginForm
                    hideBanner={true}
                    onSuccess={closeAuthModal}
                    onSwitchToRegister={() => setActiveTab('register')}
                    pendingRedirect={pendingRedirect}
                  />
                </div>
              )}
              {activeTab === 'register' && (
                <div className="ms-panel">
                  <div className="am-title">Create an Account</div>
                  <div className="am-sub">Complete your registration with address &amp; delivery setup.</div>
                  <Link href="/register" className="am-go-btn" style={{ display: 'flex', textDecoration: 'none', justifyContent: 'center', alignItems: 'center' }} onClick={closeAuthModal}>
                    Go to Registration →
                  </Link>
                  <div className="am-signup">
                    Already have an account?{' '}
                    <button type="button" onClick={() => setActiveTab('login')} style={{ background: 'none', border: 'none', color: '#1a5c38', fontWeight: 700, cursor: 'pointer', padding: 0, fontFamily: 'inherit', fontSize: 'inherit' }}>
                      Sign in
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </>
    );
  }

  // DESKTOP: Render as modal
  return (
    <>
      <style jsx global>{`
        .am-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.55);
          z-index: 1100;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: amFadeIn 0.25s ease;
        }
        @keyframes amFadeIn { from { opacity: 0; } to { opacity: 1; } }

        .am-modal {
          background: #fff;
          border-radius: 20px;
          overflow: hidden;
          width: 460px;
          max-width: 94vw;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 24px 72px rgba(0,0,0,0.22);
          animation: amSlideUp 0.3s cubic-bezier(0.4,0,0.2,1);
          position: relative;
        }
        @keyframes amSlideUp { from { transform: translateY(24px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

        .am-close {
          position: absolute;
          top: 8px;
          right: 8px;
          z-index: 10;
          background: rgba(255,255,255,0.15);
          border: none;
          color: #fff;
          font-size: 22px;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }
        .am-close:hover { background: rgba(255,255,255,0.3); }

        /* ── Banner ── */
        .am-banner {
          background: linear-gradient(135deg, #1a5c38 0%, #0d3d22 100%);
          padding: 36px 28px 28px;
          text-align: center;
          position: relative;
          overflow: hidden;
          box-shadow: inset 0 -2px 8px rgba(0,0,0,0.15);
        }
        .am-banner-bg {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(circle at 70% 30%, rgba(46,204,113,0.25), transparent 60%),
            radial-gradient(circle at 20% 80%, rgba(26,92,56,0.2), transparent 50%);
          opacity: 0.8;
        }
        .am-emojis {
          font-size: 28px;
          display: flex;
          justify-content: center;
          gap: 10px;
          flex-wrap: wrap;
          margin-bottom: 16px;
          position: relative;
          z-index: 1;
          animation: emojiBounce 2s ease-in-out infinite;
        }
        @keyframes emojiBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
        }
        .am-logo {
          font-size: 28px;
          font-weight: 800;
          color: #fff;
          position: relative;
          z-index: 1;
          letter-spacing: -0.5px;
          text-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }
        .am-logo span {
          color: #00d26a;
          font-weight: 800;
        }

        /* ── Body ── */
        .am-body { padding: 28px; }
        .am-title { font-size: 20px; font-weight: 800; color: #111a14; text-align: center; margin-bottom: 6px; }
        .am-sub { font-size: 13px; color: #6b7c74; text-align: center; margin-bottom: 24px; line-height: 1.5; }

        /* ── Inputs ── */
        .am-input-wrap {
          border: 2px solid #e0e6e2;
          border-radius: 14px;
          overflow: hidden;
          display: flex;
          align-items: center;
          margin-bottom: 16px;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          background: #fafbfa;
        }
        .am-input-wrap:focus-within {
          border-color: #1a5c38;
          box-shadow: 0 0 0 3px rgba(26,92,56,0.1), 0 4px 12px rgba(26,92,56,0.15);
          background: #fff;
        }
        .am-input-wrap.am-error {
          border-color: #e74c3c;
          box-shadow: 0 0 0 3px rgba(231,76,60,0.1);
        }
        .am-input-prefix {
          background: rgba(26,92,56,0.08);
          padding: 0 14px;
          height: 52px;
          display: flex;
          align-items: center;
          font-size: 20px;
          border-right: 1px solid #e0e6e2;
          flex-shrink: 0;
          transition: background 0.3s ease;
        }
        .am-input-wrap:focus-within .am-input-prefix {
          background: rgba(26,92,56,0.12);
        }
        .am-input-wrap input {
          flex: 1;
          border: none;
          outline: none;
          padding: 0 16px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 16px;
          color: #111a14;
          height: 52px;
          background: transparent;
          transition: all 0.3s ease;
        }
        .am-input-wrap input::placeholder {
          color: #b0bab0;
          transition: color 0.3s ease;
        }
        .am-input-wrap:focus-within input::placeholder {
          color: #d0d4d0;
        }
        .am-pwd-toggle {
          padding: 0 14px;
          cursor: pointer;
          font-size: 18px;
          background: none;
          border: none;
          color: #6b7c74;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.2s ease;
          border-radius: 8px;
        }
        .am-pwd-toggle:hover {
          background: rgba(26,92,56,0.1);
          color: #1a5c38;
        }
        .am-field-error { margin-top: -10px; margin-bottom: 8px; font-size: 12px; }

        /* ── Links & Buttons ── */
        .am-forgot {
          display: block;
          text-align: center;
          font-size: 13px;
          color: #1a5c38;
          font-weight: 700;
          margin-bottom: 20px;
          text-decoration: none;
          transition: all 0.3s ease;
          position: relative;
        }
        .am-forgot::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 2px;
          background: #1a5c38;
          transition: width 0.3s ease;
        }
        .am-forgot:hover {
          color: #0d3d22;
        }
        .am-forgot:hover::after {
          width: 100%;
        }

        .am-go-btn {
          width: 100%;
          background: linear-gradient(135deg, #1a5c38 0%, #0d3d22 100%);
          color: #fff;
          border: none;
          border-radius: 14px;
          padding: 16px 24px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 16px;
          font-weight: 800;
          cursor: pointer;
          margin-bottom: 12px;
          transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
          box-shadow: 0 4px 15px rgba(26,92,56,0.25);
          position: relative;
          overflow: hidden;
          letter-spacing: 0.3px;
          min-height: 52px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .am-go-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(26,92,56,0.35);
          background: linear-gradient(135deg, #236b43 0%, #0f4a2a 100%);
        }
        .am-go-btn:active:not(:disabled) {
          transform: translateY(0);
          box-shadow: 0 2px 8px rgba(26,92,56,0.2);
        }
        .am-go-btn:disabled {
          opacity: 0.75;
          cursor: not-allowed;
          transform: none;
          background: #6b9b7e;
        }

        /* ── Divider ── */
        .am-divider { display: flex; align-items: center; gap: 12px; margin: 16px 0; }
        .am-div-line { flex: 1; height: 1px; background: #e0e6e2; }
        .am-div-txt { font-size: 12px; color: #6b7c74; font-weight: 600; }

        /* ── Social ── */
        .am-social { display: flex; gap: 10px; margin-bottom: 16px; }
        .am-social-btn {
          flex: 1;
          border: 2px solid #e0e6e2;
          border-radius: 10px;
          padding: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 13px;
          font-weight: 700;
          background: #fff;
          color: #111a14;
          transition: border-color 0.2s;
        }
        .am-social-btn:hover { border-color: #1a5c38; }

        /* ── Signup ── */
        .am-signup { text-align: center; font-size: 13px; color: #6b7c74; }
        .am-signup a { color: #1a5c38; font-weight: 700; text-decoration: none; }
        .am-signup a:hover { text-decoration: underline; }

        /* ── Mobile Optimization ── */
        @media (max-width: 640px) {
          .am-overlay {
            align-items: flex-start !important;
            justify-content: flex-start !important;
            background: #fff !important;
            z-index: 1200 !important;
          }
          .am-modal {
            width: 100% !important;
            max-width: 100% !important;
            max-height: 100vh !important;
            height: 100vh !important;
            border-radius: 0 !important;
            margin-bottom: 0;
            overflow-y: auto !important;
            display: flex !important;
            flex-direction: column !important;
            animation: none !important;
          }
          /* Drag handle pill for swipe-to-close */
          .am-modal::before {
            content: '';
            display: block;
            width: 36px;
            height: 4px;
            background: #d1d5db;
            border-radius: 2px;
            margin: 12px auto 0;
            flex-shrink: 0;
          }
          .am-banner {
            padding: 20px 20px 16px !important;
          }
          .am-emojis {
            font-size: 20px;
            gap: 6px;
            margin-bottom: 8px;
          }
          .am-logo {
            font-size: 22px;
          }
          .am-body {
            padding: 20px !important;
          }
          .am-title {
            font-size: 18px !important;
            margin-bottom: 4px;
          }
          .am-sub {
            font-size: 12px !important;
            margin-bottom: 18px !important;
          }
          .am-input-wrap {
            margin-bottom: 12px !important;
            height: 52px;
          }
          .am-input-wrap input {
            font-size: 16px !important;
            height: 52px !important;
          }
          .am-field-error {
            margin-top: -6px !important;
            margin-bottom: 4px !important;
            font-size: 12px;
          }
          .am-forgot {
            font-size: 12px !important;
            margin-bottom: 12px !important;
          }
          .am-go-btn {
            padding: 13px !important;
            font-size: 15px !important;
            margin-bottom: 6px !important;
            min-height: 48px;
          }
          .am-divider {
            margin: 12px 0 !important;
          }
          .am-div-txt {
            font-size: 11px !important;
          }
          .am-social {
            gap: 8px !important;
            margin-bottom: 12px !important;
          }
          .am-social-btn {
            padding: 8px !important;
            font-size: 12px !important;
            min-height: 44px;
          }
          .am-signup {
            font-size: 12px !important;
            line-height: 1.4;
          }
        }
      `}</style>

      <div className="am-overlay" role="dialog" aria-modal="true" aria-label="Sign in to your account" onClick={() => { if (!justOpenedRef.current) closeAuthModal(); }}>
        <div className="am-modal" ref={modalRef} onClick={(e) => e.stopPropagation()}>
          <button className="am-close" onClick={closeAuthModal} aria-label="Close login dialog">✕</button>
          {activeTab === 'register' ? (
            <div className="am-body">
              <div className="am-title">Create an Account</div>
              <div className="am-sub">For the full registration experience with address &amp; payment setup, use our registration page.</div>
              <Link href="/register" className="am-go-btn" style={{ display: 'flex', textDecoration: 'none', justifyContent: 'center', alignItems: 'center' }}>
                Go to Registration →
              </Link>
              <div className="am-signup">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#1a5c38',
                    fontWeight: 700,
                    cursor: 'pointer',
                    padding: 0,
                    fontFamily: 'inherit',
                    fontSize: 'inherit',
                  }}
                >
                  Sign in
                </button>
              </div>
            </div>
          ) : (
            <LoginForm
              onSuccess={closeAuthModal}
              onSwitchToRegister={() => setActiveTab('register')}
              pendingRedirect={pendingRedirect}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default memo(AuthModal);
