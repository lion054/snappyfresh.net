import { useEffect } from 'react';
import { useRouter } from 'next/router';

/**
 * ScrollRestoration - Manages scroll position on navigation
 * Provides instant scroll-to-top on new page navigation
 */
const ScrollRestoration = () => {
    const router = useRouter();

    useEffect(() => {
        const handleRouteChangeStart = () => {
            // Scroll to top immediately when navigation starts
            if (typeof window !== 'undefined') {
                window.scrollTo(0, 0);
            }
        };

        const handleRouteChangeComplete = () => {
            // Ensure we're at top after route completes
            if (typeof window !== 'undefined') {
                setTimeout(() => window.scrollTo(0, 0), 0);
            }
        };

        // Listen to route changes
        router.events.on('routeChangeStart', handleRouteChangeStart);
        router.events.on('routeChangeComplete', handleRouteChangeComplete);

        // Cleanup
        return () => {
            router.events.off('routeChangeStart', handleRouteChangeStart);
            router.events.off('routeChangeComplete', handleRouteChangeComplete);
        };
    }, [router]);

    return null;
};

export default ScrollRestoration;
