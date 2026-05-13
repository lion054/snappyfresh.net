import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

/**
 * RouteLoader - Professional top bar loading indicator
 * Minimal, non-intrusive navigation feedback like YouTube/GitHub
 */
const RouteLoader = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        let progressInterval: NodeJS.Timeout | undefined;
        let timeoutId: NodeJS.Timeout | undefined;

        const handleStart = (url: string) => {
            // Only show loader if navigating to a different page
            if (url !== router.asPath) {
                setLoading(true);
                setProgress(10); // Start at 10% immediately

                // Fast initial progress
                progressInterval = setInterval(() => {
                    setProgress((prev) => {
                        if (prev >= 95) return 95; // Stop at 95% until route completes
                        const increment = prev < 50 ? 15 : prev < 80 ? 8 : 3;
                        return Math.min(prev + increment, 95);
                    });
                }, 150);
            }
        };

        const handleComplete = () => {
            if (progressInterval) clearInterval(progressInterval);
            setProgress(100);

            // Hide bar after completion
            timeoutId = setTimeout(() => {
                setLoading(false);
                setProgress(0);
            }, 300);
        };

        const handleError = () => {
            if (progressInterval) clearInterval(progressInterval);
            setLoading(false);
            setProgress(0);
        };

        // Subscribe to router events
        router.events.on('routeChangeStart', handleStart);
        router.events.on('routeChangeComplete', handleComplete);
        router.events.on('routeChangeError', handleError);

        // Cleanup
        return () => {
            router.events.off('routeChangeStart', handleStart);
            router.events.off('routeChangeComplete', handleComplete);
            router.events.off('routeChangeError', handleError);
            if (progressInterval) clearInterval(progressInterval);
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [router]);

    if (!loading) return null;

    return (
        <>
            <style jsx>{`
                .route-loader-bar {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 3px;
                    background: linear-gradient(
                        90deg,
                        #1a5c38 0%,
                        #42af57 50%,
                        #1a5c38 100%
                    );
                    transform-origin: left;
                    transform: scaleX(${progress / 100});
                    transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1);
                    z-index: var(--z-loader, 9999);
                    box-shadow: 0 0 10px rgba(26, 92, 56, 0.4);
                }

                @media (prefers-reduced-motion: reduce) {
                    .route-loader-bar {
                        transition: none;
                    }
                }
            `}</style>

            <div className="route-loader-bar" />
        </>
    );
};

export default RouteLoader;
