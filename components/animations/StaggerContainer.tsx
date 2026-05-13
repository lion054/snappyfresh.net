import { ReactNode, FC } from 'react';
import { motion, Variants } from 'framer-motion';

interface StaggerContainerProps {
  children: ReactNode;
  staggerDelay?: number;
  className?: string;
}

interface StaggerItemProps {
  children: ReactNode;
  className?: string;
}

/**
 * StaggerContainer - Animates children with stagger delay
 */
const StaggerContainer: FC<StaggerContainerProps> = ({ children, staggerDelay = 0.1, className = '' }) => {
  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay
      }
    }
  };

  return (
    <motion.div
      className={className}
      variants={container}
      initial="hidden"
      animate="show"
    >
      {children}
    </motion.div>
  );
};

export const StaggerItem: FC<StaggerItemProps> = ({ children, className = '' }) => {
  const item: Variants = {
    hidden: { y: 20, opacity: 0 },
    show: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <motion.div
      className={className}
      variants={item}
    >
      {children}
    </motion.div>
  );
};

export default StaggerContainer;
