import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from "next/router";
import useClickOutside from "../../util/outsideClick";
import Search from "../ecommerce/Search";
import AddressPicker from "../elements/AddressPicker";
import ProfileSwitcher from "../ProfileSwitcher";
import { useCart, useCartDrawer } from "../../hooks";
import { useAuth } from "../../contexts/AuthContext";
import { useLocation } from "../../contexts/LocationContext";
import { useCategories } from "../../hooks/useCategories";
import { getIcon, getBgColor } from "../../services/CategoryIconsService";
import { useScheduledOrdersAccess } from "../../hooks/useScheduledOrdersAccess";
import ScheduledOrdersAccessModal from "../modals/ScheduledOrdersAccessModal";
import { useAuthModal } from "../../contexts/AuthModalContext";

const Header = ({ toggleClick }: { toggleClick?: () => void }) => {
    const { cartItemCount } = useCart();
    const { toggleCartDrawer } = useCartDrawer();
    const { user, isAuthenticated, logout, businessPartners } = useAuth();
    const { selectedAddress } = useLocation();
    const { isApproved, isChecking, showAccessModal, closeAccessModal, error, retryAccessCheck } = useScheduledOrdersAccess();
    const { openAuthModal } = useAuthModal();

    const isB2B = isAuthenticated && !user?.customer?.isVisitor;
    const [mounted, setMounted] = useState(false);
    const [showOtherServices, setShowOtherServices] = useState(false);
    const [showCategories, setShowCategories] = useState(false);
    const [showAccountMenu, setShowAccountMenu] = useState(false);
    const [showB2BMenu, setShowB2BMenu] = useState(false);
    const [showMobileSwitcher, setShowMobileSwitcher] = useState(false);
    const [selectedDelivery, setSelectedDelivery] = useState(
        user?.customer?.isInstantDelivery === false ? "scheduled" : "instant"
    );
    const [isHeaderSticky, setIsHeaderSticky] = useState(false);
    const router = useRouter();

    const { categories, loading: categoriesLoading } = useCategories();

    const accountMenuRef = useClickOutside(() => setShowAccountMenu(false)) as any;
    const categoriesMenuRef = useClickOutside(() => setShowCategories(false)) as any;
    const otherServicesRef = useClickOutside(() => setShowOtherServices(false)) as any;
    const b2bMenuRef = useClickOutside(() => setShowB2BMenu(false)) as any;
    const mobileSwitcherRef = useClickOutside(() => setShowMobileSwitcher(false)) as any;

    useEffect(() => {
        setMounted(true);
        if (typeof window === 'undefined') return;
        const handleScroll = () => {
            const scrollCheck = window.scrollY >= 50;
            setIsHeaderSticky(scrollCheck);
        };
        handleScroll();
        document.addEventListener("scroll", handleScroll);
        return () => document.removeEventListener("scroll", handleScroll);
    }, []);

    const handleToggle = () => toggleClick?.();

    useEffect(() => {
        const closeAllMenus = () => {
            setShowAccountMenu(false);
            setShowCategories(false);
            setShowOtherServices(false);
            setShowB2BMenu(false);
            setShowMobileSwitcher(false);
        };
        const handleRouteChange = () => closeAllMenus();
        const handleKeyDown = (event: any) => { if (event.key === "Escape") closeAllMenus(); };
        router.events.on("routeChangeStart", handleRouteChange);
        window.addEventListener("keydown", handleKeyDown as EventListener);
        return () => {
            router.events.off("routeChangeStart", handleRouteChange);
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [router.events]);

    const getCategoryIcon = (categoryName: string) => getIcon(categoryName);

    const userInitials = (() => {
        const name = user?.customer?.cardName || user?.userName || '';
        const parts = name.split(' ').filter(Boolean);
        if (parts.length >= 2 && parts[0]?.[0] && parts[1]?.[0]) return (parts[0][0] + parts[1][0]).toUpperCase();
        return name.slice(0, 2).toUpperCase() || 'SF';
    })();

    return (
        <>
            <ScheduledOrdersAccessModal isOpen={showAccessModal} onClose={closeAccessModal} error={error} onRetry={retryAccessCheck} />

            <header
                className="header-area"
                style={{
                    position: "sticky",
                    top: 0, left: 0, width: "100%",
                    zIndex: 100,
                    boxShadow: "0 2px 16px rgba(0,0,0,.18)"
                }}
            >
                {/* ══ DARK TOP BAR (desktop) ══ */}
                <div className={`sf-topbar d-none d-lg-block ${isHeaderSticky ? 'compact' : ''}`}>
                    <div className="container">
                        <div className="sf-topbar-inner">
                            {/* Logo */}
                            <Link href="/" className="sf-topbar-logo" style={{ textDecoration: 'none', flexShrink: 0 }}>
                                <img src="/assets/imgs/theme/snappy-logo.png" alt="Snappy Fresh" />
                            </Link>

                            {/* Address */}
                            <div className="sf-topbar-address">
                                <AddressPicker />
                            </div>

                            {/* Search */}
                            <div className="sf-topbar-search">
                                <Search />
                            </div>

                            {/* Actions */}
                            <div className="sf-topbar-actions">
                                {/* Account */}
                                <div style={{ position: "relative" }} ref={accountMenuRef}>
                                    <button className="sf-account-btn" onClick={() => setShowAccountMenu(!showAccountMenu)} aria-expanded={showAccountMenu} aria-haspopup="menu" aria-label="Account menu">
                                        <div className="sf-avatar">{userInitials}</div>
                                        <div className="sf-account-info">
                                            <span className="sf-account-greeting">
                                                {isAuthenticated && !user?.customer?.isVisitor ? `Hi ${(user?.customer?.cardName || '').split(' ')[0]}` : 'Good Day'}
                                            </span>
                                            <span className="sf-account-name">
                                                {isAuthenticated && !user?.customer?.isVisitor ? 'My Profile' : 'Sign In/Sign Up'}
                                                <i className="fi-rs-angle-small-down" style={{ fontSize: 10 }}></i>
                                            </span>
                                        </div>
                                    </button>

                                    {showAccountMenu && (
                                        <div className="sf-dropdown">
                                            {(isAuthenticated && user?.customer && !user?.customer?.isVisitor) ? (
                                                <>
                                                    <div className="sf-dropdown-header">
                                                        <div className="sf-dropdown-header-label">Signed in as</div>
                                                        <div className="sf-dropdown-header-name">
                                                            {user?.customer?.cardName || user?.userName}
                                                        </div>
                                                    </div>
                                                    <ProfileSwitcher onSwitchSuccess={() => setShowAccountMenu(false)} />
                                                    <ul>
                                                        <li className="sf-dropdown-item"><Link href="/profile" onClick={() => setShowAccountMenu(false)}><i className="fi-rs-home"></i> My Shop</Link></li>
                                                        <li className="sf-dropdown-item"><Link href="/profile-settings" onClick={() => setShowAccountMenu(false)}><i className="fi-rs-settings"></i> Settings</Link></li>
                                                        <li className="sf-dropdown-item"><Link href="/wallet" onClick={() => setShowAccountMenu(false)}><i className="fi-rs-money"></i> Wallet</Link></li>
                                                        <div className="sf-dropdown-divider" />
                                                        <li className="sf-dropdown-item"><Link href="/profile/invoice" onClick={() => setShowAccountMenu(false)}><i className="fi-rs-document"></i> Invoices</Link></li>
                                                        <li className="sf-dropdown-item"><Link href="/profile/payments" onClick={() => setShowAccountMenu(false)}><i className="fi-rs-credit-card"></i> Payments</Link></li>
                                                        <li className="sf-dropdown-item"><Link href="/profile/statements" onClick={() => setShowAccountMenu(false)}><i className="fi-rs-stats"></i> Statements</Link></li>
                                                        <li className="sf-dropdown-item"><Link href="/vendor" onClick={() => setShowAccountMenu(false)}><i className="fi-rs-shop"></i> Vendor Portal</Link></li>
                                                        <div className="sf-dropdown-divider" />
                                                        <li className="sf-dropdown-item logout">
                                                            <button onClick={() => { logout(); setShowAccountMenu(false); }}>
                                                                <i className="fi-rs-sign-out"></i> Logout
                                                            </button>
                                                        </li>
                                                    </ul>
                                                </>
                                            ) : (
                                                <ul className="sf-dropdown-guest" style={{ padding: "6px 0" }}>
                                                    <li><button className="sf-dropdown-item" onClick={() => { setShowAccountMenu(false); openAuthModal('login'); }} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 18px', fontSize: '13.5px', color: '#374151', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}><i className="fi-rs-sign-in" style={{ fontSize: 15, width: 20, textAlign: 'center', opacity: 0.6 }}></i> Sign In</button></li>
                                                    <li><button className="sf-dropdown-item" onClick={() => { setShowAccountMenu(false); openAuthModal('register'); }} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 18px', fontSize: '13.5px', color: '#374151', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}><i className="fi-rs-user-add" style={{ fontSize: 15, width: 20, textAlign: 'center', opacity: 0.6 }}></i> Sign Up</button></li>
                                                </ul>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Cart */}
                                <button className="sf-cart-btn" onClick={() => {
                                    if (selectedDelivery === 'scheduled') {
                                        router.push('/scheduled-orders');
                                    } else {
                                        toggleCartDrawer();
                                    }
                                }} aria-label={selectedDelivery === 'scheduled' ? 'Scheduled orders' : `Shopping cart${cartItemCount > 0 ? `, ${cartItemCount} items` : ''}`}>
                                    <i className={selectedDelivery === 'scheduled' ? 'fi-rs-calendar sf-cart-icon' : 'fi-rs-shopping-cart sf-cart-icon'} />
                                    <span className="sf-cart-price">{selectedDelivery === 'scheduled' ? 'Orders' : (mounted ? (cartItemCount > 0 ? 'Cart' : '$0.00') : '$0.00')}</span>
                                    {selectedDelivery !== 'scheduled' && mounted && cartItemCount > 0 && (
                                        <span className="sf-cart-badge">{cartItemCount}</span>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ══ SECONDARY NAV BAR (desktop) ══ */}
                <nav className="sf-subnav d-none d-lg-block" aria-label="Main navigation">
                    <div className="container">
                        <div className="sf-subnav-inner">
                            <div className="sf-subnav-left">
                                {/* Shop By Categories */}
                                <div style={{ position: "relative" }} ref={categoriesMenuRef}>
                                    <button className="sf-subnav-btn" onClick={() => setShowCategories(!showCategories)} aria-expanded={showCategories} aria-haspopup="menu" aria-label="Shop by categories">
                                        <i className="fi-rs-apps"></i>
                                        <span>Shop By Categories</span>
                                    </button>

                                    {showCategories && (
                                        <div className="sf-dropdown left" style={{ top: 'calc(100% + 4px)' }}>
                                            {categoriesLoading ? (
                                                <div style={{ padding: 20, textAlign: 'center' }}>
                                                    <div className="spinner-border spinner-border-sm text-success" role="status"><span className="visually-hidden">Loading...</span></div>
                                                </div>
                                            ) : (
                                                <div className="sf-categories-grid">
                                                    {categories && categories.length > 0 ? categories.map((cat: any, index: number) => {
                                                        const categoryName = cat.ItmsGrpNam || cat.GroupName || 'Category';
                                                        const categoryCode = cat.ItmsGrpCod;
                                                        return (
                                                            <Link key={categoryCode || index} href={`/store?category=${categoryCode}`} className="sf-cat-item" onClick={() => setShowCategories(false)}>
                                                                <div className="sf-cat-icon" style={{ background: getBgColor(categoryName) }}>
                                                                    {getCategoryIcon(categoryName)}
                                                                </div>
                                                                <span>{categoryName}</span>
                                                            </Link>
                                                        );
                                                    }) : (
                                                        <div style={{ padding: 12, color: '#999', fontSize: 13, gridColumn: '1 / -1', textAlign: 'center' }}>No categories</div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Delivery badges */}
                                <button
                                    className={`sf-delivery-badge ${selectedDelivery === 'instant' ? 'active' : ''}`}
                                    onClick={() => { setSelectedDelivery("instant"); router.push("/store"); }}
                                >
                                    <i className="fi-rs-time-fast"></i> Instant
                                </button>
                            </div>

                            <div className="sf-subnav-right">
                                <Link href="/profile" className="sf-subnav-btn"><i className="fi-rs-shop"></i> My Shop</Link>
                                <Link href="/brochure" className="sf-subnav-btn"><i className="fi-rs-document"></i> Brochures</Link>

                                {isAuthenticated && !user?.customer?.isVisitor && user?.customer?.isInstantDelivery === false && (
                                    <button className="sf-subnav-btn" onClick={() => router.push('/scheduled-orders')} style={{ color: '#ff9800' }}>
                                        <i className="fi-rs-calendar" style={{ color: '#ff9800' }}></i> Scheduled
                                        {isApproved && <span style={{ fontSize: '10px', marginLeft: '4px' }}>●</span>}
                                    </button>
                                )}

                                <button className="sf-subnav-btn" onClick={() => setShowOtherServices(!showOtherServices)} aria-expanded={showOtherServices} aria-haspopup="menu" aria-label="Other services">
                                    <i className="fi-rs-apps-sort"></i> Other Services
                                </button>
                            </div>
                        </div>
                    </div>
                </nav>

                {/* ══ MOBILE BAR ══ */}
                <div className="sf-mobile-bar d-lg-none">
                    <button className="sf-hamburger" onClick={handleToggle} aria-label="Open menu">
                        <span></span><span></span><span></span>
                    </button>
                    <Link href="/" style={{ textDecoration: 'none' }}>
                        <img src="/assets/imgs/theme/snappy-logo.png" alt="Snappy Fresh" style={{ maxHeight: 36, width: 'auto', filter: 'brightness(0) invert(1)' }} />
                    </Link>
                    <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                        {/* Mobile Account Switcher */}
                        {isAuthenticated && !user?.customer?.isVisitor && businessPartners?.length > 1 && (
                            <div style={{ position: 'relative' }} ref={mobileSwitcherRef}>
                                <button
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#fff', display: 'flex', alignItems: 'center', fontSize: 20 }}
                                    onClick={() => setShowMobileSwitcher(!showMobileSwitcher)}
                                    aria-label="Switch account"
                                >
                                    <i className="fi-rs-shuffle"></i>
                                </button>
                                {showMobileSwitcher && (
                                    <div style={{ position: 'absolute', right: 0, top: '100%', width: 240, background: '#fff', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.15)', zIndex: 9999, overflow: 'hidden', marginTop: 8 }}>
                                        <ProfileSwitcher onSwitchSuccess={() => setShowMobileSwitcher(false)} />
                                    </div>
                                )}
                            </div>
                        )}
                        <div style={{ position: 'relative', cursor: 'pointer' }} onClick={toggleCartDrawer}>
                            <i className="fi-rs-shopping-cart" style={{ fontSize: 20, color: '#fff' }}></i>
                            {cartItemCount > 0 && (
                                <span style={{
                                    position: 'absolute', top: -6, right: -8,
                                    background: '#1a5c38', color: '#fff', borderRadius: '50%',
                                    width: 16, height: 16, display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', fontSize: 10, fontWeight: 700
                                }}>{cartItemCount}</span>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* ══ ALERT BANNER ══ */}
            {!selectedAddress && (!isAuthenticated || user?.customer?.isVisitor || !user?.customer?.addresses) && (
                <div style={{
                    background: '#fff3cd',
                    borderBottom: '1.5px solid #ffe08a',
                    padding: '9px 24px',
                    textAlign: 'center' as const,
                    fontSize: '13px',
                    color: '#7a5800'
                }}>
                    <Link href="/profile" style={{ color: '#1a5c38', fontWeight: 700, textDecoration: 'none' }}>Enter your address</Link>
                    {' '}for your relevant offers &amp; availability
                </div>
            )}

            {/* ══ B2B SIDEBAR ══ */}
            {showB2BMenu && isB2B && isApproved && mounted && (
                <>
                    <div className="sf-sidebar" ref={b2bMenuRef}>
                        <div className="sf-sidebar-header">
                            <h3 className="sf-sidebar-title">MENU</h3>
                            <button className="sf-sidebar-close" onClick={() => setShowB2BMenu(false)}>×</button>
                        </div>
                        <div className="sf-sidebar-section-label">Quick Actions</div>
                        {[
                            { icon: "fi-rs-phone", label: "Support", color: "#2196F3", link: "/support" }
                        ].map((action, idx) => (
                            <Link key={idx} href={action.link} className="sf-sidebar-link">
                                <div className="sf-sidebar-link-left">
                                    <div className="sf-sidebar-link-icon" style={{ background: action.color }}><i className={action.icon}></i></div>
                                    <span style={{ fontWeight: 500, fontSize: 15 }}>{action.label}</span>
                                </div>
                                <i className="fi-rs-angle-right" style={{ color: '#999', fontSize: 12 }}></i>
                            </Link>
                        ))}
                    </div>
                    <div className="sf-sidebar-overlay" onClick={() => setShowB2BMenu(false)}></div>
                </>
            )}

            {/* ══ OTHER SERVICES SIDEBAR ══ */}
            {showOtherServices && mounted && (
                <>
                    <div className="sf-sidebar" ref={otherServicesRef}>
                        <div className="sf-sidebar-header">
                            <h3 className="sf-sidebar-title">OTHER SERVICES</h3>
                            <button className="sf-sidebar-close" onClick={() => setShowOtherServices(false)}>×</button>
                        </div>
                        <div className="sf-sidebar-section-label">Services</div>
                        {[
                            { icon: "fi-rs-mobile", label: "Airtime & Data", color: "#1a5c38" },
                            { icon: "fi-rs-bulb", label: "Electricity", color: "#f39c12" },
                            { icon: "fi-rs-bus", label: "Bus Tickets", color: "#3498db" },
                            { icon: "fi-rs-plane", label: "Flights", color: "#e74c3c" },
                            { icon: "fi-rs-suitcase-alt", label: "Travel Packages", color: "#9c27b0" },
                            { icon: "fi-rs-gift", label: "Gift Cards", color: "#27ae60" }
                        ].map((svc, idx) => (
                            <a key={idx} href="#" className="sf-sidebar-link" onClick={(e) => e.preventDefault()} style={{ opacity: 0.6, cursor: 'default' }}>
                                <div className="sf-sidebar-link-left">
                                    <div className="sf-sidebar-link-icon" style={{ background: svc.color }}><i className={svc.icon}></i></div>
                                    <span style={{ fontWeight: 500, fontSize: 15 }}>{svc.label}</span>
                                </div>
                                <span style={{ fontSize: 10, fontWeight: 700, color: '#f39c12', background: '#fffbf0', border: '1px solid #f39c12', borderRadius: 4, padding: '2px 8px', textTransform: 'uppercase' }}>Coming Soon</span>
                            </a>
                        ))}

                        <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '20px 0' }} />
                        <div className="sf-sidebar-section-label">More</div>
                        {[
                            ...(isAuthenticated && !user?.customer?.isVisitor ? [] : [{ icon: "fi-rs-sign-in", label: "Sign In/Sign Up", color: "#1a5c38", link: "__auth__" }]),
                            { icon: "fi-rs-marker", label: "Find A Product", color: "#8BC34A", link: "/store" },
                            { icon: "fi-rs-document", label: "Brochures", color: "#2196F3", link: "/brochure" },
                            { icon: "fi-rs-life-ring", label: "Help Centre", color: "#9c27b0", link: "/faq" },
                            { icon: "fi-rs-document-signed", label: "Terms & Conditions", color: "#1a5c38", link: "/terms" },
                            { icon: "fi-rs-shield", label: "Privacy Policy", color: "#607d8b", link: "/privacy-policy" },
                        ].map((svc, idx) => (
                            svc.link === '__auth__' ? (
                                <button key={idx} className="sf-sidebar-link" onClick={() => { setShowOtherServices(false); openAuthModal('login'); }} style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                                    <div className="sf-sidebar-link-left">
                                        <div className="sf-sidebar-link-icon" style={{ background: svc.color }}><i className={svc.icon}></i></div>
                                        <span style={{ fontWeight: 500, fontSize: 15 }}>{svc.label}</span>
                                    </div>
                                    <i className="fi-rs-angle-right" style={{ color: '#999', fontSize: 12 }}></i>
                                </button>
                            ) : (
                                <Link key={idx} href={svc.link} className="sf-sidebar-link">
                                    <div className="sf-sidebar-link-left">
                                        <div className="sf-sidebar-link-icon" style={{ background: svc.color }}><i className={svc.icon}></i></div>
                                        <span style={{ fontWeight: 500, fontSize: 15 }}>{svc.label}</span>
                                    </div>
                                    <i className="fi-rs-angle-right" style={{ color: '#999', fontSize: 12 }}></i>
                                </Link>
                            )
                        ))}
                    </div>
                    <div className="sf-sidebar-overlay" onClick={() => setShowOtherServices(false)}></div>
                </>
            )}
        </>
    );
};

export default Header;
