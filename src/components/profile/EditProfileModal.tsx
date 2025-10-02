import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiSave } from 'react-icons/fi';
import { EditProfileModalProps, FormField } from './types';

/**
 * EditProfileModal Component
 *
 * Reusable modal for editing profile fields with validation.
 * Supports text, email, tel, date, textarea, select, and multiselect inputs.
 */
export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  title,
  fields,
  initialValues,
  onSave,
}) => {
  const [values, setValues] = useState<Record<string, any>>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const handleChange = (fieldName: string, value: any) => {
    setValues((prev) => ({ ...prev, [fieldName]: value }));
    // Clear error on change
    if (errors[fieldName]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    fields.forEach((field) => {
      const value = values[field.name];

      // Required validation
      if (field.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
        newErrors[field.name] = `${field.label} is required`;
      }

      // Custom validation
      if (field.validation && value) {
        const error = field.validation(value);
        if (error) newErrors[field.name] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      setSaving(true);
      await onSave(values);
      onClose();
    } catch (err: any) {
      setErrors({ _general: err.message || 'Failed to save changes' });
    } finally {
      setSaving(false);
    }
  };

  const renderField = (field: FormField) => {
    const value = values[field.name] || '';
    const error = errors[field.name];

    const commonProps = {
      id: field.name,
      value,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
        handleChange(field.name, e.target.value),
      placeholder: field.placeholder,
      required: field.required,
      style: {
        width: '100%',
        borderColor: error ? 'var(--armora-danger)' : undefined,
      },
    };

    switch (field.type) {
      case 'textarea':
        return <textarea {...commonProps} rows={4} />;

      case 'select':
        return (
          <select {...commonProps}>
            <option value="">Select...</option>
            {field.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );

      case 'multiselect':
        return (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--armora-space-sm)' }}>
            {field.options?.map((opt) => {
              const selected = Array.isArray(value) && value.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    const current = Array.isArray(value) ? value : [];
                    const updated = selected
                      ? current.filter((v: string) => v !== opt.value)
                      : [...current, opt.value];
                    handleChange(field.name, updated);
                  }}
                  className={selected ? 'badge badge-navy' : 'badge'}
                  style={{
                    cursor: 'pointer',
                    backgroundColor: selected ? 'var(--armora-navy)' : 'var(--armora-bg-secondary)',
                    color: selected ? 'var(--armora-text-inverse)' : 'var(--armora-text-primary)',
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        );

      default:
        return <input type={field.type} {...commonProps} />;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          zIndex: 'var(--armora-z-modal)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--armora-space-md)',
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            backgroundColor: 'var(--armora-bg-primary)',
            borderRadius: 'var(--armora-radius-lg)',
            maxWidth: 500,
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: 'var(--armora-shadow-xl)',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 'var(--armora-space-md)',
              borderBottom: '1px solid var(--armora-border-light)',
            }}
          >
            <h3>{title}</h3>
            <button
              onClick={onClose}
              style={{
                width: 32,
                height: 32,
                borderRadius: 'var(--armora-radius-full)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'var(--armora-bg-secondary)',
              }}
              aria-label="Close"
            >
              <FiX size={18} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ padding: 'var(--armora-space-md)' }}>
            {fields.map((field) => (
              <div key={field.name} style={{ marginBottom: 'var(--armora-space-md)' }}>
                <label htmlFor={field.name}>
                  {field.label}
                  {field.required && <span style={{ color: 'var(--armora-danger)' }}> *</span>}
                </label>
                {renderField(field)}
                {errors[field.name] && (
                  <p style={{ fontSize: 'var(--armora-text-sm)', color: 'var(--armora-danger)', marginTop: 'var(--armora-space-xs)' }}>
                    {errors[field.name]}
                  </p>
                )}
              </div>
            ))}

            {/* General Error */}
            {errors._general && (
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
                {errors._general}
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: 'var(--armora-space-sm)', marginTop: 'var(--armora-space-lg)' }}>
              <button type="button" onClick={onClose} className="btn-secondary" style={{ flex: 1 }}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={saving} style={{ flex: 1 }}>
                {saving ? (
                  <>
                    <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                    Saving...
                  </>
                ) : (
                  <>
                    <FiSave size={18} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EditProfileModal;
