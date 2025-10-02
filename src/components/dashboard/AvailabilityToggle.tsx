import React, { useState } from 'react';
import { motion } from 'framer-motion';
import '../../styles/global.css';

interface AvailabilityToggleProps {
  isAvailable: boolean;
  onToggle: () => Promise<void>;
}

const AvailabilityToggle: React.FC<AvailabilityToggleProps> = ({ isAvailable, onToggle }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    setIsLoading(true);
    try {
      await onToggle();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Pulsing glow background when operational */}
      {isAvailable && (
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
            background: 'radial-gradient(circle at center, rgba(16, 185, 129, 0.1) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
      )}

      <div className="flex justify-between items-center" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ flex: 1 }}>
          <div className="flex items-center gap-sm mb-xs">
            <h3 style={{ margin: 0 }}>Availability Status</h3>
            {isAvailable && (
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--armora-success)',
                  boxShadow: '0 0 8px var(--armora-success)',
                }}
              />
            )}
          </div>
          <p
            className="text-sm"
            style={{
              color: 'var(--armora-text-secondary)',
              margin: 0,
            }}
          >
            {isAvailable ? 'You are operational and visible to principals' : 'You are on stand down'}
          </p>
        </div>

        {/* Toggle Switch */}
        <motion.button
          onClick={handleToggle}
          disabled={isLoading}
          whileTap={{ scale: 0.95 }}
          style={{
            position: 'relative',
            width: '72px',
            height: '40px',
            borderRadius: 'var(--armora-radius-full)',
            backgroundColor: isAvailable ? 'var(--armora-success)' : 'var(--armora-border-medium)',
            border: 'none',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            transition: 'background-color var(--armora-transition-base)',
            boxShadow: isAvailable ? '0 0 20px rgba(16, 185, 129, 0.3)' : 'none',
            opacity: isLoading ? 0.6 : 1,
          }}
        >
          <motion.div
            animate={{
              x: isAvailable ? 34 : 2,
            }}
            transition={{
              type: 'spring',
              stiffness: 500,
              damping: 30,
            }}
            style={{
              position: 'absolute',
              top: '2px',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: 'white',
              boxShadow: 'var(--armora-shadow-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {isLoading && (
              <div
                className="spinner"
                style={{
                  width: '20px',
                  height: '20px',
                  borderWidth: '2px',
                }}
              />
            )}
          </motion.div>
        </motion.button>
      </div>

      {/* Status Labels */}
      <div className="flex gap-md mt-md">
        <div
          className="flex items-center gap-xs"
          style={{
            flex: 1,
            padding: 'var(--armora-space-sm)',
            backgroundColor: isAvailable ? 'rgba(16, 185, 129, 0.1)' : 'var(--armora-bg-secondary)',
            borderRadius: 'var(--armora-radius-md)',
            border: isAvailable ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid var(--armora-border-light)',
          }}
        >
          <div
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: isAvailable ? 'var(--armora-success)' : 'var(--armora-text-tertiary)',
            }}
          />
          <span
            className="text-sm font-semibold"
            style={{
              color: isAvailable ? 'var(--armora-success)' : 'var(--armora-text-secondary)',
            }}
          >
            {isAvailable ? 'OPERATIONAL' : 'STAND DOWN'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityToggle;
