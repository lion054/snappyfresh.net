import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when page is scrolled down
  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Smooth scroll to top
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{
            duration: 0.3,
            ease: [0.34, 1.56, 0.64, 1]
          }}
          onClick={scrollToTop}
          style={{
            position: 'fixed',
            bottom: '90px',
            right: '20px',
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            background: 'rgba(66, 175, 87, 0.9)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(66, 175, 87, 0.3)',
            zIndex: 'var(--z-scroll-top, 601)',
            fontSize: '20px',
            transition: 'all 0.3s ease'
          }}
          whileHover={{
            scale: 1.1,
            boxShadow: '0 6px 25px rgba(66, 175, 87, 0.4)'
          }}
          whileTap={{
            scale: 0.95
          }}
          aria-label="Scroll to top"
        >
          <i className="fi-rs-angle-up"></i>
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default ScrollToTop;
