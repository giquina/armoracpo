import React from 'react';
import { ProtectionOfficer } from '../../lib/supabase';
import { FaShieldAlt, FaStar } from 'react-icons/fa';
import '../../styles/global.css';

interface WelcomeHeaderProps {
  cpo: ProtectionOfficer;
}

const WelcomeHeader: React.FC<WelcomeHeaderProps> = ({ cpo }) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getInitials = () => {
    return `${cpo.first_name[0]}${cpo.last_name[0]}`.toUpperCase();
  };

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, var(--armora-navy) 0%, var(--armora-navy-light) 100%)',
        color: 'var(--armora-text-inverse)',
        padding: 'var(--armora-space-lg)',
        borderRadius: '0 0 var(--armora-radius-2xl) var(--armora-radius-2xl)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative background pattern */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(212, 175, 55, 0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          transform: 'translate(50%, -50%)',
        }}
      />

      <div className="flex items-center gap-md" style={{ position: 'relative', zIndex: 1 }}>
        {/* Avatar */}
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: 'var(--armora-radius-full)',
            background: cpo.profile_photo_url
              ? `url(${cpo.profile_photo_url})`
              : 'linear-gradient(135deg, var(--armora-gold) 0%, var(--armora-gold-light) 100%)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 'var(--armora-text-xl)',
            fontWeight: 'var(--armora-weight-bold)',
            color: 'var(--armora-navy)',
            border: '3px solid var(--armora-gold)',
            boxShadow: 'var(--armora-shadow-gold)',
          }}
        >
          {!cpo.profile_photo_url && getInitials()}
        </div>

        {/* Greeting and Info */}
        <div style={{ flex: 1 }}>
          <p
            style={{
              fontSize: 'var(--armora-text-sm)',
              opacity: 0.9,
              marginBottom: 'var(--armora-space-xs)',
            }}
          >
            {getGreeting()},
          </p>
          <h1
            className="font-display"
            style={{
              fontSize: 'var(--armora-text-2xl)',
              fontWeight: 'var(--armora-weight-extrabold)',
              marginBottom: 'var(--armora-space-xs)',
              lineHeight: 1.2,
            }}
          >
            {cpo.first_name} {cpo.last_name}
          </h1>

          {/* Rating and Verification */}
          <div className="flex items-center gap-sm" style={{ flexWrap: 'wrap' }}>
            {/* Rating */}
            {cpo.rating && (
              <div
                className="flex items-center gap-xs"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  padding: 'var(--armora-space-xs) var(--armora-space-sm)',
                  borderRadius: 'var(--armora-radius-full)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <FaStar color="var(--armora-gold)" size={14} />
                <span style={{ fontSize: 'var(--armora-text-sm)', fontWeight: 'var(--armora-weight-semibold)' }}>
                  {cpo.rating.toFixed(1)}
                </span>
              </div>
            )}

            {/* Verification Badge */}
            {cpo.verification_status === 'verified' && (
              <div
                className="flex items-center gap-xs"
                style={{
                  backgroundColor: 'rgba(16, 185, 129, 0.2)',
                  padding: 'var(--armora-space-xs) var(--armora-space-sm)',
                  borderRadius: 'var(--armora-radius-full)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                }}
              >
                <FaShieldAlt color="var(--armora-success)" size={12} />
                <span
                  style={{
                    fontSize: 'var(--armora-text-xs)',
                    fontWeight: 'var(--armora-weight-semibold)',
                    color: 'var(--armora-text-inverse)',
                  }}
                >
                  SIA VERIFIED
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeHeader;
