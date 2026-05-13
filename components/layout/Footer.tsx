import { useState, ReactNode } from 'react';;
import { useRouter } from "next/router";
import Link from 'next/link';

const FooterAccordion = ({ title, children }: { title?: string; children?: ReactNode }) => {
    const [open, setOpen] = useState(false);
    return (
        <div className="sf-fcol">
            {/* Desktop: plain heading, Mobile: accordion toggle */}
            <div className="sf-fcol-title sf-fcol-title-desktop">{title}</div>
            <button
                className="sf-fcol-title sf-fcol-toggle"
                onClick={() => setOpen(!open)}
                aria-expanded={open}
            >
                {title}
                <svg
                    width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                    style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none', opacity: 0.5 }}
                >
                    <polyline points="6 9 12 15 18 9"/>
                </svg>
            </button>
            <div className={`sf-fcol-body${open ? ' sf-fcol-body--open' : ''}`}>
                {children}
            </div>
        </div>
    );
};

const Footer = () => {
    const router = useRouter();
    const isHome = router.pathname === "/" || router.pathname === "/index";

    return (
        <footer className="main" role="contentinfo">
            <style jsx global>{`
                /* ── Newsletter ── */
                .sf-newsletter { background: #f4f9f6; padding: 56px 0; }
                .sf-newsletter-inner { max-width: 600px; margin: 0 auto; text-align: center; }
                .sf-newsletter-inner h2 { font-size: 24px; font-weight: 900; color: #1a1a2e; margin-bottom: 12px; }
                .sf-newsletter-inner p { font-size: 14px; color: #595959; margin-bottom: 28px; }
                .sf-newsletter-btns { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
                .sf-newsletter-btn {
                    display: inline-flex; align-items: center; gap: 8px;
                    color: #fff; padding: 14px 28px; border-radius: 12px;
                    text-decoration: none; font-weight: 700; font-size: 14px;
                    transition: opacity 0.2s;
                }
                .sf-newsletter-btn:hover { opacity: 0.9; color: #fff; }

                /* ── Footer ── */
                .sf-footer { background: #111a14; color: #fff; }
                .sf-footer-grid {
                    display: grid;
                    grid-template-columns: 1.4fr 1fr 1.2fr 1.2fr;
                    gap: 48px;
                    padding: 60px 0 48px;
                }

                /* Brand */
                .sf-footer .sf-brand-title {
                    font-size: 15px; font-weight: 700; color: #fff; margin-bottom: 28px; line-height: 1.3;
                }
                .sf-footer-app-badges { display: flex; flex-direction: column; gap: 10px; max-width: 200px; }
                .sf-footer .sf-app-badge {
                    display: flex !important; align-items: center; gap: 10px;
                    background: rgba(255,255,255,0.08); padding: 10px 18px; border-radius: 10px;
                    text-decoration: none !important; transition: background 0.2s; color: #fff !important;
                }
                .sf-footer .sf-app-badge:hover { background: rgba(255,255,255,0.14); }
                .sf-footer .sf-app-badge-sub { font-size: 10px; color: rgba(255,255,255,0.5); display: block; }
                .sf-footer .sf-app-badge-name { font-size: 15px; font-weight: 700; color: #fff; display: block; }

                /* Column titles */
                .sf-footer .sf-fcol-title {
                    font-size: 15px !important; font-weight: 700 !important; color: #fff !important;
                    margin-bottom: 20px !important; padding: 0 !important; line-height: 1.3 !important;
                }
                /* Desktop: show plain title, hide toggle button */
                .sf-fcol-toggle { display: none; }
                .sf-fcol-title-desktop { display: block; }
                .sf-fcol-body { display: block; }

                /* Links */
                .sf-footer .sf-fcol a, .sf-footer .sf-fcol-link {
                    display: block !important; color: rgba(255,255,255,0.55) !important;
                    font-size: 14px !important; text-decoration: none !important;
                    margin-bottom: 12px !important; padding: 0 !important;
                    transition: color 0.2s !important; line-height: 1.5 !important;
                    background: none !important; border: none !important;
                }
                .sf-footer .sf-fcol a:hover, .sf-footer .sf-fcol-link:hover { color: #00d26a !important; }
                .sf-footer .sf-fcol .sf-fcol-bold { font-weight: 700 !important; color: rgba(255,255,255,0.8) !important; }

                /* Socials */
                .sf-footer-brand-block { margin-bottom: 16px; }
                .sf-footer-brand-block img { height: 36px; filter: brightness(0) invert(1); }
                .sf-footer .sf-socials-row { display: flex; gap: 10px; margin-top: 12px; }
                .sf-footer .sf-social-icon {
                    width: 38px; height: 38px; border-radius: 50%;
                    background: rgba(255,255,255,0.1); display: flex !important;
                    align-items: center; justify-content: center;
                    color: rgba(255,255,255,0.7) !important; text-decoration: none !important;
                    transition: all 0.2s; margin-bottom: 0 !important;
                }
                .sf-footer .sf-social-icon:hover { background: rgba(255,255,255,0.2) !important; color: #fff !important; }

                /* Divider + Bottom */
                .sf-footer-divider { border: none; border-top: 1px solid rgba(255,255,255,0.08); margin: 0; }
                .sf-footer-bottom { padding: 20px 0; }
                .sf-footer-bottom-inner {
                    display: flex; flex-wrap: wrap; align-items: center;
                    justify-content: space-between; gap: 16px;
                }
                .sf-footer-bottom .sf-accepted-label { font-size: 12px; color: rgba(255,255,255,0.65); margin-right: 12px; }
                .sf-footer-bottom .sf-pay-methods { display: flex; align-items: center; gap: 8px; }
                .sf-footer-bottom .sf-pay-icon {
                    background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 4px; padding: 4px 10px; font-size: 11px;
                    font-weight: 700; color: rgba(255,255,255,0.5);
                }
                .sf-footer-copy { font-size: 13px; color: rgba(255,255,255,0.65); margin: 0; }
                .sf-footer-copy strong { color: rgba(255,255,255,0.6); }

                /* ── Tablet ── */
                @media(max-width: 991px) {
                    .sf-footer-grid { grid-template-columns: 1fr 1fr; gap: 36px; }
                }

                /* ── Mobile ── */
                @media(max-width: 575px) {
                    .sf-footer-grid {
                        grid-template-columns: 1fr;
                        gap: 0;
                        padding: 28px 0 16px;
                    }
                    /* App badges row */
                    .sf-footer .sf-brand-title { font-size: 14px; margin-bottom: 16px; }
                    .sf-footer-app-badges { flex-direction: row; max-width: 100%; }
                    .sf-footer .sf-app-badge { flex: 1; padding: 8px 12px; }
                    .sf-footer .sf-app-badge-name { font-size: 13px; }
                    .sf-footer-brand-col { margin-bottom: 8px; }

                    /* Mobile: hide desktop title, show accordion toggle */
                    .sf-fcol-title-desktop { display: none !important; }
                    .sf-fcol-toggle {
                        display: flex !important;
                        width: 100%;
                        justify-content: space-between;
                        align-items: center;
                        background: none !important;
                        border: none !important;
                        border-top: 1px solid rgba(255,255,255,0.08) !important;
                        cursor: pointer;
                        padding: 16px 0 !important;
                        margin-bottom: 0 !important;
                    }
                    .sf-fcol-body { display: none; padding-bottom: 8px; }
                    .sf-fcol-body--open { display: block; }
                    .sf-footer .sf-fcol a, .sf-footer .sf-fcol-link {
                        font-size: 13px !important; margin-bottom: 8px !important;
                    }

                    /* Socials compact */
                    .sf-footer > .container > .sf-footer-grid > div:last-child {
                        border-top: 1px solid rgba(255,255,255,0.08);
                        padding-top: 16px;
                        margin-top: 0;
                    }
                    .sf-footer .sf-social-icon { width: 40px; height: 40px; }

                    /* Bottom bar */
                    .sf-footer-bottom { padding: 16px 0; }
                    .sf-footer-bottom-inner {
                        justify-content: center; text-align: center;
                        flex-direction: column; gap: 10px;
                    }
                    .sf-footer-bottom .sf-pay-methods { flex-wrap: wrap; justify-content: center; }
                    .sf-footer-bottom .sf-accepted-label { width: 100%; text-align: center; }

                    /* Newsletter compact */
                    .sf-newsletter { padding: 32px 0; }
                    .sf-newsletter-inner h2 { font-size: 20px; }
                    .sf-newsletter-inner p { font-size: 13px; margin-bottom: 16px; }
                    .sf-newsletter-btn { padding: 12px 20px; font-size: 13px; width: 100%; justify-content: center; }
                }
            `}</style>

            {/* Newsletter - Home only */}
            {isHome && (
                <section className="sf-newsletter">
                    <div className="container">
                        <div className="sf-newsletter-inner">
                            <h2>Stay Updated with Daily Deals</h2>
                            <p>Flash Sales, Delivery Alerts & Exclusive Offers</p>
                            <div className="sf-newsletter-btns">
                                <a href="https://www.whatsapp.com/channel/0029VbCEhAGKgsNwvW9Cnd1L" target="_blank" rel="noopener noreferrer"
                                    className="sf-newsletter-btn" style={{ background: '#25D366' }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/></svg>
                                    WhatsApp Channel
                                </a>
                                <a href="https://www.facebook.com/share/159tf7Ks2z/" target="_blank" rel="noopener noreferrer"
                                    className="sf-newsletter-btn" style={{ background: '#1877F2' }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/></svg>
                                    Facebook
                                </a>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            <div className="sf-footer">
                <div className="container">
                    <div className="sf-footer-grid">

                        {/* Col 1: Brand + App */}
                        <div className="sf-footer-brand-col">
                            <div className="sf-brand-title">Download the Snappy Fresh app</div>
                            <div className="sf-footer-app-badges">
                                <a href="https://onelink.to/h5yfk5" target="_blank" rel="noopener noreferrer" className="sf-app-badge">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                                    <div><span className="sf-app-badge-sub">Download on the</span><span className="sf-app-badge-name">App Store</span></div>
                                </a>
                                <a href="https://onelink.to/h5yfk5" target="_blank" rel="noopener noreferrer" className="sf-app-badge">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}><path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 0 1 0 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.8 9.99l-2.302 2.302-8.634-8.634z"/></svg>
                                    <div><span className="sf-app-badge-sub">Get it on</span><span className="sf-app-badge-name">Google Play</span></div>
                                </a>
                            </div>
                        </div>

                        {/* Col 2: Company — accordion on mobile */}
                        <FooterAccordion title="Company">
                            <Link href="/about-us" className="sf-fcol-link">About Us</Link>
                            <Link href="/supplier-register" className="sf-fcol-link">Become a Supplier</Link>
                            <Link href="/vendor/login?redirect=%2Fvendor" className="sf-fcol-link">Vendor Login</Link>
                            <Link href="/terms" className="sf-fcol-link">Terms & Conditions</Link>
                            <Link href="/privacy-policy" className="sf-fcol-link">Privacy Policy</Link>
                        </FooterAccordion>

                        {/* Col 3: Support — accordion on mobile */}
                        <FooterAccordion title="Customer Support">
                            <Link href="/faq" className="sf-fcol-link">Help Centre</Link>
                            <Link href="/check-order" className="sf-fcol-link">Track Your Order</Link>
                            <Link href="/contact-us" className="sf-fcol-link">Contact Us</Link>
                            <a href="tel:+263782978460" className="sf-fcol-link">
                                <span className="sf-fcol-bold">+263 782 978 460</span>
                            </a>
                            <a href="mailto:support@snappyfresh.net" className="sf-fcol-link">support@snappyfresh.net</a>
                        </FooterAccordion>

                        {/* Col 4: Socials */}
                        <div>
                            <div className="sf-footer-brand-block">
                                <Link href="/"><img src="/assets/imgs/theme/snappy-logo.png" alt="Snappy Fresh" /></Link>
                            </div>
                            <div className="sf-socials-row">
                                <a href="https://www.facebook.com/share/159tf7Ks2z/" target="_blank" rel="noopener noreferrer" className="sf-social-icon" aria-label="Facebook">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/></svg>
                                </a>
                                <a href="https://x.com/snappyfreshzw" target="_blank" rel="noopener noreferrer" className="sf-social-icon" aria-label="X">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                                </a>
                                <a href="https://www.instagram.com/snappyfreshzw" target="_blank" rel="noopener noreferrer" className="sf-social-icon" aria-label="Instagram">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                                </a>
                                <a href="https://www.whatsapp.com/channel/0029VbCEhAGKgsNwvW9Cnd1L" target="_blank" rel="noopener noreferrer" className="sf-social-icon" aria-label="WhatsApp">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/></svg>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                <hr className="sf-footer-divider" />

                <div className="sf-footer-bottom">
                    <div className="container">
                        <div className="sf-footer-bottom-inner">
                            <div className="sf-pay-methods">
                                <span className="sf-accepted-label">Accepted</span>
                                <span className="sf-pay-icon">VISA</span>
                                <span className="sf-pay-icon">Mastercard</span>
                                <span className="sf-pay-icon">EcoCash</span>
                                <span className="sf-pay-icon">PayNow</span>
                            </div>
                            <p className="sf-footer-copy">
                                &copy; 2026 <strong>SnappyFresh</strong>. All rights reserved.
                                <span style={{ display: 'block', marginTop: 4, fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>
                                    Developed & maintained by <a href="https://onadiamonds.com" target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>Onadiamonds</a>
                                </span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
