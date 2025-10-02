import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { messageService } from '../../services/messageService';
import '../../styles/global.css';

const BottomNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  const loadUnreadCount = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const count = await messageService.getTotalUnreadCount(user.id);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error loading unread count:', error);
      // Don't update state on error to keep last known good value
    }
  }, []);

  useEffect(() => {
    loadUnreadCount();

    // Subscribe to message updates with error handling
    const interval = setInterval(() => {
      loadUnreadCount().catch(error => {
        console.error('Polling error:', error);
      });
    }, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [loadUnreadCount]);

  const navItems = [
    { path: '/dashboard', icon: '🏠', label: 'Home' },
    { path: '/jobs', icon: '📋', label: 'Jobs' },
    { path: '/messages', icon: '💬', label: 'Messages', badge: unreadCount },
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
        const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
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
              position: 'relative',
            }}
          >
            <div style={{ position: 'relative' }}>
              <span style={{ fontSize: 'var(--font-size-xl)' }}>{item.icon}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <div
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-8px',
                    backgroundColor: 'var(--color-accent)',
                    color: 'white',
                    borderRadius: 'var(--radius-full)',
                    minWidth: '18px',
                    height: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '0 4px',
                  }}
                >
                  {item.badge > 9 ? '9+' : item.badge}
                </div>
              )}
            </div>
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
