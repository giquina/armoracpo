import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiAlertTriangle, FiHome, FiRefreshCw, FiMail } from 'react-icons/fi';
import { Button } from '../ui/Button';
import { IconWrapper } from '../../utils/IconWrapper';
import './ErrorDisplay.css';

export interface ErrorDisplayProps {
  /** Main error title displayed prominently */
  title: string;
  /** Detailed error message explaining what went wrong */
  message: string;
  /** Optional error code for debugging and support reference */
  errorCode?: string;
  /** List of actionable suggestions to help the user resolve the issue */
  suggestions: string[];
  /** Whether to show the "Contact Support" link (default: true) */
  showContactSupport?: boolean;
  /** Whether to show the "Retry" button (default: false) */
  showRetry?: boolean;
  /** Callback function when retry button is clicked */
  onRetry?: () => void;
  /** Whether to show the "Go to Dashboard" button (default: true) */
  showGoHome?: boolean;
  /** Additional CSS class names */
  className?: string;
  /** Support email address (default: support@armora.co.uk) */
  supportEmail?: string;
}

/**
 * ErrorDisplay Component
 *
 * A comprehensive, reusable error display component for ArmoraCPO.
 * Displays error information with actionable suggestions and navigation options.
 *
 * Features:
 * - Prominent error icon and title
 * - Clear error message
 * - Actionable suggestions list
 * - Optional retry functionality
 * - Navigation to dashboard
 * - Contact support link
 * - Error code for debugging
 * - Fully accessible (ARIA labels, semantic HTML)
 * - Mobile-first responsive design
 * - Smooth entrance animation
 *
 * @example
 * ```tsx
 * import { ErrorDisplay } from './components/errors/ErrorDisplay';
 * import { AUTH_ERRORS } from './utils/errorMessages';
 *
 * <ErrorDisplay
 *   title={AUTH_ERRORS.SESSION_EXPIRED.title}
 *   message={AUTH_ERRORS.SESSION_EXPIRED.message}
 *   suggestions={AUTH_ERRORS.SESSION_EXPIRED.suggestions}
 *   errorCode={AUTH_ERRORS.SESSION_EXPIRED.errorCode}
 *   showRetry={true}
 *   onRetry={() => window.location.reload()}
 * />
 * ```
 */
export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  title,
  message,
  errorCode,
  suggestions,
  showContactSupport = true,
  showRetry = false,
  onRetry,
  showGoHome = true,
  className = '',
  supportEmail = 'support@armora.co.uk',
}) => {
  const navigate = useNavigate();

  const containerClasses = ['armora-error-display', className].filter(Boolean).join(' ');

  const handleGoHome = () => {
    navigate('/dashboard');
  };

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    }
  };

  return (
    <motion.div
      className={containerClasses}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      {/* Error Icon */}
      <div className="armora-error-display__icon" aria-hidden="true">
        <IconWrapper
          icon={FiAlertTriangle}
          size={40}
          className="armora-error-display__icon-inner"
        />
      </div>

      {/* Error Title */}
      <h2 className="armora-error-display__title" id="error-title">
        {title}
      </h2>

      {/* Error Code */}
      {errorCode && (
        <div className="armora-error-display__code" aria-label={`Error code: ${errorCode}`}>
          Error Code: {errorCode}
        </div>
      )}

      {/* Error Message */}
      <p className="armora-error-display__message" id="error-description">
        {message}
      </p>

      {/* Suggestions Section */}
      {suggestions && suggestions.length > 0 && (
        <div className="armora-error-display__suggestions">
          <h3
            className="armora-error-display__suggestions-title"
            id="error-suggestions-title"
          >
            What you can do:
          </h3>
          <ul
            className="armora-error-display__suggestions-list"
            aria-labelledby="error-suggestions-title"
          >
            {suggestions.map((suggestion, index) => (
              <motion.li
                key={index}
                className="armora-error-display__suggestions-item"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
              >
                {suggestion}
              </motion.li>
            ))}
          </ul>
        </div>
      )}

      {/* Action Buttons */}
      <div className="armora-error-display__actions">
        {showRetry && onRetry && (
          <Button
            variant="primary"
            size="md"
            onClick={handleRetry}
            icon={<IconWrapper icon={FiRefreshCw} size={18} />}
            iconPosition="left"
            aria-label="Retry the failed operation"
          >
            Try Again
          </Button>
        )}

        {showGoHome && (
          <Button
            variant="secondary"
            size="md"
            onClick={handleGoHome}
            icon={<IconWrapper icon={FiHome} size={18} />}
            iconPosition="left"
            aria-label="Return to dashboard"
          >
            Go to Dashboard
          </Button>
        )}
      </div>

      {/* Contact Support Section */}
      {showContactSupport && (
        <>
          <div className="armora-error-display__divider" aria-hidden="true" />
          <div className="armora-error-display__support">
            <p>
              <IconWrapper
                icon={FiMail}
                size={14}
                style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }}
                aria-hidden="true"
              />
              Still having trouble?{' '}
              <a
                href={`mailto:${supportEmail}?subject=Support Request - Error ${errorCode || 'Unknown'}&body=Error Title: ${title}%0D%0AError Code: ${errorCode || 'N/A'}%0D%0A%0D%0APlease describe your issue below:%0D%0A`}
                className="armora-error-display__support-link"
                aria-label={`Contact support at ${supportEmail}`}
              >
                Contact Support
              </a>
            </p>
          </div>
        </>
      )}
    </motion.div>
  );
};

/**
 * ErrorDisplayCard Component
 *
 * A card-wrapped version of ErrorDisplay for use within other layouts.
 * Includes standard card styling with shadow and border.
 */
export interface ErrorDisplayCardProps extends ErrorDisplayProps {
  /** Whether to show the card container (default: true) */
  showCard?: boolean;
}

export const ErrorDisplayCard: React.FC<ErrorDisplayCardProps> = ({
  showCard = true,
  className = '',
  ...props
}) => {
  const cardClasses = showCard ? 'card' : '';
  const combinedClasses = [cardClasses, className].filter(Boolean).join(' ');

  return (
    <div className={combinedClasses}>
      <ErrorDisplay {...props} />
    </div>
  );
};

export default ErrorDisplay;
