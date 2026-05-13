import { useRef, useEffect } from 'react';

const FOCUSABLE = 'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Traps keyboard focus within a container when active.
 * Saves and restores the previously focused element on deactivation.
 *
 * @param {boolean} isActive - Whether the trap is active
 * @returns {React.RefObject} ref to attach to the container element
 */
export function useFocusTrap(isActive: any) {
  const containerRef = useRef<any>(null);
  const previouslyFocusedRef = useRef<any>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    previouslyFocusedRef.current = document.activeElement;

    // Focus first focusable element
    const first = container.querySelector(FOCUSABLE);
    if (first) {
      requestAnimationFrame(() => first.focus());
    }

    const handleKeyDown = (e: any) => {
      if (e.key !== 'Tab') return;

      const focusable = [...container.querySelectorAll(FOCUSABLE)];
      if (focusable.length === 0) return;

      const firstEl = focusable[0];
      const lastEl = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    };

    container.addEventListener('keydown', handleKeyDown);

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
      if (previouslyFocusedRef.current?.focus) {
        previouslyFocusedRef.current.focus();
      }
    };
  }, [isActive]);

  return containerRef;
}
