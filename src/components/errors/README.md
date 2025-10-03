# Error Handling System

Comprehensive error handling system for ArmoraCPO with reusable components and centralized error messages.

## Components

### ErrorDisplay

The main error display component that shows error information with actionable suggestions.

**Location:** `src/components/errors/ErrorDisplay.tsx`

#### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `title` | `string` | ✅ | - | Main error title displayed prominently |
| `message` | `string` | ✅ | - | Detailed error message explaining what went wrong |
| `suggestions` | `string[]` | ✅ | - | List of actionable suggestions to help resolve the issue |
| `errorCode` | `string` | ❌ | - | Optional error code for debugging and support reference |
| `showContactSupport` | `boolean` | ❌ | `true` | Whether to show the "Contact Support" link |
| `showRetry` | `boolean` | ❌ | `false` | Whether to show the "Retry" button |
| `onRetry` | `() => void` | ❌ | - | Callback function when retry button is clicked |
| `showGoHome` | `boolean` | ❌ | `true` | Whether to show the "Go to Dashboard" button |
| `supportEmail` | `string` | ❌ | `support@armora.co.uk` | Support email address |
| `className` | `string` | ❌ | `''` | Additional CSS class names |

#### Features

- ✅ Prominent error icon and title
- ✅ Clear error message
- ✅ Actionable suggestions list with bullet points
- ✅ Optional retry functionality
- ✅ Navigation to dashboard
- ✅ Contact support link with pre-filled email
- ✅ Error code for debugging
- ✅ Fully accessible (ARIA labels, semantic HTML)
- ✅ Mobile-first responsive design
- ✅ Smooth entrance animation with framer-motion
- ✅ Print-friendly styles

## Error Messages

Centralized error message constants organized by category.

**Location:** `src/utils/errorMessages.ts`

### Categories

1. **AUTH_ERRORS** - Authentication and authorization errors
2. **NETWORK_ERRORS** - Network and connectivity errors
3. **DATABASE_ERRORS** - Database and data errors
4. **VALIDATION_ERRORS** - Validation and input errors
5. **ASSIGNMENT_ERRORS** - Assignment and job errors
6. **LOCATION_ERRORS** - Location and GPS errors
7. **PAYMENT_ERRORS** - Payment and earnings errors
8. **COMPLIANCE_ERRORS** - Document and compliance errors

### Error Definition Structure

```typescript
interface ErrorDefinition {
  title: string;              // Error title
  message: string;            // Detailed message
  suggestions: readonly string[];  // Actionable suggestions
  errorCode: string;          // Unique error code (e.g., "AUTH-001")
}
```

## Usage Examples

### Basic Usage with Predefined Error

```tsx
import { ErrorDisplay } from '../components/errors/ErrorDisplay';
import { AUTH_ERRORS } from '../utils/errorMessages';

function MyComponent() {
  return (
    <ErrorDisplay
      title={AUTH_ERRORS.SESSION_EXPIRED.title}
      message={AUTH_ERRORS.SESSION_EXPIRED.message}
      suggestions={AUTH_ERRORS.SESSION_EXPIRED.suggestions}
      errorCode={AUTH_ERRORS.SESSION_EXPIRED.errorCode}
    />
  );
}
```

### With Retry Functionality

```tsx
import { ErrorDisplay } from '../components/errors/ErrorDisplay';
import { NETWORK_ERRORS } from '../utils/errorMessages';

function MyComponent() {
  const handleRetry = async () => {
    // Retry logic here
    await fetchData();
  };

  return (
    <ErrorDisplay
      title={NETWORK_ERRORS.CONNECTION_FAILED.title}
      message={NETWORK_ERRORS.CONNECTION_FAILED.message}
      suggestions={NETWORK_ERRORS.CONNECTION_FAILED.suggestions}
      errorCode={NETWORK_ERRORS.CONNECTION_FAILED.errorCode}
      showRetry={true}
      onRetry={handleRetry}
    />
  );
}
```

### Custom Error with ErrorDisplay

```tsx
import { ErrorDisplay } from '../components/errors/ErrorDisplay';

function MyComponent() {
  return (
    <ErrorDisplay
      title="Custom Error"
      message="Something specific went wrong in your app."
      suggestions={[
        'Check your input data',
        'Try a different approach',
        'Contact support if issue persists',
      ]}
      errorCode="CUSTOM-001"
      showRetry={true}
      onRetry={() => window.location.reload()}
    />
  );
}
```

### Using Error in a Try-Catch Block

```tsx
import { ErrorDisplay } from '../components/errors/ErrorDisplay';
import { DATABASE_ERRORS } from '../utils/errorMessages';
import { useState } from 'react';

function MyComponent() {
  const [error, setError] = useState<any>(null);

  const fetchData = async () => {
    try {
      const response = await supabase
        .from('protection_assignments')
        .select('*');

      if (response.error) throw response.error;

    } catch (err) {
      setError(DATABASE_ERRORS.QUERY_FAILED);
    }
  };

  if (error) {
    return (
      <ErrorDisplay
        title={error.title}
        message={error.message}
        suggestions={error.suggestions}
        errorCode={error.errorCode}
        showRetry={true}
        onRetry={fetchData}
      />
    );
  }

  return <div>Content here...</div>;
}
```

### Error Boundary Integration

```tsx
import React from 'react';
import { ErrorDisplay } from '../components/errors/ErrorDisplay';
import { UNKNOWN_ERROR } from '../utils/errorMessages';

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorDisplay
          title={UNKNOWN_ERROR.title}
          message={UNKNOWN_ERROR.message}
          suggestions={UNKNOWN_ERROR.suggestions}
          errorCode={UNKNOWN_ERROR.errorCode}
          showRetry={true}
          onRetry={() => window.location.reload()}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

### Using ErrorDisplayCard for Inline Errors

```tsx
import { ErrorDisplayCard } from '../components/errors/ErrorDisplay';
import { VALIDATION_ERRORS } from '../utils/errorMessages';

function MyForm() {
  const [showError, setShowError] = useState(false);

  if (showError) {
    return (
      <ErrorDisplayCard
        title={VALIDATION_ERRORS.MISSING_FIELDS.title}
        message={VALIDATION_ERRORS.MISSING_FIELDS.message}
        suggestions={VALIDATION_ERRORS.MISSING_FIELDS.suggestions}
        errorCode={VALIDATION_ERRORS.MISSING_FIELDS.errorCode}
        showRetry={false}
        showGoHome={false}
      />
    );
  }

  return <form>...</form>;
}
```

### Create Custom Error Definition

```tsx
import { createCustomError } from '../utils/errorMessages';
import { ErrorDisplay } from '../components/errors/ErrorDisplay';

function MyComponent() {
  const customError = createCustomError(
    'Feature Unavailable',
    'This feature is currently under maintenance and will be available soon.',
    [
      'Check back in a few hours',
      'Use an alternative feature',
      'Contact support for more information',
    ],
    'MAINT-001'
  );

  return (
    <ErrorDisplay
      title={customError.title}
      message={customError.message}
      suggestions={customError.suggestions}
      errorCode={customError.errorCode}
      showGoHome={true}
    />
  );
}
```

### Get Error by Code (Support/Debugging)

```tsx
import { getErrorByCode } from '../utils/errorMessages';

// Useful for debugging or support tools
const error = getErrorByCode('AUTH-001');

if (error) {
  console.log('Error:', error.title);
  console.log('Message:', error.message);
  console.log('Suggestions:', error.suggestions);
}
```

## All Available Error Codes

### Authentication (AUTH-XXX)
- `AUTH-001` - Profile Not Found
- `AUTH-002` - Session Expired
- `AUTH-003` - Invalid Credentials
- `AUTH-004` - Unverified Account
- `AUTH-005` - Permission Denied
- `AUTH-006` - Token Invalid

### Network (NET-XXX)
- `NET-001` - Connection Failed
- `NET-002` - Timeout
- `NET-003` - No Internet
- `NET-004` - Server Error
- `NET-005` - Rate Limit

### Database (DB-XXX)
- `DB-001` - Query Failed
- `DB-002` - Permission Denied
- `DB-003` - Not Found
- `DB-004` - Duplicate Entry
- `DB-005` - Constraint Violation

### Validation (VAL-XXX)
- `VAL-001` - Invalid Input
- `VAL-002` - Missing Fields
- `VAL-003` - File Too Large
- `VAL-004` - Invalid File Type
- `VAL-005` - Invalid Date
- `VAL-006` - Invalid Phone
- `VAL-007` - Invalid Email
- `VAL-008` - Password Too Weak

### Assignment (ASSIGN-XXX)
- `ASSIGN-001` - Already Assigned
- `ASSIGN-002` - Not Available
- `ASSIGN-003` - Invalid Status
- `ASSIGN-004` - Cancellation Failed

### Location (LOC-XXX)
- `LOC-001` - Permission Denied
- `LOC-002` - Unavailable
- `LOC-003` - Timeout

### Payment (PAY-XXX)
- `PAY-001` - Processing Failed
- `PAY-002` - Insufficient Balance
- `PAY-003` - Bank Details Missing

### Compliance (COMP-XXX)
- `COMP-001` - Expired License
- `COMP-002` - Missing Documents
- `COMP-003` - Document Rejected

### Unknown (UNKNOWN-XXX)
- `UNKNOWN-000` - Unexpected Error

## Styling

All styles are in `ErrorDisplay.css` and use the Armora design system:

- Uses CSS variables from `global.css` (--armora-*)
- Mobile-first responsive design
- Animations with framer-motion
- Fully accessible (ARIA labels, semantic HTML)
- High contrast mode support
- Print-friendly styles

## Best Practices

1. **Always use predefined errors when available** - This ensures consistency
2. **Provide actionable suggestions** - Help users resolve the issue
3. **Include error codes** - Makes debugging and support easier
4. **Use retry for transient errors** - Network errors, timeouts, etc.
5. **Hide "Go Home" for inline errors** - Use ErrorDisplayCard for forms
6. **Keep messages clear and concise** - Avoid technical jargon
7. **Test accessibility** - Use screen readers to verify ARIA labels

## Accessibility

The ErrorDisplay component is fully accessible:

- ✅ Semantic HTML (`role="alert"`, `aria-live="assertive"`)
- ✅ ARIA labels for all interactive elements
- ✅ Keyboard navigation support
- ✅ Screen reader friendly
- ✅ High contrast mode support
- ✅ Focus management

## Mobile Responsive

- ✅ Mobile-first design
- ✅ Touch-friendly buttons (44px minimum)
- ✅ Readable text sizes on small screens
- ✅ Proper spacing and padding
- ✅ Stack buttons on mobile, row on tablet+

## Testing

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorDisplay } from '../errors/ErrorDisplay';
import { AUTH_ERRORS } from '../../utils/errorMessages';

describe('ErrorDisplay', () => {
  it('renders error title and message', () => {
    render(
      <ErrorDisplay
        title={AUTH_ERRORS.SESSION_EXPIRED.title}
        message={AUTH_ERRORS.SESSION_EXPIRED.message}
        suggestions={AUTH_ERRORS.SESSION_EXPIRED.suggestions}
      />
    );

    expect(screen.getByText('Session Expired')).toBeInTheDocument();
  });

  it('calls onRetry when retry button is clicked', () => {
    const onRetry = jest.fn();

    render(
      <ErrorDisplay
        title="Test Error"
        message="Test message"
        suggestions={['Test suggestion']}
        showRetry={true}
        onRetry={onRetry}
      />
    );

    fireEvent.click(screen.getByText('Try Again'));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
```

## Support

For issues or questions about the error handling system:
- Check this README
- Review the code comments in `ErrorDisplay.tsx` and `errorMessages.ts`
- Contact the development team
