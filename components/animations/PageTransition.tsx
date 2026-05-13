import { ReactNode, FC } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useRouter } from 'next/router';

interface PageTransitionProps {
  children: ReactNode;
}

/**
 * PageTransition - Smooth page transitions
 */
const PageTransition: FC<PageTransitionProps> = ({ children }) => {
  const router = useRouter();

  const variants: Variants = {
    hidden: {
      opacity: 0,
      y: 20
    },
    enter: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4
      }
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.3
      }
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={router.pathname}
        variants={variants}
        initial="hidden"
        animate="enter"
        exit="exit"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default PageTransition;
