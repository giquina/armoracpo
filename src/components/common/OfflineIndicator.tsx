import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiWifiOff, FiCheck } from 'react-icons/fi';
import { IconWrapper } from '../../utils/IconWrapper';
import './OfflineIndicator.css';

const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showMessage, setShowMessage] = useState(false);
  const [justCameOnline, setJustCameOnline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setJustCameOnline(true);
      setShowMessage(true);

      // Hide "back online" message after 3 seconds
      setTimeout(() => {
        setShowMessage(false);
        setJustCameOnline(false);
      }, 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowMessage(true);
      setJustCameOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Show message immediately if offline
    if (!navigator.onLine) {
      setShowMessage(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {showMessage && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className={`offline-indicator ${isOnline ? 'online' : 'offline'}`}
        >
          <div className="offline-indicator__content">
            <IconWrapper className="offline-indicator__icon">
              {isOnline ? <FiCheck /> : <FiWifiOff />}
            </IconWrapper>
            <div className="offline-indicator__text">
              {isOnline ? (
                <>
                  <strong>Back Online</strong>
                  <span>Connection restored</span>
                </>
              ) : (
                <>
                  <strong>No Internet Connection</strong>
                  <span>Working offline - changes will sync when connection is restored</span>
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OfflineIndicator;
