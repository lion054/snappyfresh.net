/**
 * Lazy Loading Utilities for SnappyFresh
 *
 * Provides optimized lazy loading for heavy components and libraries.
 * Reduces initial bundle size and improves Core Web Vitals scores.
 */

import dynamic from 'next/dynamic';
import { ReactNode } from 'react';

/**
 * Create a lazy-loaded component with a loading skeleton
 * @param importFunc - The import function for the component
 * @param options - Configuration options
 * @returns Dynamically imported component
 */
export function lazyComponent<P extends object>(
  importFunc: () => Promise<{ default: React.ComponentType<P> }>,
  options?: {
    loadingFallback?: ReactNode;
    ssr?: boolean;
  }
) {
  return dynamic(importFunc, {
    loading: () => options?.loadingFallback || <div className="loading-skeleton">Loading...</div>,
    ssr: options?.ssr !== false,
  });
}

/**
 * Dynamically import and cache a library
 * Useful for large libraries only needed on specific pages
 * @param importPath - Path to import from
 * @returns Promise that resolves to the imported module
 */
export async function importLibraryOnDemand(importPath: string): Promise<any> {
  try {
    const module = await import(importPath);
    return module;
  } catch (error) {
    console.error(`Failed to load library: ${importPath}`, error);
    throw error;
  }
}

/**
 * Heavy components that should be lazy-loaded
 * These are pre-configured for easy use throughout the app
 */
export const LazyComponents = {
  // Maps
  Gmap: () => lazyComponent(
    () => import('../components/elements/Gmap'),
    { ssr: false, loadingFallback: <MapSkeleton /> }
  ),

  // Payment modals
  EcocashPaymentModal: () => lazyComponent(
    () => import('../components/EcocashPaymentModal'),
    { ssr: false }
  ),

  InnBucksPaymentModal: () => lazyComponent(
    () => import('../components/InnBucksPaymentModal'),
    { ssr: false }
  ),
};

// Simple loading skeleton for maps
function MapSkeleton() {
  return (
    <div
      style={{
        height: '400px',
        width: '100%',
        backgroundColor: '#e0e0e0',
        borderRadius: '4px',
      }}
    />
  );
}

/**
 * Intersection Observer hook for lazy loading on scroll
 * Loads content only when it becomes visible in the viewport
 */
export function useLazyOnScroll(elementRef: React.RefObject<HTMLElement>, callback: () => void) {
  if (typeof window === 'undefined') return;

  if (!('IntersectionObserver' in window)) {
    // Fallback for older browsers
    callback();
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting) {
        callback();
        observer.disconnect();
      }
    },
    { threshold: 0.1 }
  );

  if (elementRef.current) {
    observer.observe(elementRef.current);
  }
}
