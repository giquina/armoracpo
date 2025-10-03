import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ErrorDisplay, ErrorDisplayCard } from '../ErrorDisplay';
import { AUTH_ERRORS, NETWORK_ERRORS, VALIDATION_ERRORS } from '../../../utils/errorMessages';

// Wrapper component for Router context
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <BrowserRouter>{children}</BrowserRouter>;
};

describe('ErrorDisplay Component', () => {
  describe('Basic Rendering', () => {
    it('renders error title and message', () => {
      render(
        <TestWrapper>
          <ErrorDisplay
            title="Test Error Title"
            message="Test error message description"
            suggestions={['Suggestion 1', 'Suggestion 2']}
          />
        </TestWrapper>
      );

      expect(screen.getByText('Test Error Title')).toBeInTheDocument();
      expect(screen.getByText('Test error message description')).toBeInTheDocument();
    });

    it('renders error code when provided', () => {
      render(
        <TestWrapper>
          <ErrorDisplay
            title="Test Error"
            message="Test message"
            suggestions={['Suggestion']}
            errorCode="TEST-001"
          />
        </TestWrapper>
      );

      expect(screen.getByText(/TEST-001/)).toBeInTheDocument();
    });

    it('does not render error code when not provided', () => {
      render(
        <TestWrapper>
          <ErrorDisplay
            title="Test Error"
            message="Test message"
            suggestions={['Suggestion']}
          />
        </TestWrapper>
      );

      expect(screen.queryByText(/Error Code:/)).not.toBeInTheDocument();
    });

    it('renders all suggestions as list items', () => {
      const suggestions = ['Suggestion 1', 'Suggestion 2', 'Suggestion 3'];

      render(
        <TestWrapper>
          <ErrorDisplay
            title="Test Error"
            message="Test message"
            suggestions={suggestions}
          />
        </TestWrapper>
      );

      suggestions.forEach((suggestion) => {
        expect(screen.getByText(suggestion)).toBeInTheDocument();
      });
    });
  });

  describe('Button Actions', () => {
    it('shows retry button when showRetry is true', () => {
      render(
        <TestWrapper>
          <ErrorDisplay
            title="Test Error"
            message="Test message"
            suggestions={['Suggestion']}
            showRetry={true}
            onRetry={() => {}}
          />
        </TestWrapper>
      );

      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });

    it('does not show retry button when showRetry is false', () => {
      render(
        <TestWrapper>
          <ErrorDisplay
            title="Test Error"
            message="Test message"
            suggestions={['Suggestion']}
            showRetry={false}
          />
        </TestWrapper>
      );

      expect(screen.queryByText('Try Again')).not.toBeInTheDocument();
    });

    it('calls onRetry when retry button is clicked', () => {
      const onRetry = jest.fn();

      render(
        <TestWrapper>
          <ErrorDisplay
            title="Test Error"
            message="Test message"
            suggestions={['Suggestion']}
            showRetry={true}
            onRetry={onRetry}
          />
        </TestWrapper>
      );

      fireEvent.click(screen.getByText('Try Again'));
      expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it('shows go to dashboard button by default', () => {
      render(
        <TestWrapper>
          <ErrorDisplay
            title="Test Error"
            message="Test message"
            suggestions={['Suggestion']}
          />
        </TestWrapper>
      );

      expect(screen.getByText('Go to Dashboard')).toBeInTheDocument();
    });

    it('hides go to dashboard button when showGoHome is false', () => {
      render(
        <TestWrapper>
          <ErrorDisplay
            title="Test Error"
            message="Test message"
            suggestions={['Suggestion']}
            showGoHome={false}
          />
        </TestWrapper>
      );

      expect(screen.queryByText('Go to Dashboard')).not.toBeInTheDocument();
    });
  });

  describe('Contact Support', () => {
    it('shows contact support link by default', () => {
      render(
        <TestWrapper>
          <ErrorDisplay
            title="Test Error"
            message="Test message"
            suggestions={['Suggestion']}
          />
        </TestWrapper>
      );

      expect(screen.getByText('Contact Support')).toBeInTheDocument();
    });

    it('hides contact support when showContactSupport is false', () => {
      render(
        <TestWrapper>
          <ErrorDisplay
            title="Test Error"
            message="Test message"
            suggestions={['Suggestion']}
            showContactSupport={false}
          />
        </TestWrapper>
      );

      expect(screen.queryByText('Contact Support')).not.toBeInTheDocument();
    });

    it('uses custom support email when provided', () => {
      render(
        <TestWrapper>
          <ErrorDisplay
            title="Test Error"
            message="Test message"
            suggestions={['Suggestion']}
            supportEmail="custom@example.com"
          />
        </TestWrapper>
      );

      const link = screen.getByText('Contact Support').closest('a');
      expect(link?.href).toContain('custom@example.com');
    });
  });

  describe('Predefined Errors', () => {
    it('renders AUTH_ERRORS.SESSION_EXPIRED correctly', () => {
      render(
        <TestWrapper>
          <ErrorDisplay
            title={AUTH_ERRORS.SESSION_EXPIRED.title}
            message={AUTH_ERRORS.SESSION_EXPIRED.message}
            suggestions={AUTH_ERRORS.SESSION_EXPIRED.suggestions}
            errorCode={AUTH_ERRORS.SESSION_EXPIRED.errorCode}
          />
        </TestWrapper>
      );

      expect(screen.getByText('Session Expired')).toBeInTheDocument();
      expect(screen.getByText(/AUTH-002/)).toBeInTheDocument();
    });

    it('renders NETWORK_ERRORS.CONNECTION_FAILED correctly', () => {
      render(
        <TestWrapper>
          <ErrorDisplay
            title={NETWORK_ERRORS.CONNECTION_FAILED.title}
            message={NETWORK_ERRORS.CONNECTION_FAILED.message}
            suggestions={NETWORK_ERRORS.CONNECTION_FAILED.suggestions}
            errorCode={NETWORK_ERRORS.CONNECTION_FAILED.errorCode}
          />
        </TestWrapper>
      );

      expect(screen.getByText('Connection Failed')).toBeInTheDocument();
      expect(screen.getByText(/NET-001/)).toBeInTheDocument();
    });

    it('renders VALIDATION_ERRORS.MISSING_FIELDS correctly', () => {
      render(
        <TestWrapper>
          <ErrorDisplay
            title={VALIDATION_ERRORS.MISSING_FIELDS.title}
            message={VALIDATION_ERRORS.MISSING_FIELDS.message}
            suggestions={VALIDATION_ERRORS.MISSING_FIELDS.suggestions}
            errorCode={VALIDATION_ERRORS.MISSING_FIELDS.errorCode}
          />
        </TestWrapper>
      );

      expect(screen.getByText('Missing Required Fields')).toBeInTheDocument();
      expect(screen.getByText(/VAL-002/)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      const { container } = render(
        <TestWrapper>
          <ErrorDisplay
            title="Test Error"
            message="Test message"
            suggestions={['Suggestion']}
          />
        </TestWrapper>
      );

      const errorContainer = container.querySelector('[role="alert"]');
      expect(errorContainer).toBeInTheDocument();
      expect(errorContainer).toHaveAttribute('aria-live', 'assertive');
      expect(errorContainer).toHaveAttribute('aria-atomic', 'true');
    });

    it('has accessible button labels', () => {
      render(
        <TestWrapper>
          <ErrorDisplay
            title="Test Error"
            message="Test message"
            suggestions={['Suggestion']}
            showRetry={true}
            onRetry={() => {}}
          />
        </TestWrapper>
      );

      const retryButton = screen.getByLabelText('Retry the failed operation');
      expect(retryButton).toBeInTheDocument();

      const homeButton = screen.getByLabelText('Return to dashboard');
      expect(homeButton).toBeInTheDocument();
    });
  });

  describe('ErrorDisplayCard', () => {
    it('renders with card styling by default', () => {
      const { container } = render(
        <TestWrapper>
          <ErrorDisplayCard
            title="Test Error"
            message="Test message"
            suggestions={['Suggestion']}
          />
        </TestWrapper>
      );

      expect(container.querySelector('.card')).toBeInTheDocument();
    });

    it('renders without card styling when showCard is false', () => {
      const { container } = render(
        <TestWrapper>
          <ErrorDisplayCard
            title="Test Error"
            message="Test message"
            suggestions={['Suggestion']}
            showCard={false}
          />
        </TestWrapper>
      );

      expect(container.querySelector('.card')).not.toBeInTheDocument();
    });
  });

  describe('Custom Styling', () => {
    it('applies custom className', () => {
      const { container } = render(
        <TestWrapper>
          <ErrorDisplay
            title="Test Error"
            message="Test message"
            suggestions={['Suggestion']}
            className="custom-class"
          />
        </TestWrapper>
      );

      expect(container.querySelector('.custom-class')).toBeInTheDocument();
    });
  });
});
