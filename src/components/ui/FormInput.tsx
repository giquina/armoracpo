import React from 'react';
import './FormInput.css';

export type FormInputType = 'text' | 'email' | 'phone' | 'password' | 'number';

export interface FormInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  type?: FormInputType;
  label?: string;
  error?: string;
  required?: boolean;
  helperText?: string;
}

export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  ({ type = 'text', label, error, required, helperText, className = '', id, ...props }, ref) => {
    const inputId = id || `input-${label?.replace(/\s+/g, '-').toLowerCase()}`;

    const inputClasses = [
      'armora-form-input',
      error && 'armora-form-input--error',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className="armora-form-input__wrapper">
        {label && (
          <label htmlFor={inputId} className="armora-form-input__label">
            {label}
            {required && <span className="armora-form-input__required">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          className={inputClasses}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          {...props}
        />
        {error && (
          <p id={`${inputId}-error`} className="armora-form-input__error">
            {error}
          </p>
        )}
        {!error && helperText && (
          <p id={`${inputId}-helper`} className="armora-form-input__helper">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';
