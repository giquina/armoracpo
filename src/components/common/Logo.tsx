import React from 'react';

interface LogoProps {
  variant?: 'full' | 'icon' | 'wordmark';
  size?: number;
  className?: string;
}

/**
 * ArmoraCPO Logo Component
 *
 * Professional shield-based logo for the Close Protection Officer platform.
 *
 * @param variant - Logo display variant:
 *   - 'full': Shield icon + ARMORA wordmark (default)
 *   - 'icon': Shield icon only
 *   - 'wordmark': ARMORA text only
 * @param size - Base size in pixels (default: 40)
 * @param className - Additional CSS classes
 */
export const Logo: React.FC<LogoProps> = ({
  variant = 'full',
  size = 40,
  className = ''
}) => {
  // Shield icon SVG
  const ShieldIcon = () => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Armora Shield"
    >
      {/* Shield outline */}
      <path
        d="M50 5L15 20V45C15 67.5 28.75 87.5 50 95C71.25 87.5 85 67.5 85 45V20L50 5Z"
        fill="#0A1F44"
        stroke="#D4AF37"
        strokeWidth="2"
      />

      {/* Inner shield detail */}
      <path
        d="M50 15L25 26V45C25 62.5 35 77.5 50 83C65 77.5 75 62.5 75 45V26L50 15Z"
        fill="#0A1F44"
      />

      {/* Gold accent line */}
      <path
        d="M50 25L35 32V45C35 57.5 41.25 68 50 72C58.75 68 65 57.5 65 45V32L50 25Z"
        fill="#D4AF37"
        opacity="0.2"
      />

      {/* Center emblem - stylized "A" */}
      <path
        d="M50 35L40 60H44L46 55H54L56 60H60L50 35Z M48 52L50 47L52 52H48Z"
        fill="#D4AF37"
      />
    </svg>
  );

  // Wordmark SVG
  const Wordmark = () => {
    const fontSize = size * 0.4;
    return (
      <svg
        width={size * 3}
        height={size * 0.5}
        viewBox="0 0 300 50"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Armora"
      >
        <text
          x="0"
          y="40"
          fontFamily="Montserrat, sans-serif"
          fontSize="42"
          fontWeight="800"
          fill="#0A1F44"
          letterSpacing="2"
        >
          ARMORA
        </text>
      </svg>
    );
  };

  // Render based on variant
  if (variant === 'icon') {
    return (
      <div className={`armora-logo armora-logo-icon ${className}`}>
        <ShieldIcon />
      </div>
    );
  }

  if (variant === 'wordmark') {
    return (
      <div className={`armora-logo armora-logo-wordmark ${className}`}>
        <Wordmark />
      </div>
    );
  }

  // Full variant (default)
  return (
    <div
      className={`armora-logo armora-logo-full ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: `${size * 0.3}px`
      }}
    >
      <ShieldIcon />
      <span
        style={{
          fontFamily: 'Montserrat, sans-serif',
          fontSize: `${size * 0.6}px`,
          fontWeight: 800,
          color: '#0A1F44',
          letterSpacing: '1px',
        }}
      >
        ARMORA
      </span>
    </div>
  );
};

export default Logo;
