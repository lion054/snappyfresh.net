import { useEffect, useRef } from 'react';

interface SwipeCloseOptions {
  threshold?: number; // Minimum pixels to swipe before closing (default: 80)
}

/**
 * Hook to enable swipe-down-to-close gesture on modal/sheet elements
 * Triggers the callback when user swipes down more than threshold pixels
 * and the content is scrolled to the top (scrollTop === 0)
 *
 * @param onClose - Callback function to execute when swipe-to-close is triggered
 * @param ref - React ref to the scrollable element (the modal/sheet content)
 * @param options - Configuration options (threshold, etc.)
 */
export const useSwipeClose = (
  onClose: () => void,
  ref: React.RefObject<HTMLElement | null>,
  options: SwipeCloseOptions = {}
) => {
  const { threshold = 80 } = options;
  const startYRef = useRef<number | null>(null);
  const currentYRef = useRef<number | null>(null);

  useEffect(() => {
    const element = ref?.current;
    if (!element) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches[0]) {
        startYRef.current = e.touches[0].clientY;
        currentYRef.current = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) {
        currentYRef.current = e.touches[0].clientY;
      }
    };

    const handleTouchEnd = () => {
      // Only process if we have both start and current positions
      if (startYRef.current === null || currentYRef.current === null) {
        startYRef.current = null;
        currentYRef.current = null;
        return;
      }

      const delta = currentYRef.current - startYRef.current;

      // Check if:
      // 1. User swiped down (positive delta)
      // 2. Swipe distance exceeds threshold
      // 3. Content is scrolled to the top
      if (delta > threshold && element.scrollTop === 0) {
        onClose();
      }

      startYRef.current = null;
      currentYRef.current = null;
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onClose, ref, threshold]);
};
