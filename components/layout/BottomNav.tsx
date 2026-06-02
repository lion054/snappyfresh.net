import { useRouter } from "next/router";
import Link from 'next/link';
import { useCart } from "../../hooks";
import { useAuth } from "../../contexts/AuthContext";

const BottomNav = () => {
    const router = useRouter();
    const { cartItemCount } = useCart();
    const { isAuthenticated, user } = useAuth();
    const path = router.pathname;
    const isActive = (href: string) => {
        if (href === '/') return path === '/';
        return path.startsWith(href);
    };

    return (
        <nav className="bottom-nav">
            <Link href="/" className={`bottom-nav-item ${isActive('/') ? 'active' : ''}`} aria-label="Home">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
                <span>Home</span>
            </Link>

            <Link href="/store" className={`bottom-nav-item ${isActive('/store') ? 'active' : ''}`} aria-label="Shop">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                    <line x1="8" y1="21" x2="16" y2="21" />
                    <line x1="12" y1="17" x2="12" y2="21" />
                </svg>
                <span>Shop</span>
            </Link>

            <Link href="/cart" className={`bottom-nav-item bottom-nav-cart ${isActive('/cart') ? 'active' : ''}`} aria-label={`Cart${cartItemCount > 0 ? ` (${cartItemCount} items)` : ''}`} aria-current={isActive('/cart') ? 'page' : undefined}>
                <div className="bottom-nav-cart-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="9" cy="21" r="1" />
                        <circle cx="20" cy="21" r="1" />
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                    </svg>
                    {cartItemCount > 0 && (
                        <span className="bottom-nav-badge">{cartItemCount > 99 ? '99+' : cartItemCount}</span>
                    )}
                </div>
                <span>Cart</span>
            </Link>

            <Link href={isAuthenticated ? "/profile/invoice" : "/check-order"} className={`bottom-nav-item ${isActive(isAuthenticated ? '/profile/invoice' : '/check-order') ? 'active' : ''}`} aria-label="Orders" aria-current={isActive(isAuthenticated ? '/profile/invoice' : '/check-order') ? 'page' : undefined}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="16" y1="21" x2="16" y2="3" />
                    <line x1="8" y1="21" x2="8" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="11" />
                    <path d="M4 15h16v-3a6 6 0 0 0-6-6h-4a6 6 0 0 0-6 6z" />
                </svg>
                <span>Orders</span>
            </Link>

            <Link href={isAuthenticated ? "/profile" : "/login"} className={`bottom-nav-item ${isActive('/profile') || isActive('/login') ? 'active' : ''}`} aria-label="Account" aria-current={(isActive('/profile') || isActive('/login')) ? 'page' : undefined}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                </svg>
                <span>Account</span>
            </Link>
        </nav>
    );
};

export default BottomNav;
