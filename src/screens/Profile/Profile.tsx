import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { authService } from '../../services/authService';
import { ProtectionOfficer } from '../../lib/supabase';

// Import all profile components
import { ProfileHeader } from '../../components/profile/ProfileHeader';
import { AvatarUpload } from '../../components/profile/AvatarUpload';
import { PersonalInfoSection } from '../../components/profile/PersonalInfoSection';
import { SIALicenseSection } from '../../components/profile/SIALicenseSection';
import { ProfessionalDetailsSection } from '../../components/profile/ProfessionalDetailsSection';
import { AvailabilitySection } from '../../components/profile/AvailabilitySection';
import { DocumentsSection } from '../../components/profile/DocumentsSection';
import { StatisticsSection } from '../../components/profile/StatisticsSection';
import { SecuritySettingsSection } from '../../components/profile/SecuritySettingsSection';
import { BankDetailsSection } from '../../components/profile/BankDetailsSection';

import '../../styles/global.css';

/**
 * Profile Screen
 *
 * Complete professional profile and account management for CPOs.
 * Displays all CPO information with inline editing capabilities.
 */
const Profile: React.FC = () => {
  const [cpo, setCpo] = useState<ProtectionOfficer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAvatarUpload, setShowAvatarUpload] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await authService.getCurrentUser();
      if (!result) {
        setError('Not authenticated');
        return;
      }

      setCpo(result.cpo);
    } catch (err: any) {
      console.error('Error loading profile:', err);
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadProfile();
  };

  const handleProfileUpdate = async (updates: Partial<ProtectionOfficer>) => {
    if (!cpo) return;

    try {
      const updatedCpo = await authService.updateProfile(cpo.id, updates);
      setCpo(updatedCpo);
    } catch (err: any) {
      console.error('Error updating profile:', err);
      throw err;
    }
  };

  const handleAvatarUploadComplete = (url: string) => {
    if (cpo) {
      setCpo({ ...cpo, profile_photo_url: url });
    }
  };

  // Loading State
  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          backgroundColor: 'var(--armora-bg-secondary)',
          gap: 'var(--armora-space-md)',
        }}
      >
        <div className="spinner"></div>
        <p style={{ color: 'var(--armora-text-secondary)' }}>Loading profile...</p>
      </div>
    );
  }

  // Error State
  if (error || !cpo) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          backgroundColor: 'var(--armora-bg-secondary)',
          padding: 'var(--armora-space-md)',
          textAlign: 'center',
          gap: 'var(--armora-space-md)',
        }}
      >
        <h2 style={{ color: 'var(--armora-danger)' }}>Error Loading Profile</h2>
        <p style={{ color: 'var(--armora-text-secondary)' }}>
          {error || 'Unable to load profile data'}
        </p>
        <button onClick={loadProfile} className="btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div
      className="safe-top safe-bottom"
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--armora-bg-secondary)',
        paddingBottom: '80px',
      }}
    >
      {/* Profile Header */}
      <ProfileHeader cpo={cpo} onEditAvatar={() => setShowAvatarUpload(true)} />

      {/* Pull to Refresh Indicator */}
      {refreshing && (
        <div
          style={{
            padding: 'var(--armora-space-md)',
            textAlign: 'center',
            backgroundColor: 'var(--armora-bg-primary)',
            borderBottom: '1px solid var(--armora-border-light)',
          }}
        >
          <div className="spinner" style={{ margin: '0 auto', width: 24, height: 24 }} />
        </div>
      )}

      {/* Profile Content Sections */}
      <div className="container" style={{ paddingTop: 'var(--armora-space-lg)' }}>
        {/* Statistics Section */}
        <StatisticsSection cpo={cpo} />

        {/* Personal Information Section */}
        <PersonalInfoSection cpo={cpo} onUpdate={handleProfileUpdate} />

        {/* SIA License Section */}
        <SIALicenseSection cpo={cpo} onUpdate={handleProfileUpdate} />

        {/* Professional Details Section */}
        <ProfessionalDetailsSection cpo={cpo} onUpdate={handleProfileUpdate} />

        {/* Availability Section */}
        <AvailabilitySection cpo={cpo} onUpdate={handleProfileUpdate} />

        {/* Documents Section */}
        <DocumentsSection cpo={cpo} onUpdate={handleRefresh} />

        {/* Bank Details Section */}
        <BankDetailsSection cpo={cpo} onUpdate={handleProfileUpdate} />

        {/* Security Settings Section */}
        <SecuritySettingsSection userId={cpo.user_id} />

        {/* Account Information Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          style={{
            textAlign: 'center',
            padding: 'var(--armora-space-xl) var(--armora-space-md)',
            color: 'var(--armora-text-secondary)',
            fontSize: 'var(--armora-text-sm)',
          }}
        >
          <p>Member since {new Date(cpo.created_at).toLocaleDateString('en-GB', { year: 'numeric', month: 'long' })}</p>
          <p style={{ marginTop: 'var(--armora-space-xs)' }}>
            Profile last updated: {new Date(cpo.updated_at).toLocaleDateString('en-GB')}
          </p>
        </motion.div>
      </div>

      {/* Avatar Upload Modal */}
      {showAvatarUpload && (
        <AvatarUpload
          currentAvatarUrl={cpo.profile_photo_url}
          onClose={() => setShowAvatarUpload(false)}
          onUploadComplete={handleAvatarUploadComplete}
        />
      )}
    </div>
  );
};

export default Profile;
