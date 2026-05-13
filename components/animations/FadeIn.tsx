import { ReactNode, FC } from 'react';
import { motion } from 'framer-motion';

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  className?: string;
}

/**
 * FadeIn animation component - smooth entrance for elements
 */
const FadeIn: FC<FadeInProps> = ({ children, delay = 0, duration = 0.5, direction = 'up', className = '' }) => {
  const directionOffset = {
    up: { y: 40 },
    down: { y: -40 },
    left: { x: 40 },
    right: { x: -40 }
  };

  return (
    <motion.div
      className={className}
      initial={{
        opacity: 0,
        ...directionOffset[direction]
      }}
      animate={{
        opacity: 1,
        x: 0,
        y: 0
      }}
      transition={{
        duration,
        delay,
        ease: 'easeInOut'
      }}
    >
      {children}
    </motion.div>
  );
};

export default FadeIn;
