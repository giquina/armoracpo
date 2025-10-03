import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';
import { IconWrapper } from '../../utils/IconWrapper';
import { IconButton } from './IconButton';
import './Modal.css';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  className = '',
}) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const modalClasses = ['armora-modal__content', className].filter(Boolean).join(' ');

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="armora-modal__overlay"
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(8px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
          />
          <div className="armora-modal__wrapper">
            <motion.div
              className={modalClasses}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby={title ? 'modal-title' : undefined}
            >
              {title && (
                <div className="armora-modal__header">
                  <h3 id="modal-title" className="armora-modal__title">
                    {title}
                  </h3>
                  <IconButton
                    icon={<IconWrapper icon={FaTimes} />}
                    onClick={onClose}
                    variant="ghost"
                    aria-label="Close modal"
                  />
                </div>
              )}
              {!title && (
                <div className="armora-modal__close-btn">
                  <IconButton
                    icon={<IconWrapper icon={FaTimes} />}
                    onClick={onClose}
                    variant="ghost"
                    aria-label="Close modal"
                  />
                </div>
              )}
              <div className="armora-modal__body">{children}</div>
              {footer && <div className="armora-modal__footer">{footer}</div>}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
