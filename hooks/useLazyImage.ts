import { useEffect, useRef, useState } from 'react';

/**
 * Hook for lazy loading images with intersection observer
 * Loads images only when they enter the viewport
 */
export function useLazyImage(imageRef: React.RefObject<HTMLImageElement>) {
  const [isLoaded, setIsLoaded] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const img = imageRef.current;
    if (!img || isLoaded) return;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
              setIsLoaded(true);
              observer.unobserve(img);
            }
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before entering viewport
      }
    );

    observer.observe(img);
    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [imageRef, isLoaded]);

  return isLoaded;
}
