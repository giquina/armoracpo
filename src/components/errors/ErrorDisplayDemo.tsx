/**
 * ErrorDisplay Demo Component
 *
 * This component demonstrates all the error types and configurations
 * available in the error handling system. Use this for visual testing
 * and as a reference for implementation.
 *
 * To use: Import this component in any screen/page during development.
 */

import React, { useState } from 'react';
import { ErrorDisplay, ErrorDisplayCard } from './ErrorDisplay';
import {
  AUTH_ERRORS,
  NETWORK_ERRORS,
  DATABASE_ERRORS,
  VALIDATION_ERRORS,
  ASSIGNMENT_ERRORS,
  LOCATION_ERRORS,
  PAYMENT_ERRORS,
  COMPLIANCE_ERRORS,
  UNKNOWN_ERROR,
  createCustomError,
} from '../../utils/errorMessages';
import { Button } from '../ui/Button';

export const ErrorDisplayDemo: React.FC = () => {
  const [selectedError, setSelectedError] = useState<string>('auth-session-expired');
  const [showRetry, setShowRetry] = useState<boolean>(true);
  const [showGoHome, setShowGoHome] = useState<boolean>(true);
  const [showContactSupport, setShowContactSupport] = useState<boolean>(true);

  const errors = {
    // Auth Errors
    'auth-session-expired': AUTH_ERRORS.SESSION_EXPIRED,
    'auth-profile-not-found': AUTH_ERRORS.PROFILE_NOT_FOUND,
    'auth-invalid-credentials': AUTH_ERRORS.INVALID_CREDENTIALS,
    'auth-unverified': AUTH_ERRORS.UNVERIFIED_ACCOUNT,
    'auth-permission-denied': AUTH_ERRORS.PERMISSION_DENIED,

    // Network Errors
    'network-connection-failed': NETWORK_ERRORS.CONNECTION_FAILED,
    'network-timeout': NETWORK_ERRORS.TIMEOUT,
    'network-no-internet': NETWORK_ERRORS.NO_INTERNET,
    'network-server-error': NETWORK_ERRORS.SERVER_ERROR,
    'network-rate-limit': NETWORK_ERRORS.RATE_LIMIT,

    // Database Errors
    'db-query-failed': DATABASE_ERRORS.QUERY_FAILED,
    'db-not-found': DATABASE_ERRORS.NOT_FOUND,
    'db-duplicate': DATABASE_ERRORS.DUPLICATE_ENTRY,

    // Validation Errors
    'validation-invalid-input': VALIDATION_ERRORS.INVALID_INPUT,
    'validation-missing-fields': VALIDATION_ERRORS.MISSING_FIELDS,
    'validation-file-too-large': VALIDATION_ERRORS.FILE_TOO_LARGE,
    'validation-invalid-email': VALIDATION_ERRORS.INVALID_EMAIL,
    'validation-weak-password': VALIDATION_ERRORS.PASSWORD_TOO_WEAK,

    // Assignment Errors
    'assignment-already-taken': ASSIGNMENT_ERRORS.ALREADY_ASSIGNED,
    'assignment-not-available': ASSIGNMENT_ERRORS.NOT_AVAILABLE,
    'assignment-invalid-status': ASSIGNMENT_ERRORS.INVALID_STATUS,

    // Location Errors
    'location-permission-denied': LOCATION_ERRORS.PERMISSION_DENIED,
    'location-unavailable': LOCATION_ERRORS.UNAVAILABLE,
    'location-timeout': LOCATION_ERRORS.TIMEOUT,

    // Payment Errors
    'payment-failed': PAYMENT_ERRORS.PROCESSING_FAILED,
    'payment-insufficient': PAYMENT_ERRORS.INSUFFICIENT_BALANCE,
    'payment-missing-bank': PAYMENT_ERRORS.BANK_DETAILS_MISSING,

    // Compliance Errors
    'compliance-expired-license': COMPLIANCE_ERRORS.EXPIRED_LICENSE,
    'compliance-missing-docs': COMPLIANCE_ERRORS.MISSING_DOCUMENTS,
    'compliance-rejected': COMPLIANCE_ERRORS.DOCUMENT_REJECTED,

    // Unknown Error
    'unknown': UNKNOWN_ERROR,

    // Custom Error
    'custom': createCustomError(
      'Custom Error Example',
      'This is a custom error created using the createCustomError helper function. You can use this for application-specific errors.',
      [
        'Create custom errors for unique scenarios',
        'Follow the same structure as predefined errors',
        'Include actionable suggestions',
        'Use descriptive error codes',
      ],
      'CUSTOM-DEMO-001'
    ),
  };

  const currentError = errors[selectedError as keyof typeof errors];

  const handleRetry = () => {
    alert('Retry clicked! This would trigger your retry logic.');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '20px', fontFamily: 'var(--armora-font-display)' }}>
        ErrorDisplay Component Demo
      </h1>

      {/* Controls */}
      <div
        style={{
          marginBottom: '30px',
          padding: '20px',
          backgroundColor: 'var(--armora-bg-secondary)',
          borderRadius: 'var(--armora-radius-lg)',
        }}
      >
        <h2 style={{ marginBottom: '15px', fontSize: 'var(--armora-text-lg)' }}>Controls</h2>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Select Error Type:
          </label>
          <select
            value={selectedError}
            onChange={(e) => setSelectedError(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '16px',
              borderRadius: 'var(--armora-radius-md)',
              border: '2px solid var(--armora-border-light)',
            }}
          >
            <optgroup label="Authentication Errors">
              <option value="auth-session-expired">Session Expired (AUTH-002)</option>
              <option value="auth-profile-not-found">Profile Not Found (AUTH-001)</option>
              <option value="auth-invalid-credentials">Invalid Credentials (AUTH-003)</option>
              <option value="auth-unverified">Unverified Account (AUTH-004)</option>
              <option value="auth-permission-denied">Permission Denied (AUTH-005)</option>
            </optgroup>
            <optgroup label="Network Errors">
              <option value="network-connection-failed">Connection Failed (NET-001)</option>
              <option value="network-timeout">Timeout (NET-002)</option>
              <option value="network-no-internet">No Internet (NET-003)</option>
              <option value="network-server-error">Server Error (NET-004)</option>
              <option value="network-rate-limit">Rate Limit (NET-005)</option>
            </optgroup>
            <optgroup label="Database Errors">
              <option value="db-query-failed">Query Failed (DB-001)</option>
              <option value="db-not-found">Not Found (DB-003)</option>
              <option value="db-duplicate">Duplicate Entry (DB-004)</option>
            </optgroup>
            <optgroup label="Validation Errors">
              <option value="validation-invalid-input">Invalid Input (VAL-001)</option>
              <option value="validation-missing-fields">Missing Fields (VAL-002)</option>
              <option value="validation-file-too-large">File Too Large (VAL-003)</option>
              <option value="validation-invalid-email">Invalid Email (VAL-007)</option>
              <option value="validation-weak-password">Weak Password (VAL-008)</option>
            </optgroup>
            <optgroup label="Assignment Errors">
              <option value="assignment-already-taken">Already Assigned (ASSIGN-001)</option>
              <option value="assignment-not-available">Not Available (ASSIGN-002)</option>
              <option value="assignment-invalid-status">Invalid Status (ASSIGN-003)</option>
            </optgroup>
            <optgroup label="Location Errors">
              <option value="location-permission-denied">
                Location Permission Denied (LOC-001)
              </option>
              <option value="location-unavailable">Location Unavailable (LOC-002)</option>
              <option value="location-timeout">Location Timeout (LOC-003)</option>
            </optgroup>
            <optgroup label="Payment Errors">
              <option value="payment-failed">Payment Failed (PAY-001)</option>
              <option value="payment-insufficient">Insufficient Balance (PAY-002)</option>
              <option value="payment-missing-bank">Missing Bank Details (PAY-003)</option>
            </optgroup>
            <optgroup label="Compliance Errors">
              <option value="compliance-expired-license">Expired License (COMP-001)</option>
              <option value="compliance-missing-docs">Missing Documents (COMP-002)</option>
              <option value="compliance-rejected">Document Rejected (COMP-003)</option>
            </optgroup>
            <optgroup label="Other">
              <option value="unknown">Unknown Error (UNKNOWN-000)</option>
              <option value="custom">Custom Error (CUSTOM-DEMO-001)</option>
            </optgroup>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <input
              type="checkbox"
              checked={showRetry}
              onChange={(e) => setShowRetry(e.target.checked)}
            />
            Show Retry Button
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <input
              type="checkbox"
              checked={showGoHome}
              onChange={(e) => setShowGoHome(e.target.checked)}
            />
            Show Go Home Button
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <input
              type="checkbox"
              checked={showContactSupport}
              onChange={(e) => setShowContactSupport(e.target.checked)}
            />
            Show Contact Support
          </label>
        </div>
      </div>

      {/* Full-page Error Display */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ marginBottom: '15px', fontSize: 'var(--armora-text-lg)' }}>
          Full-page Error Display
        </h2>
        <div
          style={{
            border: '2px solid var(--armora-border-light)',
            borderRadius: 'var(--armora-radius-lg)',
            minHeight: '500px',
          }}
        >
          <ErrorDisplay
            title={currentError.title}
            message={currentError.message}
            suggestions={currentError.suggestions}
            errorCode={currentError.errorCode}
            showRetry={showRetry}
            onRetry={showRetry ? handleRetry : undefined}
            showGoHome={showGoHome}
            showContactSupport={showContactSupport}
          />
        </div>
      </div>

      {/* Inline Card Error Display */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ marginBottom: '15px', fontSize: 'var(--armora-text-lg)' }}>
          Inline Card Error Display
        </h2>
        <p style={{ marginBottom: '15px', color: 'var(--armora-text-secondary)' }}>
          Use ErrorDisplayCard for inline errors within forms or sections.
        </p>
        <ErrorDisplayCard
          title={currentError.title}
          message={currentError.message}
          suggestions={currentError.suggestions}
          errorCode={currentError.errorCode}
          showRetry={showRetry}
          onRetry={showRetry ? handleRetry : undefined}
          showGoHome={false}
          showContactSupport={showContactSupport}
        />
      </div>

      {/* Usage Example Code */}
      <div
        style={{
          marginTop: '40px',
          padding: '20px',
          backgroundColor: 'var(--armora-bg-secondary)',
          borderRadius: 'var(--armora-radius-lg)',
        }}
      >
        <h2 style={{ marginBottom: '15px', fontSize: 'var(--armora-text-lg)' }}>
          Code Example
        </h2>
        <pre
          style={{
            backgroundColor: 'var(--armora-navy)',
            color: 'var(--armora-text-inverse)',
            padding: '15px',
            borderRadius: 'var(--armora-radius-md)',
            overflow: 'auto',
            fontSize: '14px',
          }}
        >
          {`import { ErrorDisplay } from './components/errors/ErrorDisplay';
import { ${selectedError.split('-')[0].toUpperCase()}_ERRORS } from './utils/errorMessages';

<ErrorDisplay
  title={${selectedError.split('-')[0].toUpperCase()}_ERRORS.${selectedError
            .split('-')
            .slice(1)
            .map((s) => s.toUpperCase())
            .join('_')}.title}
  message={${selectedError.split('-')[0].toUpperCase()}_ERRORS.${selectedError
            .split('-')
            .slice(1)
            .map((s) => s.toUpperCase())
            .join('_')}.message}
  suggestions={${selectedError.split('-')[0].toUpperCase()}_ERRORS.${selectedError
            .split('-')
            .slice(1)
            .map((s) => s.toUpperCase())
            .join('_')}.suggestions}
  errorCode={${selectedError.split('-')[0].toUpperCase()}_ERRORS.${selectedError
            .split('-')
            .slice(1)
            .map((s) => s.toUpperCase())
            .join('_')}.errorCode}
  showRetry={${showRetry}}
  onRetry={${showRetry ? '() => handleRetry()' : 'undefined'}}
  showGoHome={${showGoHome}}
  showContactSupport={${showContactSupport}}
/>`}
        </pre>
      </div>
    </div>
  );
};

export default ErrorDisplayDemo;
