import { useState, FC } from "react";
import Link from 'next/link';
import { useCategories } from "../../hooks/useCategories";
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { useAuth } from "../../contexts/AuthContext";

interface MobileMenuProps {
    isToggled?: boolean;
    toggleClick?: () => void;
}

const MobileMenu: FC<MobileMenuProps> = ({ isToggled, toggleClick }) => {
    const menuRef = useFocusTrap(isToggled);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Use shared categories hook (has static fallback when API fails)
    const { categories, loading: categoriesLoading, error: categoriesError } = useCategories();
    const { isAuthenticated, logout, user } = useAuth();

    const handleToggleMenu = () => {
        setIsMenuOpen((prevIsMenuOpen) => !prevIsMenuOpen);
    };

    const handleNavigate = () => {
        toggleClick?.();
    };

    // Helper function to get category icon
    const getCategoryIcon = (categoryName: string) => {
        const name = (categoryName || '').toLowerCase();

        if (name.includes('milk') || name.includes('dairy') || name.includes('dairies')) {
            return '\u{1F95B}';
        } else if (name.includes('wine') || name.includes('drink') || name.includes('beverage')) {
            return '\u{1F377}';
        } else if (name.includes('cloth') || name.includes('beauty')) {
            return '\u{1F455}';
        } else if (name.includes('seafood') || name.includes('fish')) {
            return '\u{1F41F}';
        } else if (name.includes('pet') || name.includes('toy')) {
            return '\u{1F43E}';
        } else if (name.includes('fast food') || name.includes('snack')) {
            return '\u{1F354}';
        } else if (name.includes('baking') || name.includes('flour')) {
            return '\u{1F370}';
        } else if (name.includes('vegetable') || name.includes('veggie')) {
            return '\u{1F96C}';
        } else if (name.includes('fruit')) {
            return '\u{1F34E}';
        } else if (name.includes('bread') || name.includes('juice')) {
            return '\u{1F35E}';
        } else if (name.includes('meat')) {
            return '\u{1F969}';
        } else if (name.includes('homecare') || name.includes('household')) {
            return '\u{1F3E0}';
        } else if (name.includes('personal care') || name.includes('care')) {
            return '\u{1F9F4}';
        } else if (name.includes('cheese')) {
            return '\u{1F9C0}';
        } else if (name.includes('cream')) {
            return '\u{1F366}';
        } else if (name.includes('yogurt') || name.includes('yoghurt')) {
            return '\u{1F944}';
        } else {
            return '\u{1F4E6}';
        }
    };

    return (
        <>
            <div ref={menuRef} onKeyDown={(e) => { if (e.key === 'Escape') toggleClick?.(); }} className={isToggled ? "mobile-header-active mobile-header-wrapper-style sidebar-visible" : "mobile-header-active mobile-header-wrapper-style"}>
                <div className="mobile-header-wrapper-inner">
                    <div className="mobile-header-top">
                        <div className="mobile-header-logo">
                            <Link href="/">
                                <img src="/assets/imgs/theme/snappy-logo.png" alt="Snappy Fresh" />
                            </Link>
                        </div>
                        <div className="mobile-menu-close close-style-wrap close-style-position-inherit">
                            <button className="close-style search-close" onClick={toggleClick} aria-label="Close menu">
                                <i className="icon-top"></i>
                                <i className="icon-bottom"></i>
                            </button>
                        </div>
                    </div>
                    <div className="mobile-header-content-area">
                        <div className="mobile-menu-wrap mobile-header-border">
                            <div className="main-categori-wrap mobile-header-border">
                                <Link href="#" className="categori-button-active-2" onClick={(e) => { e.preventDefault(); handleToggleMenu(); }}>
                                    <span className="fi-rs-apps"></span> Browse Categories
                                </Link>
                                <div className={`categori-dropdown-wrap categori-dropdown-active-small ${isMenuOpen ? 'active' : ''}`}>
                                    <ul>
                                        {categories && categories.length > 0 ? (
                                            categories.map((cat: any) => (
                                                <li key={cat.ItmsGrpCod}>
                                                    <Link href={`/store?category=${cat.ItmsGrpCod}`} onClick={handleNavigate}>
                                                        <span style={{ fontSize: "18px", marginRight: "8px" }}>
                                                            {getCategoryIcon(cat.ItmsGrpNam || cat.GroupName || 'Category')}
                                                        </span>
                                                        {cat.ItmsGrpNam || cat.GroupName || 'Category'}
                                                    </Link>
                                                </li>
                                            ))
                                        ) : (
                                            <li style={{ padding: "12px", color: "#999" }}>
                                                {categoriesLoading ? 'Loading categories...' : (categoriesError ? 'Unable to load categories' : 'No categories available')}
                                            </li>
                                        )}
                                    </ul>
                                </div>
                            </div>

                            <nav>
                                <ul className="mobile-menu">
                                    <li>
                                        <Link href="/store" onClick={handleNavigate}>Shop</Link>
                                    </li>
                                    <li>
                                        <Link href="/brochure" onClick={handleNavigate}>Brochures</Link>
                                    </li>
                                    <li>
                                        <Link href="/wallet" onClick={handleNavigate}>Wallet</Link>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                        {isAuthenticated && !user?.customer?.isVisitor && (
                            <div className="mobile-header-info-wrap mobile-header-border">
                                <div className="single-mobile-header-info mt-30">
                                    <a href="#" onClick={(e) => { e.preventDefault(); toggleClick?.(); logout(); }} style={{ color: '#e74c3c' }}>
                                        <i className="fi-rs-sign-out" style={{ marginRight: '6px' }}></i>
                                        Logout
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default MobileMenu;
