import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiLock, FiShield, FiEye, FiTrash2, FiAlertTriangle } from 'react-icons/fi';
import { SecuritySettingsSectionProps } from './types';
import { supabase } from '../../lib/supabase';

/**
 * SecuritySettingsSection Component
 *
 * Manage account security settings including password, 2FA, and privacy.
 */
export const SecuritySettingsSection: React.FC<SecuritySettingsSectionProps> = ({ userId }) => {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePasswordChange = async () => {
    if (passwordData.new !== passwordData.confirm) {
      setError('New passwords do not match');
      return;
    }

    if (passwordData.new.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    try {
      setUpdating(true);
      setError(null);

      const { error } = await supabase.auth.updateUser({
        password: passwordData.new,
      });

      if (error) throw error;

      setShowPasswordModal(false);
      setPasswordData({ current: '', new: '', confirm: '' });
      alert('Password updated successfully');
    } catch (err: any) {
      setError(err.message || 'Failed to update password');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="card"
      style={{ marginBottom: 'var(--armora-space-md)' }}
    >
      {/* Section Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--armora-space-sm)', marginBottom: 'var(--armora-space-lg)' }}>
        <FiLock size={20} color="var(--armora-navy)" />
        <h3>Security Settings</h3>
      </div>

      {/* Settings List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--armora-space-md)' }}>
        {/* Change Password */}
        <SettingItem
          icon={<FiLock size={18} />}
          title="Change Password"
          description="Update your account password"
          action={
            <button onClick={() => setShowPasswordModal(true)} className="btn-sm btn-outline-navy">
              Change
            </button>
          }
        />

        {/* Two-Factor Authentication */}
        <SettingItem
          icon={<FiShield size={18} />}
          title="Two-Factor Authentication"
          description="Add an extra layer of security"
          action={
            <span className="badge badge-warning">Coming Soon</span>
          }
        />

        {/* Privacy Settings */}
        <SettingItem
          icon={<FiEye size={18} />}
          title="Privacy Settings"
          description="Control who can see your information"
          action={
            <button className="btn-sm btn-secondary" disabled>
              Manage
            </button>
          }
        />

        {/* Delete Account */}
        <SettingItem
          icon={<FiTrash2 size={18} color="var(--armora-danger)" />}
          title="Delete Account"
          description="Permanently delete your account and data"
          action={
            <button onClick={() => setShowDeleteModal(true)} className="btn-sm btn-danger">
              Delete
            </button>
          }
        />
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--armora-space-md)',
          }}
          onClick={() => setShowPasswordModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'var(--armora-bg-primary)',
              borderRadius: 'var(--armora-radius-lg)',
              maxWidth: 400,
              width: '100%',
              padding: 'var(--armora-space-lg)',
            }}
          >
            <h3 style={{ marginBottom: 'var(--armora-space-md)' }}>Change Password</h3>

            <div style={{ marginBottom: 'var(--armora-space-md)' }}>
              <label>New Password</label>
              <input
                type="password"
                value={passwordData.new}
                onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                placeholder="Enter new password"
              />
            </div>

            <div style={{ marginBottom: 'var(--armora-space-md)' }}>
              <label>Confirm Password</label>
              <input
                type="password"
                value={passwordData.confirm}
                onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                placeholder="Confirm new password"
              />
            </div>

            {error && (
              <div
                style={{
                  padding: 'var(--armora-space-md)',
                  backgroundColor: '#fee2e2',
                  color: '#991b1b',
                  borderRadius: 'var(--armora-radius-md)',
                  fontSize: 'var(--armora-text-sm)',
                  marginBottom: 'var(--armora-space-md)',
                }}
              >
                {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: 'var(--armora-space-sm)' }}>
              <button onClick={() => setShowPasswordModal(false)} className="btn-secondary" style={{ flex: 1 }}>
                Cancel
              </button>
              <button onClick={handlePasswordChange} className="btn-primary" disabled={updating} style={{ flex: 1 }}>
                {updating ? 'Updating...' : 'Update'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--armora-space-md)',
          }}
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'var(--armora-bg-primary)',
              borderRadius: 'var(--armora-radius-lg)',
              maxWidth: 400,
              width: '100%',
              padding: 'var(--armora-space-lg)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--armora-space-sm)', marginBottom: 'var(--armora-space-md)' }}>
              <FiAlertTriangle size={24} color="var(--armora-danger)" />
              <h3 style={{ color: 'var(--armora-danger)' }}>Delete Account</h3>
            </div>

            <p style={{ marginBottom: 'var(--armora-space-lg)', lineHeight: 'var(--armora-leading-relaxed)' }}>
              This action cannot be undone. All your data will be permanently deleted. Please contact support to proceed with account deletion.
            </p>

            <div style={{ display: 'flex', gap: 'var(--armora-space-sm)' }}>
              <button onClick={() => setShowDeleteModal(false)} className="btn-secondary" style={{ flex: 1 }}>
                Cancel
              </button>
              <button className="btn-danger" style={{ flex: 1 }} disabled>
                Contact Support
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

// Setting Item Component
const SettingItem: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  action: React.ReactNode;
}> = ({ icon, title, description, action }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 'var(--armora-space-md)',
      backgroundColor: 'var(--armora-bg-secondary)',
      borderRadius: 'var(--armora-radius-md)',
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--armora-space-md)', flex: 1 }}>
      <div style={{ color: 'var(--armora-navy)' }}>{icon}</div>
      <div>
        <p style={{ fontWeight: 'var(--armora-weight-semibold)', marginBottom: 'var(--armora-space-xs)' }}>
          {title}
        </p>
        <p style={{ fontSize: 'var(--armora-text-sm)', color: 'var(--armora-text-secondary)' }}>
          {description}
        </p>
      </div>
    </div>
    {action}
  </div>
);

export default SecuritySettingsSection;
