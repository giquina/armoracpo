import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheckCircle, FaBriefcase, FaMoon, FaClock, FaTimes } from 'react-icons/fa';
import { IconWrapper } from '../../utils/IconWrapper';
import SIAVerificationBadge from './SIAVerificationBadge';
import './OperationalStatusWidget.css';

export type OperationalStatus = 'operational' | 'busy' | 'standdown';

export interface OperationalStatusWidgetProps {
  currentStatus: OperationalStatus;
  onStatusChange: (status: OperationalStatus) => Promise<void>;
  hasActiveAssignment?: boolean;
  siaVerified?: boolean;
  lastStatusChange?: Date;
  assignmentContext?: string;
}

const statusConfig = {
  operational: {
    label: 'OPERATIONAL',
    description: 'You are available and visible to principals',
    icon: FaCheckCircle,
    color: 'var(--armora-operational)',
    bgColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.2)',
    glowColor: 'rgba(16, 185, 129, 0.3)',
  },
  busy: {
    label: 'BUSY',
    description: 'You are on assignment',
    icon: FaBriefcase,
    color: 'var(--armora-busy)',
    bgColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.2)',
    glowColor: 'rgba(239, 68, 68, 0.3)',
  },
  standdown: {
    label: 'STAND DOWN',
    description: 'You are offline and not visible to principals',
    icon: FaMoon,
    color: 'var(--armora-standdown)',
    bgColor: 'var(--armora-bg-secondary)',
    borderColor: 'var(--armora-border-light)',
    glowColor: 'transparent',
  },
};

const OperationalStatusWidget: React.FC<OperationalStatusWidgetProps> = ({
  currentStatus,
  onStatusChange,
  hasActiveAssignment = false,
  siaVerified = true,
  lastStatusChange,
  assignmentContext,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<OperationalStatus | null>(null);
  const [showAutoStandDown, setShowAutoStandDown] = useState(false);
  const [autoStandDownTime, setAutoStandDownTime] = useState<string>('');
  const [statusDuration, setStatusDuration] = useState<string>('');

  const config = statusConfig[currentStatus];
  const Icon = config.icon;

  // Calculate status duration
  useEffect(() => {
    if (!lastStatusChange) return;

    const updateDuration = () => {
      const now = new Date();
      const diff = now.getTime() - new Date(lastStatusChange).getTime();
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      if (days > 0) {
        setStatusDuration(`${days}d ${hours % 24}h`);
      } else if (hours > 0) {
        setStatusDuration(`${hours}h ${minutes % 60}m`);
      } else if (minutes > 0) {
        setStatusDuration(`${minutes}m`);
      } else {
        setStatusDuration('Just now');
      }
    };

    updateDuration();
    const interval = setInterval(updateDuration, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [lastStatusChange]);

  // Haptic feedback helper
  const triggerHaptic = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(50); // Short vibration (50ms)
    }
  };

  const handleStatusButtonClick = (newStatus: OperationalStatus) => {
    if (newStatus === currentStatus) return;

    // Show confirmation for Busy or Stand Down
    if (newStatus === 'busy' || newStatus === 'standdown') {
      setPendingStatus(newStatus);
      setShowConfirmModal(true);
      triggerHaptic();
    } else {
      handleStatusChange(newStatus);
    }
  };

  const handleConfirmStatusChange = async () => {
    if (!pendingStatus) return;
    setShowConfirmModal(false);
    await handleStatusChange(pendingStatus);
    setPendingStatus(null);
  };

  const handleCancelStatusChange = () => {
    setShowConfirmModal(false);
    setPendingStatus(null);
  };

  const handleStatusChange = async (newStatus: OperationalStatus) => {
    if (newStatus === currentStatus) return;

    setIsLoading(true);
    try {
      triggerHaptic();
      await onStatusChange(newStatus);

      // Announce status change to screen readers
      const announcement = `Status changed to ${statusConfig[newStatus].label}`;
      const ariaLive = document.getElementById('aria-live-region');
      if (ariaLive) {
        ariaLive.textContent = announcement;
      }
    } catch (error) {
      console.error('Failed to change status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutoStandDownSchedule = () => {
    setShowAutoStandDown(true);
  };

  const handleSetAutoStandDown = () => {
    if (!autoStandDownTime) return;

    console.log('Auto stand-down scheduled for:', autoStandDownTime);
    setShowAutoStandDown(false);
    setAutoStandDownTime('');

    // TODO: Implement actual scheduling logic with backend
    alert(`Auto stand-down scheduled for ${autoStandDownTime}`);
  };

  return (
    <>
      <div
        className="card operational-status-widget"
        style={{ position: 'relative', overflow: 'visible' }}
        role="region"
        aria-label="Operational Status Widget"
      >
        {/* Pulsing glow background when operational */}
        {currentStatus === 'operational' && (
          <motion.div
            animate={{
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `radial-gradient(circle at center, ${config.glowColor} 0%, transparent 70%)`,
              pointerEvents: 'none',
            }}
          />
        )}

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Header with SIA Badge */}
          <div className="flex justify-between items-center mb-md">
            <h3 style={{ margin: 0, fontSize: 'var(--armora-text-lg)', fontFamily: 'var(--armora-font-display)' }}>
              Operational Status
            </h3>
            <div className="flex items-center gap-sm">
              {siaVerified && (
                <SIAVerificationBadge verified={true} size="small" showLabel={true} />
              )}
              {currentStatus === 'operational' && (
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [1, 0.7, 1],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="cpo-status-indicator cpo-status-indicator--operational"
                  role="status"
                  aria-label="Status indicator: Operational"
                />
              )}
            </div>
          </div>

          {/* Current Status Display */}
          <div
            className={`operational-status-display operational-status-display--${currentStatus}`}
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            <div className="flex items-center gap-md mb-sm">
              <motion.div
                animate={
                  currentStatus === 'operational'
                    ? {
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0],
                      }
                    : {}
                }
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <IconWrapper icon={Icon} size={32} color={config.color} />
              </motion.div>
              <div style={{ flex: 1 }}>
                <h2
                  className={`operational-status-label operational-status-label--${currentStatus}`}
                  aria-label={`You are currently ${config.label.toLowerCase()}`}
                >
                  {config.label}
                </h2>
                <p className="operational-status-description">
                  {config.description}
                </p>
              </div>
            </div>

            {/* Status Duration and Assignment Context */}
            {(statusDuration || assignmentContext) && (
              <div className="flex items-center gap-sm mt-sm" style={{ paddingTop: 'var(--armora-space-xs)', borderTop: '1px solid var(--armora-border-light)' }}>
                {statusDuration && (
                  <div className="flex items-center gap-xs">
                    <IconWrapper icon={FaClock} size={12} color="var(--armora-text-secondary)" />
                    <span className="text-xs" style={{ color: 'var(--armora-text-secondary)' }}>
                      {statusDuration}
                    </span>
                  </div>
                )}
                {assignmentContext && currentStatus === 'busy' && (
                  <span className="text-xs" style={{ color: 'var(--armora-text-secondary)', flex: 1 }}>
                    {assignmentContext}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Status Toggle Buttons */}
          {!hasActiveAssignment && (
            <div>
              <div className="flex justify-between items-center mb-sm">
                <p
                  className="text-sm"
                  style={{
                    margin: 0,
                    color: 'var(--armora-text-secondary)',
                  }}
                >
                  Change your status:
                </p>
                {currentStatus === 'operational' && (
                  <button
                    onClick={handleAutoStandDownSchedule}
                    className="text-xs"
                    style={{
                      padding: 'var(--armora-space-xs) var(--armora-space-sm)',
                      background: 'transparent',
                      color: 'var(--armora-teal)',
                      border: '1px solid var(--armora-teal)',
                      borderRadius: 'var(--armora-radius-md)',
                      cursor: 'pointer',
                      fontWeight: 'var(--armora-weight-semibold)',
                    }}
                    aria-label="Schedule automatic stand down"
                  >
                    Auto Stand Down
                  </button>
                )}
              </div>
              <div className="flex gap-sm">
                {(Object.keys(statusConfig) as OperationalStatus[]).map((status) => {
                  const statusConf = statusConfig[status];
                  const StatusIcon = statusConf.icon;
                  const isActive = currentStatus === status;

                  return (
                    <motion.button
                      key={status}
                      onClick={() => handleStatusButtonClick(status)}
                      disabled={isLoading || isActive}
                      whileTap={{ scale: isActive ? 1 : 0.95 }}
                      style={{
                        flex: 1,
                        minHeight: '56px', // Touch-friendly height
                        padding: 'var(--armora-space-sm)',
                        borderRadius: 'var(--armora-radius-md)',
                        border: `2px solid ${isActive ? statusConf.borderColor : 'var(--armora-border-light)'}`,
                        backgroundColor: isActive ? statusConf.bgColor : 'var(--armora-bg-primary)',
                        cursor: isActive || isLoading ? 'default' : 'pointer',
                        transition: 'all 0.2s ease',
                        opacity: isLoading ? 0.6 : 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 'var(--armora-space-xs)',
                      }}
                      aria-label={`Set status to ${statusConf.label}`}
                      aria-pressed={isActive}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleStatusButtonClick(status);
                        }
                      }}
                    >
                      <IconWrapper
                        icon={StatusIcon}
                        size={20}
                        color={isActive ? statusConf.color : 'var(--armora-text-secondary)'}
                      />
                      <span
                        style={{
                          fontSize: 'var(--armora-text-xs)',
                          fontWeight: isActive ? 'var(--armora-weight-semibold)' : 'var(--armora-weight-normal)',
                          color: isActive ? statusConf.color : 'var(--armora-text-secondary)',
                        }}
                      >
                        {statusConf.label}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Assignment Lock Message */}
          {hasActiveAssignment && (
            <div className="operational-status-locked">
              <p
                className="text-sm"
                style={{
                  margin: 0,
                  color: 'var(--armora-text-secondary)',
                }}
              >
                Status locked while on active assignment
              </p>
            </div>
          )}

          {/* Loading Spinner */}
          {isLoading && (
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }}
              role="status"
              aria-label="Changing status"
            >
              <div className="spinner spinner-gold" />
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && pendingStatus && (
          <>
            {/* Modal Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCancelStatusChange}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 'var(--armora-space-lg)',
              }}
              role="presentation"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 1001,
                width: '90%',
                maxWidth: '400px',
                backgroundColor: 'var(--armora-white)',
                borderRadius: 'var(--armora-radius-lg)',
                boxShadow: 'var(--armora-shadow-card)',
                padding: 'var(--armora-space-lg)',
              }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="confirm-modal-title"
              aria-describedby="confirm-modal-description"
            >
              <div className="flex justify-between items-start mb-md">
                <h3 id="confirm-modal-title" style={{ margin: 0, fontSize: 'var(--armora-text-lg)', fontFamily: 'var(--armora-font-display)', flex: 1 }}>
                  Confirm Status Change
                </h3>
                <button
                  onClick={handleCancelStatusChange}
                  style={{
                    padding: 'var(--armora-space-xs)',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--armora-text-secondary)',
                  }}
                  aria-label="Close confirmation dialog"
                >
                  <IconWrapper icon={FaTimes} size={20} />
                </button>
              </div>

              <div id="confirm-modal-description" style={{ marginBottom: 'var(--armora-space-lg)' }}>
                <div className="flex items-center gap-md mb-md" style={{ padding: 'var(--armora-space-md)', backgroundColor: statusConfig[pendingStatus].bgColor, borderRadius: 'var(--armora-radius-md)', border: `2px solid ${statusConfig[pendingStatus].borderColor}` }}>
                  <IconWrapper icon={statusConfig[pendingStatus].icon} size={24} color={statusConfig[pendingStatus].color} />
                  <div>
                    <p style={{ margin: 0, fontWeight: 'var(--armora-weight-bold)', color: statusConfig[pendingStatus].color }}>
                      {statusConfig[pendingStatus].label}
                    </p>
                    <p className="text-sm" style={{ margin: 0, color: 'var(--armora-text-secondary)' }}>
                      {statusConfig[pendingStatus].description}
                    </p>
                  </div>
                </div>

                <p className="text-sm" style={{ color: 'var(--armora-text-secondary)' }}>
                  {pendingStatus === 'busy'
                    ? 'You will be marked as on assignment and visible to principals.'
                    : 'You will be marked as offline and hidden from principals.'}
                </p>
              </div>

              <div className="flex gap-sm">
                <button
                  onClick={handleCancelStatusChange}
                  className="btn btn-secondary"
                  style={{ flex: 1, minHeight: '56px' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmStatusChange}
                  className="btn btn-primary"
                  style={{ flex: 1, minHeight: '56px', backgroundColor: statusConfig[pendingStatus].color, borderColor: statusConfig[pendingStatus].color }}
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Auto Stand Down Modal */}
      <AnimatePresence>
        {showAutoStandDown && (
          <>
            {/* Modal Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAutoStandDown(false)}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 'var(--armora-space-lg)',
              }}
              role="presentation"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 1001,
                width: '90%',
                maxWidth: '400px',
                backgroundColor: 'var(--armora-white)',
                borderRadius: 'var(--armora-radius-lg)',
                boxShadow: 'var(--armora-shadow-card)',
                padding: 'var(--armora-space-lg)',
              }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="auto-standdown-title"
            >
              <div className="flex justify-between items-start mb-md">
                <h3 id="auto-standdown-title" style={{ margin: 0, fontSize: 'var(--armora-text-lg)', fontFamily: 'var(--armora-font-display)', flex: 1 }}>
                  Schedule Auto Stand Down
                </h3>
                <button
                  onClick={() => setShowAutoStandDown(false)}
                  style={{
                    padding: 'var(--armora-space-xs)',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--armora-text-secondary)',
                  }}
                  aria-label="Close auto stand down dialog"
                >
                  <IconWrapper icon={FaTimes} size={20} />
                </button>
              </div>

              <p className="text-sm mb-md" style={{ color: 'var(--armora-text-secondary)' }}>
                Automatically change your status to Stand Down at a specified time.
              </p>

              <div style={{ marginBottom: 'var(--armora-space-lg)' }}>
                <label htmlFor="auto-standdown-time" className="text-sm" style={{ display: 'block', marginBottom: 'var(--armora-space-xs)', fontWeight: 'var(--armora-weight-semibold)', color: 'var(--armora-text-primary)' }}>
                  Stand Down At
                </label>
                <input
                  id="auto-standdown-time"
                  type="time"
                  value={autoStandDownTime}
                  onChange={(e) => setAutoStandDownTime(e.target.value)}
                  style={{
                    width: '100%',
                    padding: 'var(--armora-space-sm)',
                    border: '2px solid var(--armora-border-light)',
                    borderRadius: 'var(--armora-radius-md)',
                    fontSize: 'var(--armora-text-base)',
                    fontFamily: 'var(--armora-font-body)',
                  }}
                  aria-label="Select time for automatic stand down"
                />
              </div>

              <div className="flex gap-sm">
                <button
                  onClick={() => setShowAutoStandDown(false)}
                  className="btn btn-secondary"
                  style={{ flex: 1, minHeight: '56px' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSetAutoStandDown}
                  className="btn btn-primary"
                  disabled={!autoStandDownTime}
                  style={{ flex: 1, minHeight: '56px' }}
                >
                  Schedule
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ARIA Live Region for Screen Reader Announcements */}
      <div
        id="aria-live-region"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: 'absolute',
          left: '-10000px',
          width: '1px',
          height: '1px',
          overflow: 'hidden',
        }}
      />
    </>
  );
};

export default OperationalStatusWidget;
