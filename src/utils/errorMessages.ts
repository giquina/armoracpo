/**
 * Centralized error messages and error handling utilities for ArmoraCPO
 *
 * This module provides consistent error messages, codes, and actionable suggestions
 * for various error scenarios throughout the application.
 */

export interface ErrorDefinition {
  title: string;
  message: string;
  suggestions: readonly string[];
  errorCode: string;
}

/**
 * Authentication and Authorization Errors
 */
export const AUTH_ERRORS = {
  PROFILE_NOT_FOUND: {
    title: 'Profile Not Found',
    message: 'Your CPO profile could not be located. This may occur if your account has not been fully set up or has been removed from the system.',
    suggestions: [
      'Verify you are using the correct email address',
      'Check if your account registration was completed',
      'Contact support if you recently registered',
      'Try signing out and signing back in',
    ],
    errorCode: 'AUTH-001',
  },
  SESSION_EXPIRED: {
    title: 'Session Expired',
    message: 'Your authentication session has expired for security reasons. Please sign in again to continue.',
    suggestions: [
      'Click the button below to return to the login screen',
      'Sign in with your credentials to resume your session',
      'Enable "Remember Me" to stay signed in longer',
    ],
    errorCode: 'AUTH-002',
  },
  INVALID_CREDENTIALS: {
    title: 'Invalid Credentials',
    message: 'The email address or password you entered is incorrect. Please check your credentials and try again.',
    suggestions: [
      'Verify your email address is spelled correctly',
      'Check that Caps Lock is not enabled',
      'Use the "Forgot Password" link to reset your password',
      'Ensure you are using the correct account',
    ],
    errorCode: 'AUTH-003',
  },
  UNVERIFIED_ACCOUNT: {
    title: 'Account Not Verified',
    message: 'Your CPO account is pending verification. Only verified SIA-licensed officers can access the platform.',
    suggestions: [
      'Check your email for verification instructions',
      'Ensure your SIA license documents have been submitted',
      'Wait for admin approval (typically 24-48 hours)',
      'Contact support if verification is taking longer than expected',
    ],
    errorCode: 'AUTH-004',
  },
  PERMISSION_DENIED: {
    title: 'Access Denied',
    message: 'You do not have permission to access this resource or perform this action.',
    suggestions: [
      'Verify your account has the required permissions',
      'Check if your SIA license is current and valid',
      'Contact your administrator for access',
      'Return to the dashboard and try a different action',
    ],
    errorCode: 'AUTH-005',
  },
  TOKEN_INVALID: {
    title: 'Invalid Authentication Token',
    message: 'Your authentication token is invalid or has been revoked. Please sign in again.',
    suggestions: [
      'Sign out and sign back in',
      'Clear your browser cache and cookies',
      'Ensure you are not signed in on another device',
    ],
    errorCode: 'AUTH-006',
  },
} as const;

/**
 * Network and Connectivity Errors
 */
export const NETWORK_ERRORS = {
  CONNECTION_FAILED: {
    title: 'Connection Failed',
    message: 'Unable to establish a connection to the server. Please check your internet connection and try again.',
    suggestions: [
      'Check that you are connected to the internet',
      'Try switching between WiFi and mobile data',
      'Disable VPN if you are using one',
      'Wait a moment and try again',
    ],
    errorCode: 'NET-001',
  },
  TIMEOUT: {
    title: 'Request Timeout',
    message: 'The server took too long to respond. This may be due to a slow internet connection or high server load.',
    suggestions: [
      'Check your internet connection speed',
      'Try again in a few moments',
      'Move to an area with better signal strength',
      'Close other apps using bandwidth',
    ],
    errorCode: 'NET-002',
  },
  NO_INTERNET: {
    title: 'No Internet Connection',
    message: 'You appear to be offline. Some features may not be available until you reconnect to the internet.',
    suggestions: [
      'Enable WiFi or mobile data on your device',
      'Check airplane mode is disabled',
      'Verify your data plan is active',
      'Move to an area with better coverage',
    ],
    errorCode: 'NET-003',
  },
  SERVER_ERROR: {
    title: 'Server Error',
    message: 'The server encountered an unexpected error while processing your request. Our team has been notified.',
    suggestions: [
      'Wait a few minutes and try again',
      'Check the status page for known issues',
      'Try a different action to verify your connection',
      'Contact support if the problem persists',
    ],
    errorCode: 'NET-004',
  },
  RATE_LIMIT: {
    title: 'Too Many Requests',
    message: 'You have made too many requests in a short period. Please wait before trying again.',
    suggestions: [
      'Wait 60 seconds before retrying',
      'Avoid rapidly clicking buttons or refreshing',
      'Contact support if you need higher rate limits',
    ],
    errorCode: 'NET-005',
  },
} as const;

/**
 * Database and Data Errors
 */
export const DATABASE_ERRORS = {
  QUERY_FAILED: {
    title: 'Database Error',
    message: 'A database error occurred while processing your request. Please try again.',
    suggestions: [
      'Refresh the page and try again',
      'Check if the data you entered is valid',
      'Clear your browser cache',
      'Contact support if the error persists',
    ],
    errorCode: 'DB-001',
  },
  PERMISSION_DENIED: {
    title: 'Database Access Denied',
    message: 'You do not have permission to access this data due to security policies.',
    suggestions: [
      'Verify you are signed in with the correct account',
      'Check that your account has been verified',
      'Contact support to verify your permissions',
    ],
    errorCode: 'DB-002',
  },
  NOT_FOUND: {
    title: 'Resource Not Found',
    message: 'The requested resource could not be found. It may have been deleted or moved.',
    suggestions: [
      'Verify the URL or ID is correct',
      'Check if the resource was recently deleted',
      'Return to the previous page and try again',
      'Use the search function to locate the resource',
    ],
    errorCode: 'DB-003',
  },
  DUPLICATE_ENTRY: {
    title: 'Duplicate Entry',
    message: 'A record with this information already exists in the system.',
    suggestions: [
      'Check if you already created this entry',
      'Use a different identifier or value',
      'Update the existing record instead',
    ],
    errorCode: 'DB-004',
  },
  CONSTRAINT_VIOLATION: {
    title: 'Data Constraint Violation',
    message: 'The operation could not be completed because it would violate database constraints.',
    suggestions: [
      'Ensure all required fields are filled',
      'Check that referenced records exist',
      'Verify data relationships are valid',
      'Contact support for assistance',
    ],
    errorCode: 'DB-005',
  },
} as const;

/**
 * Validation and Input Errors
 */
export const VALIDATION_ERRORS = {
  INVALID_INPUT: {
    title: 'Invalid Input',
    message: 'The information you provided is not valid. Please check your input and try again.',
    suggestions: [
      'Review all form fields for errors',
      'Ensure required fields are not empty',
      'Check that data formats are correct (email, phone, etc.)',
      'Remove any special characters that may not be allowed',
    ],
    errorCode: 'VAL-001',
  },
  MISSING_FIELDS: {
    title: 'Missing Required Fields',
    message: 'One or more required fields are empty. Please complete all required fields.',
    suggestions: [
      'Look for fields marked with an asterisk (*)',
      'Scroll through the form to find empty fields',
      'Fill in all mandatory information',
    ],
    errorCode: 'VAL-002',
  },
  FILE_TOO_LARGE: {
    title: 'File Too Large',
    message: 'The file you are trying to upload exceeds the maximum allowed size of 5MB.',
    suggestions: [
      'Compress the file before uploading',
      'Use a smaller image or document',
      'Split large files into multiple uploads',
      'Contact support if you need to upload larger files',
    ],
    errorCode: 'VAL-003',
  },
  INVALID_FILE_TYPE: {
    title: 'Invalid File Type',
    message: 'The file type you are trying to upload is not supported.',
    suggestions: [
      'Use supported formats: PDF, JPG, PNG, or DOCX',
      'Convert your file to a supported format',
      'Verify the file extension is correct',
    ],
    errorCode: 'VAL-004',
  },
  INVALID_DATE: {
    title: 'Invalid Date',
    message: 'The date you entered is not valid or is outside the acceptable range.',
    suggestions: [
      'Check the date format matches the expected format',
      'Ensure the date is not in the past (if required)',
      'Verify month, day, and year are valid',
    ],
    errorCode: 'VAL-005',
  },
  INVALID_PHONE: {
    title: 'Invalid Phone Number',
    message: 'The phone number format is invalid. Please enter a valid UK phone number.',
    suggestions: [
      'Use format: +44 7XXX XXXXXX or 07XXX XXXXXX',
      'Remove any extra spaces or special characters',
      'Ensure the number includes the correct country code',
    ],
    errorCode: 'VAL-006',
  },
  INVALID_EMAIL: {
    title: 'Invalid Email Address',
    message: 'The email address you entered is not in a valid format.',
    suggestions: [
      'Check for typos in the email address',
      'Ensure it includes @ and a domain (e.g., .com, .co.uk)',
      'Remove any spaces before or after the email',
    ],
    errorCode: 'VAL-007',
  },
  PASSWORD_TOO_WEAK: {
    title: 'Password Too Weak',
    message: 'Your password does not meet the minimum security requirements.',
    suggestions: [
      'Use at least 8 characters',
      'Include uppercase and lowercase letters',
      'Add at least one number and one special character',
      'Avoid common words or patterns',
    ],
    errorCode: 'VAL-008',
  },
} as const;

/**
 * Assignment and Job Errors
 */
export const ASSIGNMENT_ERRORS = {
  ALREADY_ASSIGNED: {
    title: 'Assignment Already Taken',
    message: 'This assignment has already been accepted by another CPO. Please browse other available assignments.',
    suggestions: [
      'Return to the available jobs list',
      'Enable notifications to be alerted of new assignments',
      'Refresh the page to see current available jobs',
    ],
    errorCode: 'ASSIGN-001',
  },
  NOT_AVAILABLE: {
    title: 'CPO Not Available',
    message: 'You cannot accept assignments while your status is set to "Stand Down" or "Busy".',
    suggestions: [
      'Set your status to "Operational" on the dashboard',
      'Complete your current assignment before accepting new ones',
      'Check your availability settings in your profile',
    ],
    errorCode: 'ASSIGN-002',
  },
  INVALID_STATUS: {
    title: 'Invalid Assignment Status',
    message: 'This action cannot be performed due to the current assignment status.',
    suggestions: [
      'Verify the assignment is in the correct status',
      'Refresh the page to see the latest status',
      'Contact the assignment coordinator for assistance',
    ],
    errorCode: 'ASSIGN-003',
  },
  CANCELLATION_FAILED: {
    title: 'Cannot Cancel Assignment',
    message: 'This assignment cannot be cancelled at this time. Active or completed assignments cannot be cancelled.',
    suggestions: [
      'Contact support for assistance with active assignments',
      'Check if the assignment has already started',
      'Review the cancellation policy in your contract',
    ],
    errorCode: 'ASSIGN-004',
  },
} as const;

/**
 * Location and GPS Errors
 */
export const LOCATION_ERRORS = {
  PERMISSION_DENIED: {
    title: 'Location Permission Denied',
    message: 'Location access is required for assignment tracking but has been denied.',
    suggestions: [
      'Enable location permissions in your device settings',
      'Go to Settings > Privacy > Location Services',
      'Grant "Always" or "While Using" permission to ArmoraCPO',
      'Restart the app after changing permissions',
    ],
    errorCode: 'LOC-001',
  },
  UNAVAILABLE: {
    title: 'Location Unavailable',
    message: 'Your device location could not be determined at this time.',
    suggestions: [
      'Ensure GPS is enabled on your device',
      'Move to an area with better GPS signal',
      'Check that location services are not disabled',
      'Try restarting your device',
    ],
    errorCode: 'LOC-002',
  },
  TIMEOUT: {
    title: 'Location Timeout',
    message: 'Location acquisition timed out. Your device may have weak GPS signal.',
    suggestions: [
      'Move outdoors or near a window',
      'Wait a moment for GPS to initialize',
      'Ensure no apps are blocking location services',
    ],
    errorCode: 'LOC-003',
  },
} as const;

/**
 * Payment and Earnings Errors
 */
export const PAYMENT_ERRORS = {
  PROCESSING_FAILED: {
    title: 'Payment Processing Failed',
    message: 'Your payment could not be processed at this time. Please try again later.',
    suggestions: [
      'Verify your bank details are correct',
      'Check if your account is in good standing',
      'Wait for the next payment cycle',
      'Contact support for payment issues',
    ],
    errorCode: 'PAY-001',
  },
  INSUFFICIENT_BALANCE: {
    title: 'Insufficient Balance',
    message: 'Your earnings balance is below the minimum withdrawal threshold.',
    suggestions: [
      'Complete more assignments to increase your balance',
      'Check the minimum withdrawal amount (typically £50)',
      'Wait until your balance meets the threshold',
    ],
    errorCode: 'PAY-002',
  },
  BANK_DETAILS_MISSING: {
    title: 'Bank Details Required',
    message: 'Bank account details are required to receive payments.',
    suggestions: [
      'Go to Profile > Bank Details',
      'Add your bank account information',
      'Verify all required fields are completed',
      'Save your changes before requesting payment',
    ],
    errorCode: 'PAY-003',
  },
} as const;

/**
 * Document and Compliance Errors
 */
export const COMPLIANCE_ERRORS = {
  EXPIRED_LICENSE: {
    title: 'SIA License Expired',
    message: 'Your SIA license has expired. You cannot accept assignments until your license is renewed.',
    suggestions: [
      'Renew your SIA license immediately',
      'Upload your renewed license in the Compliance section',
      'Contact SIA for renewal information: 0300 123 1300',
      'Your account will be reactivated after verification',
    ],
    errorCode: 'COMP-001',
  },
  MISSING_DOCUMENTS: {
    title: 'Missing Required Documents',
    message: 'One or more required compliance documents are missing from your profile.',
    suggestions: [
      'Go to Profile > Documents',
      'Upload all required SIA documentation',
      'Ensure documents are clear and readable',
      'Wait for admin verification after upload',
    ],
    errorCode: 'COMP-002',
  },
  DOCUMENT_REJECTED: {
    title: 'Document Rejected',
    message: 'One of your uploaded documents has been rejected due to quality or validity concerns.',
    suggestions: [
      'Check your email for rejection details',
      'Upload a new, clear copy of the document',
      'Ensure the document is current and valid',
      'Contact support if you need clarification',
    ],
    errorCode: 'COMP-003',
  },
} as const;

/**
 * Helper function to get error by code
 */
export const getErrorByCode = (code: string): ErrorDefinition | null => {
  const allErrors = {
    ...AUTH_ERRORS,
    ...NETWORK_ERRORS,
    ...DATABASE_ERRORS,
    ...VALIDATION_ERRORS,
    ...ASSIGNMENT_ERRORS,
    ...LOCATION_ERRORS,
    ...PAYMENT_ERRORS,
    ...COMPLIANCE_ERRORS,
  };

  for (const error of Object.values(allErrors)) {
    if (error.errorCode === code) {
      return error;
    }
  }

  return null;
};

/**
 * Generic unknown error for unexpected scenarios
 */
export const UNKNOWN_ERROR: ErrorDefinition = {
  title: 'Unexpected Error',
  message: 'An unexpected error occurred. Our team has been notified and is working to resolve the issue.',
  suggestions: [
    'Try refreshing the page',
    'Sign out and sign back in',
    'Clear your browser cache',
    'Contact support if the problem persists',
  ],
  errorCode: 'UNKNOWN-000',
};

/**
 * Helper function to create custom error definitions
 */
export const createCustomError = (
  title: string,
  message: string,
  suggestions: string[],
  errorCode?: string
): ErrorDefinition => {
  return {
    title,
    message,
    suggestions,
    errorCode: errorCode || 'CUSTOM-000',
  };
};
