import React, { useEffect, useRef } from 'react';
import './FormTextarea.css';

export interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  required?: boolean;
  helperText?: string;
  maxLength?: number;
  autoResize?: boolean;
  showCharCount?: boolean;
}

export const FormTextarea = React.forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  (
    {
      label,
      error,
      required,
      helperText,
      maxLength,
      autoResize = false,
      showCharCount = false,
      className = '',
      id,
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    const textareaId = id || `textarea-${label?.replace(/\s+/g, '-').toLowerCase()}`;
    const internalRef = useRef<HTMLTextAreaElement>(null);
    const textareaRef = (ref as React.RefObject<HTMLTextAreaElement>) || internalRef;

    useEffect(() => {
      if (autoResize && textareaRef.current) {
        const textarea = textareaRef.current;
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
      }
    }, [value, autoResize, textareaRef]);

    const textareaClasses = [
      'armora-form-textarea',
      error && 'armora-form-textarea--error',
      autoResize && 'armora-form-textarea--auto-resize',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const currentLength = typeof value === 'string' ? value.length : 0;

    return (
      <div className="armora-form-textarea__wrapper">
        {label && (
          <label htmlFor={textareaId} className="armora-form-textarea__label">
            {label}
            {required && <span className="armora-form-textarea__required">*</span>}
          </label>
        )}
        <textarea
          ref={textareaRef}
          id={textareaId}
          className={textareaClasses}
          value={value}
          onChange={onChange}
          maxLength={maxLength}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={
            error ? `${textareaId}-error` : helperText ? `${textareaId}-helper` : undefined
          }
          {...props}
        />
        {(showCharCount || error || helperText) && (
          <div className="armora-form-textarea__footer">
            <div>
              {error && (
                <p id={`${textareaId}-error`} className="armora-form-textarea__error">
                  {error}
                </p>
              )}
              {!error && helperText && (
                <p id={`${textareaId}-helper`} className="armora-form-textarea__helper">
                  {helperText}
                </p>
              )}
            </div>
            {showCharCount && maxLength && (
              <span className="armora-form-textarea__char-count">
                {currentLength}/{maxLength}
              </span>
            )}
          </div>
        )}
      </div>
    );
  }
);

FormTextarea.displayName = 'FormTextarea';
