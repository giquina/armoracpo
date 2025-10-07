import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Splash.css';

interface SplashProps {
  onComplete?: () => void;
  duration?: number;
}

const Splash: React.FC<SplashProps> = ({ onComplete, duration = 2500 }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleComplete();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleComplete = () => {
    setIsVisible(false);
    setTimeout(() => {
      if (onComplete) {
        onComplete();
      }
    }, 500);
  };

  const handleSkip = () => {
    handleComplete();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="splash-screen"
          onClick={handleSkip}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Background gradient */}
          <div className="splash-background" />

          {/* Main content container */}
          <div className="splash-content">
            {/* Shield logo with animations */}
            <motion.div
              className="splash-logo"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: 'spring',
                stiffness: 200,
                damping: 20,
                delay: 0.2,
              }}
            >
              <motion.div
                className="splash-shield"
                animate={{
                  filter: [
                    'drop-shadow(0 0 20px rgba(212, 175, 55, 0.3))',
                    'drop-shadow(0 0 40px rgba(212, 175, 55, 0.6))',
                    'drop-shadow(0 0 20px rgba(212, 175, 55, 0.3))',
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                🛡️
              </motion.div>
            </motion.div>

            {/* Wordmark */}
            <motion.div
              className="splash-wordmark"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <motion.h1
                className="splash-title"
                animate={{
                  textShadow: [
                    '0 0 10px rgba(212, 175, 55, 0)',
                    '0 0 20px rgba(212, 175, 55, 0.5)',
                    '0 0 10px rgba(212, 175, 55, 0)',
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                ArmoraCPO
              </motion.h1>
            </motion.div>

            {/* Tagline */}
            <motion.div
              className="splash-tagline"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.5 }}
            >
              <p className="splash-tagline-text">
                Professional Close Protection Platform
              </p>
            </motion.div>

            {/* Loading indicator */}
            <motion.div
              className="splash-loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.3 }}
            >
              <div className="splash-loader-bar">
                <motion.div
                  className="splash-loader-progress"
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{
                    duration: duration / 1000,
                    ease: 'easeInOut',
                  }}
                />
              </div>
            </motion.div>
          </div>

          {/* Tap to skip hint */}
          <motion.div
            className="splash-skip-hint"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ delay: 1.5, duration: 0.5 }}
          >
            <p className="splash-skip-text">Tap to skip</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Splash;
