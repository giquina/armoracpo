import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiHome, FiBriefcase, FiMessageSquare, FiUser, FiAlertTriangle } from 'react-icons/fi';
import { FaHome, FaBriefcase, FaCommentDots, FaUser, FaExclamationTriangle } from 'react-icons/fa';
import { IconWrapper } from '../../utils/IconWrapper';
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
    { path: '/dashboard', icon: FiHome, activeIcon: FaHome, label: 'Home' },
    { path: '/jobs', icon: FiBriefcase, activeIcon: FaBriefcase, label: 'Jobs' },
    { path: '/incidents', icon: FiAlertTriangle, activeIcon: FaExclamationTriangle, label: 'Incidents' },
    { path: '/messages', icon: FiMessageSquare, activeIcon: FaCommentDots, label: 'Messages', badge: unreadCount },
    { path: '/profile', icon: FiUser, activeIcon: FaUser, label: 'Profile' },
  ];

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'var(--armora-bg-primary)',
        borderTop: '1px solid var(--armora-border-light)',
        display: 'flex',
        justifyContent: 'space-around',
        paddingBottom: 'max(var(--armora-space-sm), env(safe-area-inset-bottom))',
        paddingTop: 'var(--armora-space-sm)',
        zIndex: 1000,
        boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.1)',
      }}
    >
      {navItems.map((item) => {
        const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
        const IconComponent = isActive ? item.activeIcon : item.icon;
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
              gap: 'var(--armora-space-xs)',
              padding: 'var(--armora-space-sm)',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              minHeight: '48px',
              transition: 'all 0.2s ease',
              color: isActive ? 'var(--armora-gold)' : 'var(--armora-text-secondary)',
              position: 'relative',
            }}
          >
            {isActive && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '60%',
                  maxWidth: '48px',
                  height: '3px',
                  backgroundColor: 'var(--armora-gold)',
                  borderRadius: '0 0 var(--armora-radius-full) var(--armora-radius-full)',
                }}
              />
            )}
            <div
              style={{
                position: 'relative',
                transform: isActive ? 'scale(1.1)' : 'scale(1)',
                transition: 'transform 0.2s ease',
              }}
            >
              <IconWrapper icon={IconComponent} size={24} />
              {item.badge !== undefined && item.badge > 0 && (
                <div
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-8px',
                    backgroundColor: 'var(--armora-gold)',
                    color: 'white',
                    borderRadius: 'var(--armora-radius-full)',
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
                fontSize: 'var(--armora-text-xs)',
                fontWeight: isActive ? 600 : 400,
              }}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNav;
