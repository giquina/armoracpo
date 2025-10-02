/**
 * TypeScript interfaces for Profile components
 */

import { ProtectionOfficer } from '../../lib/supabase';

export interface ProfileHeaderProps {
  cpo: ProtectionOfficer;
  onEditAvatar: () => void;
}

export interface AvatarUploadProps {
  currentAvatarUrl?: string;
  onClose: () => void;
  onUploadComplete: (url: string) => void;
}

export interface PersonalInfoSectionProps {
  cpo: ProtectionOfficer;
  onUpdate: (updates: Partial<ProtectionOfficer>) => Promise<void>;
}

export interface SIALicenseSectionProps {
  cpo: ProtectionOfficer;
  onUpdate: (updates: Partial<ProtectionOfficer>) => Promise<void>;
}

export interface ProfessionalDetailsSectionProps {
  cpo: ProtectionOfficer;
  onUpdate: (updates: Partial<ProtectionOfficer>) => Promise<void>;
}

export interface AvailabilitySectionProps {
  cpo: ProtectionOfficer;
  onUpdate: (updates: Partial<ProtectionOfficer>) => Promise<void>;
}

export interface DocumentsSectionProps {
  cpo: ProtectionOfficer;
  onUpdate: () => void;
}

export interface StatisticsSectionProps {
  cpo: ProtectionOfficer;
}

export interface SecuritySettingsSectionProps {
  userId: string;
}

export interface BankDetailsSectionProps {
  cpo: ProtectionOfficer;
  onUpdate: (updates: Partial<ProtectionOfficer>) => Promise<void>;
}

export interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  fields: FormField[];
  initialValues: Record<string, any>;
  onSave: (values: Record<string, any>) => Promise<void>;
}

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'date' | 'textarea' | 'select' | 'multiselect';
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  validation?: (value: any) => string | undefined;
}

export interface Document {
  id: string;
  type: 'dbs_check' | 'insurance' | 'training_cert' | 'sia_license';
  name: string;
  url: string;
  uploadedAt: string;
  expiryDate?: string;
}
