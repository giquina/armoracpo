import React, { useState } from 'react';

// DevPanel for quick navigation during development
// NOTE: This component uses window.location for navigation to avoid React Router dependency
export const DevPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const screens = [
    { name: 'Splash', path: '/splash', icon: '🛡️' },
    { name: 'Welcome', path: '/welcome', icon: '👋' },
    { name: 'Login', path: '/', icon: '🔐' },
    { name: 'Signup', path: '/signup', icon: '📝' },
    { name: 'Dashboard', path: '/dashboard', icon: '📊' },
    { name: 'Available Jobs', path: '/jobs', icon: '📋' },
    { name: 'Active Job', path: '/active', icon: '🚨' },
    { name: 'Job History', path: '/history', icon: '📜' },
    { name: 'Messages', path: '/messages', icon: '💬' },
    { name: 'Incidents', path: '/incidents', icon: '🚨' },
    { name: 'Profile', path: '/profile', icon: '👤' },
    { name: 'Earnings', path: '/earnings', icon: '💰' },
    { name: 'Compliance', path: '/compliance', icon: '✅' },
    { name: 'Settings', path: '/settings', icon: '⚙️' },
    { name: 'DOB', path: '/dob', icon: '📓' },
  ];

  const handleNavigate = (path: string) => {
    sessionStorage.setItem('devMode', 'true'); // Enable dev mode bypass
    sessionStorage.setItem('hasSeenWelcome', 'true'); // Skip welcome on future loads
    // Use window.location for navigation to avoid React Router dependency
    window.location.href = path;
    setIsOpen(false);
  };

  return (
    <>
      {/* Toggle Button - Always visible */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          backgroundColor: 'var(--armora-gold)',
          color: 'var(--armora-navy)',
          border: 'none',
          borderRadius: '8px',
          padding: '12px 20px',
          cursor: 'pointer',
          fontWeight: 600,
          fontSize: '14px',
          zIndex: 10000,
          boxShadow: '0 4px 12px rgba(255, 215, 0, 0.4)',
        }}
      >
        {isOpen ? '▼' : '▲'} DEV PANEL
      </button>

      {/* Dev Panel */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'var(--armora-navy)',
          borderTop: '4px solid var(--armora-gold)',
          boxShadow: '0 -4px 20px rgba(255, 215, 0, 0.3)',
          zIndex: 9999,
          maxHeight: '450px',
          overflowY: 'auto',
          animation: 'slideUp 0.3s ease',
        }}>
          {/* Screen Grid */}
          <div style={{ padding: '24px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
              paddingBottom: '12px',
              borderBottom: '1px solid rgba(255, 215, 0, 0.2)'
            }}>
              <h3 style={{
                color: 'var(--armora-gold)',
                fontSize: '16px',
                textTransform: 'uppercase',
                fontWeight: 700,
                letterSpacing: '0.5px',
                margin: 0
              }}>
                🚀 Quick Navigation (Dev Mode)
              </h3>
              <div style={{
                backgroundColor: 'rgba(255, 215, 0, 0.1)',
                color: 'var(--armora-gold)',
                padding: '4px 12px',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: 600,
                border: '1px solid rgba(255, 215, 0, 0.3)'
              }}>
                DEVELOPMENT
              </div>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
              gap: '14px',
            }}>
              {screens.map((screen) => (
                <button
                  key={screen.path}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Navigating to:', screen.path);
                    handleNavigate(screen.path);
                  }}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    color: 'var(--armora-light)',
                    border: '2px solid rgba(255, 215, 0, 0.3)',
                    borderRadius: '12px',
                    padding: '16px 12px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 600,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                    pointerEvents: 'auto',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--armora-gold)';
                    e.currentTarget.style.color = 'var(--armora-navy)';
                    e.currentTarget.style.borderColor = 'var(--armora-gold)';
                    e.currentTarget.style.transform = 'translateY(-4px) scale(1.03)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(255, 215, 0, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.color = 'var(--armora-light)';
                    e.currentTarget.style.borderColor = 'rgba(255, 215, 0, 0.3)';
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)';
                  }}
                >
                  <span style={{ fontSize: '24px' }}>{screen.icon}</span>
                  <span>{screen.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DevPanel;
