import { useState, ReactNode } from 'react';
import Head from "next/head";
import Breadcrumb from "./Breadcrumb";
import Footer from "./Footer";
import Header from "./Header";
import MobileMenu from "./MobileMenu";
import BottomNav from "./BottomNav";

const Layout = ({
    children,
    parent,
    sub,
    subChild,
    noBreadcrumb,
}: { children?: ReactNode; parent?: string; sub?: string; subChild?: string; noBreadcrumb?: string }) => {
    const [isToggled, setToggled] = useState(false);
    const toggleClick = () => {
        setToggled(!isToggled);
        if (typeof window !== 'undefined' && document) {
            const body = document.querySelector("body");
            if (body) {
                if (isToggled) {
                    body.classList.remove("mobile-menu-active");
                } else {
                    body.classList.add("mobile-menu-active");
                }
            }
        }
    };

    return (
        <>
            <a href="#main-content" className="skip-to-content">
                Skip to main content
            </a>
            <Head>
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover" />
                <meta name="theme-color" content="#1a5c38" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="default" />
                <title>Snappy Fresh | Fresh Dairy, Milk & Groceries Delivery in Harare, Zimbabwe</title>
                <meta name="description" content="Order fresh dairy products, milk, yoghurt, cheese, bread and groceries online in Harare, Zimbabwe. Fast delivery, competitive prices. Shop now at Snappy Fresh!" />
                <meta name="keywords" content="fresh milk Zimbabwe, dairy delivery Harare, online grocery Zimbabwe, yoghurt delivery, cheese products Zimbabwe, bread delivery Harare, Snappy Fresh, grocery delivery Zimbabwe" />
                <meta name="author" content="Snappy Fresh" />
                <meta property="og:title" content="Snappy Fresh | Fresh Dairy & Groceries Delivery in Harare" />
                <meta property="og:site_name" content="Snappy Fresh" />
                <meta property="og:type" content="website" />
                <meta property="og:description" content="Fresh dairy, milk, yoghurt, cheese & groceries delivered to your door in Harare. Order online today!" />
                <link rel="icon" type="image/x-icon" href="/favicon.ico" />
                <link rel="icon" type="image/svg+xml" href="/assets/imgs/theme/favicon.svg" />
            </Head>

            {isToggled && <div className="body-overlay-1" onClick={toggleClick}></div>}

            <Header toggleClick={toggleClick} />
            <MobileMenu isToggled={isToggled} toggleClick={toggleClick} />
            <main className="main" id="main-content">
                <Breadcrumb parent={parent} sub={sub} subChild={subChild} noBreadcrumb={noBreadcrumb} />
                {children}
            </main>
            <Footer />
            <BottomNav />
        </>
    );
};

export default Layout;
