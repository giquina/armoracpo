# ErrorDisplay Quick Start Guide

## 5-Minute Setup

### 1. Basic Import

```tsx
import { ErrorDisplay } from '@/components/errors';
import { AUTH_ERRORS } from '@/utils/errorMessages';
```

### 2. Basic Usage

```tsx
<ErrorDisplay
  title={AUTH_ERRORS.SESSION_EXPIRED.title}
  message={AUTH_ERRORS.SESSION_EXPIRED.message}
  suggestions={AUTH_ERRORS.SESSION_EXPIRED.suggestions}
  errorCode={AUTH_ERRORS.SESSION_EXPIRED.errorCode}
/>
```

### 3. With Retry

```tsx
<ErrorDisplay
  {...NETWORK_ERRORS.CONNECTION_FAILED}
  showRetry={true}
  onRetry={() => refetch()}
/>
```

### 4. Inline Card

```tsx
<ErrorDisplayCard
  {...VALIDATION_ERRORS.MISSING_FIELDS}
  showGoHome={false}
/>
```

## Common Patterns

### In a Component with State

```tsx
const [error, setError] = useState(null);

if (error) {
  return <ErrorDisplay {...error} showRetry onRetry={() => setError(null)} />;
}
```

### In a Try-Catch

```tsx
try {
  await someOperation();
} catch (err) {
  setError(DATABASE_ERRORS.QUERY_FAILED);
}
```

### In a Query Hook

```tsx
const { data, error, refetch } = useQuery(...);

if (error) {
  return (
    <ErrorDisplay
      {...NETWORK_ERRORS.CONNECTION_FAILED}
      showRetry
      onRetry={refetch}
    />
  );
}
```

## All Error Categories

Import from `@/utils/errorMessages`:

- `AUTH_ERRORS` - Authentication issues
- `NETWORK_ERRORS` - Connectivity problems
- `DATABASE_ERRORS` - Data access errors
- `VALIDATION_ERRORS` - Form/input errors
- `ASSIGNMENT_ERRORS` - Job-related errors
- `LOCATION_ERRORS` - GPS/location errors
- `PAYMENT_ERRORS` - Payment issues
- `COMPLIANCE_ERRORS` - SIA compliance errors

## Props Quick Reference

| Prop | Type | Required | Default |
|------|------|----------|---------|
| `title` | string | ✅ | - |
| `message` | string | ✅ | - |
| `suggestions` | string[] | ✅ | - |
| `errorCode` | string | ❌ | - |
| `showRetry` | boolean | ❌ | false |
| `onRetry` | function | ❌ | - |
| `showGoHome` | boolean | ❌ | true |
| `showContactSupport` | boolean | ❌ | true |

## Testing the Component

Use the demo component:

```tsx
import { ErrorDisplayDemo } from '@/components/errors/ErrorDisplayDemo';

// Add to any dev screen
<ErrorDisplayDemo />
```

## Need Help?

- See `README.md` for full documentation
- See `IMPLEMENTATION_SUMMARY.md` for details
- Check `ErrorDisplayDemo.tsx` for examples
