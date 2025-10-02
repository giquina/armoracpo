import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../../styles/global.css';

const BottomNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: '/dashboard', icon: '🏠', label: 'Home' },
    { path: '/jobs', icon: '📋', label: 'Jobs' },
    { path: '/active', icon: '🛡️', label: 'Active' },
    { path: '/earnings', icon: '💰', label: 'Earnings' },
    { path: '/profile', icon: '👤', label: 'Profile' },
  ];

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'var(--color-bg-primary)',
        borderTop: '1px solid var(--color-border-light)',
        display: 'flex',
        justifyContent: 'space-around',
        paddingBottom: 'max(var(--spacing-sm), var(--safe-area-bottom))',
        paddingTop: 'var(--spacing-sm)',
        zIndex: 'var(--z-nav)',
        boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.1)',
      }}
    >
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
              gap: 'var(--spacing-xs)',
              padding: 'var(--spacing-sm)',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              minHeight: 'var(--touch-target-min)',
              transition: 'all 0.2s ease',
              color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
            }}
          >
            <span style={{ fontSize: 'var(--font-size-xl)' }}>{item.icon}</span>
            <span
              style={{
                fontSize: 'var(--font-size-xs)',
                fontWeight: isActive ? 600 : 400,
              }}
            >
              {item.label}
            </span>
            {isActive && (
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  width: '40px',
                  height: '3px',
                  backgroundColor: 'var(--color-primary)',
                  borderRadius: 'var(--radius-full)',
                }}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNav;
