import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiBriefcase, FiEdit2 } from 'react-icons/fi';
import { ProfessionalDetailsSectionProps } from './types';
import { EditProfileModal } from './EditProfileModal';
import { IconWrapper } from '../../utils/IconWrapper';

/**
 * ProfessionalDetailsSection Component
 *
 * Professional details including specializations, skills, bio, and languages.
 */
export const ProfessionalDetailsSection: React.FC<ProfessionalDetailsSectionProps> = ({ cpo, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);

  // Mock data - these fields would need to be added to the ProtectionOfficer interface
  const specializations = ['Executive Protection', 'Event Security', 'Residential Security'];
  const skills = ['First Aid', 'Defensive Driving', 'Conflict Resolution'];
  const languages = ['English', 'French'];
  const yearsExperience = 5;
  const bio = cpo.first_name + ' is a dedicated Close Protection Officer with extensive experience in executive and residential security.';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="card"
      style={{ marginBottom: 'var(--armora-space-md)' }}
    >
      {/* Section Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--armora-space-md)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--armora-space-sm)' }}>
          <IconWrapper icon={FiBriefcase} size={20} color="var(--armora-navy)"/>
          <h3>Professional Details</h3>
        </div>
        <button onClick={() => setIsEditing(true)} className="btn-sm btn-outline-navy">
          <IconWrapper icon={FiEdit2} size={14}/>
          Edit
        </button>
      </div>

      {/* Years of Experience */}
      <div style={{ marginBottom: 'var(--armora-space-md)' }}>
        <p style={{ fontSize: 'var(--armora-text-sm)', color: 'var(--armora-text-secondary)', marginBottom: 'var(--armora-space-xs)' }}>
          Years of Experience
        </p>
        <p style={{ fontWeight: 'var(--armora-weight-semibold)', fontSize: 'var(--armora-text-xl)', color: 'var(--armora-navy)' }}>
          {yearsExperience} Years
        </p>
      </div>

      {/* Bio */}
      <div style={{ marginBottom: 'var(--armora-space-md)' }}>
        <p style={{ fontSize: 'var(--armora-text-sm)', color: 'var(--armora-text-secondary)', marginBottom: 'var(--armora-space-xs)' }}>
          Professional Bio
        </p>
        <p style={{ lineHeight: 'var(--armora-leading-relaxed)' }}>
          {bio}
        </p>
      </div>

      {/* Specializations */}
      <div style={{ marginBottom: 'var(--armora-space-md)' }}>
        <p style={{ fontSize: 'var(--armora-text-sm)', color: 'var(--armora-text-secondary)', marginBottom: 'var(--armora-space-sm)' }}>
          Specializations
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--armora-space-sm)' }}>
          {specializations.map((spec) => (
            <span key={spec} className="badge badge-navy">
              {spec}
            </span>
          ))}
        </div>
      </div>

      {/* Skills */}
      <div style={{ marginBottom: 'var(--armora-space-md)' }}>
        <p style={{ fontSize: 'var(--armora-text-sm)', color: 'var(--armora-text-secondary)', marginBottom: 'var(--armora-space-sm)' }}>
          Professional Skills
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--armora-space-sm)' }}>
          {skills.map((skill) => (
            <span key={skill} className="badge badge-gold">
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Languages */}
      <div>
        <p style={{ fontSize: 'var(--armora-text-sm)', color: 'var(--armora-text-secondary)', marginBottom: 'var(--armora-space-sm)' }}>
          Languages Spoken
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--armora-space-sm)' }}>
          {languages.map((lang) => (
            <span key={lang} className="badge badge-info">
              {lang}
            </span>
          ))}
        </div>
      </div>

      {/* Edit Modal */}
      <EditProfileModal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        title="Edit Professional Details"
        fields={[
          {
            name: 'years_experience',
            label: 'Years of Experience',
            type: 'text',
            required: true,
          },
          {
            name: 'bio',
            label: 'Professional Bio',
            type: 'textarea',
            placeholder: 'Describe your experience and expertise...',
          },
          {
            name: 'specializations',
            label: 'Specializations',
            type: 'multiselect',
            options: [
              { value: 'executive', label: 'Executive Protection' },
              { value: 'residential', label: 'Residential Security' },
              { value: 'event', label: 'Event Security' },
              { value: 'transport', label: 'Transport Security' },
              { value: 'celebrity', label: 'Celebrity Protection' },
            ],
          },
          {
            name: 'skills',
            label: 'Professional Skills',
            type: 'multiselect',
            options: [
              { value: 'firearms', label: 'Firearms' },
              { value: 'first_aid', label: 'First Aid' },
              { value: 'defensive_driving', label: 'Defensive Driving' },
              { value: 'conflict_resolution', label: 'Conflict Resolution' },
              { value: 'surveillance', label: 'Surveillance Detection' },
            ],
          },
          {
            name: 'languages',
            label: 'Languages',
            type: 'multiselect',
            options: [
              { value: 'english', label: 'English' },
              { value: 'french', label: 'French' },
              { value: 'german', label: 'German' },
              { value: 'spanish', label: 'Spanish' },
              { value: 'arabic', label: 'Arabic' },
            ],
          },
        ]}
        initialValues={{
          years_experience: yearsExperience,
          bio,
          specializations,
          skills,
          languages,
        }}
        onSave={onUpdate}
      />
    </motion.div>
  );
};

export default ProfessionalDetailsSection;
