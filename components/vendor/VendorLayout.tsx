import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { useVendorAuth } from './VendorAuthContext';

const NAV_ITEMS = [
  { section: 'MAIN' },
  { icon: 'fi-rs-apps', label: 'Dashboard', href: '/vendor' },
  { icon: 'fi-rs-shopping-bag', label: 'Orders', href: '/vendor/orders', badge: '3' },
  { icon: 'fi-rs-box', label: 'Products', href: '/vendor/products' },
  { icon: 'fi-rs-database', label: 'Inventory', href: '/vendor/inventory' },
  { section: 'BUSINESS' },
  { icon: 'fi-rs-dollar', label: 'Pricing', href: '/vendor/pricing' },
  { icon: 'fi-rs-wallet', label: 'Payouts', href: '/vendor/payouts' },
  { icon: 'fi-rs-chart-line-up', label: 'Analytics', href: '/vendor/analytics' },
  { section: 'ACCOUNT' },
  { icon: 'fi-rs-settings', label: 'Settings', href: '/vendor/settings' },
];

export default function VendorLayout({ children, title, subtitle, actions }: any) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { vendor, logout } = useVendorAuth();
  const router = useRouter();

  const vendorName = vendor?.name || 'Vendor';
  const vendorInitials = vendor?.initials || 'V';

  const isActive = (href: string) => {
    if (href === '/vendor') return router.pathname === '/vendor';
    return router.pathname.startsWith(href);
  };

  const handleLogout = () => {
    logout();
    router.push('/vendor/login');
  };

  return (
    <>
      <Head>
        <title>{title ? `${title} - Vendor Portal` : 'Vendor Portal'} | Snappy Fresh</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="icon" href="/favicon.ico" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="stylesheet" href="/assets/css/vendor-portal.css" />
      </Head>

      <div className="vp-app">
        {/* Sidebar Overlay (mobile) */}
        <div
          className={`vp-sidebar-overlay ${sidebarOpen ? 'active' : ''}`}
          onClick={() => setSidebarOpen(false)}
        />

        {/* Sidebar */}
        <aside className={`vp-sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="vp-sidebar-brand">
            <div className="vp-sidebar-logo">SF</div>
            <div>
              <div className="vp-sidebar-brand-text">Snappy<span>Fresh</span></div>
              <div className="vp-sidebar-brand-sub">Vendor Portal</div>
            </div>
          </div>

          <nav className="vp-sidebar-nav">
            {NAV_ITEMS.map((item, i) => {
              if (item.section) {
                return <div key={i} className="vp-sidebar-section">{item.section}</div>;
              }
              return (
                <Link
                  key={i}
                  href={item.href || '/'}
                  className={`vp-sidebar-link ${isActive(item.href || '') ? 'active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <i className={item.icon}></i>
                  {item.label}
                  {item.badge && <span className="vp-sidebar-badge">{item.badge}</span>}
                </Link>
              );
            })}
          </nav>

          <div className="vp-sidebar-footer">
            <div className="vp-sidebar-user" onClick={handleLogout} title="Sign out">
              <div className="vp-sidebar-avatar">{vendorInitials}</div>
              <div className="vp-sidebar-user-info">
                <div className="vp-sidebar-user-name">{vendorName}</div>
                <div className="vp-sidebar-user-role">Vendor Account</div>
              </div>
              <i className="fi-rs-sign-out" style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14 }}></i>
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="vp-main">
          {/* Topbar */}
          <header className="vp-topbar">
            <div className="vp-topbar-left">
              <button className="vp-topbar-burger" onClick={() => setSidebarOpen(!sidebarOpen)}>
                <i className="fi-rs-menu-burger"></i>
              </button>
              <h1 className="vp-topbar-title">{title || 'Dashboard'}</h1>
            </div>

            <div className="vp-topbar-right">
              <div className="vp-topbar-search">
                <i className="fi-rs-search"></i>
                <input type="text" placeholder="Search..." />
              </div>
              <button className="vp-topbar-btn" title="Notifications">
                <i className="fi-rs-bell"></i>
                <span className="vp-notif-dot"></span>
              </button>
              <button className="vp-topbar-btn" title="Help">
                <i className="fi-rs-interrogation"></i>
              </button>
            </div>
          </header>

          {/* Page Content */}
          <div className="vp-content">
            {(subtitle || actions) && (
              <div className="vp-page-header">
                <div>
                  <h2 className="vp-page-title">{title}</h2>
                  {subtitle && <p className="vp-page-subtitle">{subtitle}</p>}
                </div>
                {actions && <div className="vp-page-actions">{actions}</div>}
              </div>
            )}
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
