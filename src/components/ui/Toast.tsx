import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheckCircle, FaExclamationCircle, FaExclamationTriangle, FaInfoCircle, FaTimes } from 'react-icons/fa';
import { IconButton } from './IconButton';
import './Toast.css';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  type: ToastType;
  message: string;
  duration?: number;
  onClose: () => void;
  isVisible: boolean;
}

const toastConfig = {
  success: {
    icon: FaCheckCircle,
    className: 'armora-toast--success',
  },
  error: {
    icon: FaExclamationCircle,
    className: 'armora-toast--error',
  },
  warning: {
    icon: FaExclamationTriangle,
    className: 'armora-toast--warning',
  },
  info: {
    icon: FaInfoCircle,
    className: 'armora-toast--info',
  },
};

export const Toast: React.FC<ToastProps> = ({
  type,
  message,
  duration = 3000,
  onClose,
  isVisible,
}) => {
  const config = toastConfig[type];
  const Icon = config.icon;

  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  const toastClasses = ['armora-toast', config.className].filter(Boolean).join(' ');

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={toastClasses}
          initial={{ opacity: 0, y: 50, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: 50, x: '-50%' }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          role="alert"
          aria-live="assertive"
        >
          <div className="armora-toast__icon">
            <Icon />
          </div>
          <p className="armora-toast__message">{message}</p>
          <IconButton
            icon={<FaTimes />}
            onClick={onClose}
            variant="ghost"
            aria-label="Close notification"
            className="armora-toast__close"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
