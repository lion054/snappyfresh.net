import { ReactNode, FC } from 'react';
import { motion } from 'framer-motion';

interface ScaleInProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

/**
 * ScaleIn animation component - pop-in effect for cards and modals
 */
const ScaleIn: FC<ScaleInProps> = ({ children, delay = 0, duration = 0.4, className = '' }) => {
  return (
    <motion.div
      className={className}
      initial={{
        scale: 0.9,
        opacity: 0
      }}
      animate={{
        scale: 1,
        opacity: 1
      }}
      transition={{
        duration,
        delay,
        ease: [0.34, 1.56, 0.64, 1] // Bouncy spring effect
      }}
    >
      {children}
    </motion.div>
  );
};

export default ScaleIn;
