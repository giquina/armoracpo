# ⚛️ React Best Practices for Armora CPO Mobile App

## Overview

This document outlines React best practices specifically tailored for the Armora CPO mobile app. Focus: **mobile-first**, **performance**, **security**, and **maintainability**.

---

## 📱 Mobile-First React Patterns

### **1. Component Structure**

```typescript
// ✅ GOOD: Mobile-optimized component structure
// src/components/assignment/AssignmentCard.tsx

import React, { memo } from 'react';
import { Assignment } from '@/types';
import styles from './AssignmentCard.module.css';

interface AssignmentCardProps {
  assignment: Assignment;
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
}

const AssignmentCard = memo<AssignmentCardProps>(({
  assignment,
  onAccept,
  onDecline
}) => {
  return (
    <article className={styles.card} aria-label="Available assignment">
      <header className={styles.header}>
        <time className={styles.time}>
          {assignment.scheduledStart}
        </time>
        <span className={styles.distance}>
          {assignment.distance} miles away
        </span>
      </header>

      <div className={styles.details}>
        <h3 className={styles.type}>{assignment.type}</h3>
        <p className={styles.location}>
          From: {assignment.pickupAddress}
        </p>
        <p className={styles.destination}>
          To: {assignment.destinationAddress}
        </p>
      </div>

      <footer className={styles.actions}>
        <button
          onClick={() => onAccept(assignment.id)}
          className={styles.acceptBtn}
          aria-label="Accept assignment"
        >
          Accept
        </button>
        <button
          onClick={() => onDecline(assignment.id)}
          className={styles.declineBtn}
          aria-label="Decline assignment"
        >
          Decline
        </button>
      </footer>
    </article>
  );
});

AssignmentCard.displayName = 'AssignmentCard';

export default AssignmentCard;
```

```css
/* AssignmentCard.module.css */

.card {
  /* Mobile-first: 320px minimum */
  width: 100%;
  max-width: 100%;
  min-height: 200px;
  background: var(--navy-dark);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);

  /* Touch-friendly */
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

.acceptBtn,
.declineBtn {
  /* Minimum 44px for touch targets */
  min-height: 44px;
  min-width: 140px;
  font-size: 16px; /* Prevent zoom on iOS */
  border-radius: 8px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: transform 0.1s ease;

  /* Touch feedback */
  -webkit-tap-highlight-color: rgba(255, 215, 0, 0.3);
}

.acceptBtn:active,
.declineBtn:active {
  transform: scale(0.98);
}

/* Tablet and up */
@media (min-width: 768px) {
  .card {
    max-width: 500px;
  }
}
```

---

### **2. Screen-Level Components**

```typescript
// ✅ GOOD: Screen component with mobile optimizations
// src/screens/Dashboard/DashboardScreen.tsx

import React, { Suspense, lazy } from 'react';
import { useCPO, useAssignments, useCompliance } from '@/hooks';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorBoundary from '@/components/common/ErrorBoundary';

// Lazy load heavy components
const ActiveAssignmentCard = lazy(() => import('@/components/assignment/ActiveAssignmentCard'));
const QuickStats = lazy(() => import('@/components/dashboard/QuickStats'));
const ComplianceAlerts = lazy(() => import('@/components/compliance/ComplianceAlerts'));

const DashboardScreen: React.FC = () => {
  const { cpo, updateStatus } = useCPO();
  const { activeAssignment } = useAssignments();
  const { alerts } = useCompliance();

  return (
    <ErrorBoundary>
      <div className="dashboard-screen">
        {/* Header - always visible */}
        <header className="dashboard-header">
          <div className="cpo-info">
            <img
              src={cpo.photoUrl}
              alt={cpo.fullName}
              className="cpo-photo"
              loading="lazy"
            />
            <div>
              <h1>{cpo.fullName}</h1>
              <p className="sia-status">
                SIA: {cpo.siaStatus === 'valid' ? '✅ Valid' : '⚠️ Check'}
              </p>
            </div>
          </div>

          <OperationalToggle
            status={cpo.operationalStatus}
            onChange={updateStatus}
          />
        </header>

        {/* Active assignment - priority content */}
        {activeAssignment && (
          <Suspense fallback={<LoadingSpinner />}>
            <ActiveAssignmentCard assignment={activeAssignment} />
          </Suspense>
        )}

        {/* Quick stats - lazy loaded */}
        <Suspense fallback={<LoadingSpinner />}>
          <QuickStats />
        </Suspense>

        {/* Compliance alerts - lazy loaded */}
        {alerts.length > 0 && (
          <Suspense fallback={<LoadingSpinner />}>
            <ComplianceAlerts alerts={alerts} />
          </Suspense>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default DashboardScreen;
```

---

## 🚀 Performance Optimization Patterns

### **1. Memoization & Re-render Prevention**

```typescript
// ✅ GOOD: Proper use of React.memo, useMemo, useCallback

import React, { memo, useMemo, useCallback } from 'react';

interface AssignmentListProps {
  assignments: Assignment[];
  onSelect: (id: string) => void;
}

const AssignmentList = memo<AssignmentListProps>(({ assignments, onSelect }) => {
  // Memoize expensive computations
  const sortedAssignments = useMemo(() => {
    return [...assignments].sort((a, b) => {
      return a.distance - b.distance;
    });
  }, [assignments]);

  // Memoize callbacks to prevent child re-renders
  const handleSelect = useCallback((id: string) => {
    onSelect(id);
  }, [onSelect]);

  return (
    <div className="assignment-list">
      {sortedAssignments.map((assignment) => (
        <AssignmentCard
          key={assignment.id}
          assignment={assignment}
          onSelect={handleSelect}
        />
      ))}
    </div>
  );
});

AssignmentList.displayName = 'AssignmentList';

export default AssignmentList;
```

```typescript
// ❌ BAD: Unnecessary re-renders

const AssignmentList = ({ assignments, onSelect }) => {
  // Creates new array on every render
  const sortedAssignments = [...assignments].sort((a, b) => {
    return a.distance - b.distance;
  });

  return (
    <div>
      {sortedAssignments.map((assignment) => (
        <AssignmentCard
          assignment={assignment}
          // Creates new function on every render
          onSelect={() => onSelect(assignment.id)}
        />
      ))}
    </div>
  );
};
```

---

### **2. Lazy Loading & Code Splitting**

```typescript
// ✅ GOOD: Route-based code splitting

import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoadingScreen from '@/components/common/LoadingScreen';

// Lazy load all screens
const DashboardScreen = lazy(() => import('@/screens/Dashboard/DashboardScreen'));
const AssignmentsScreen = lazy(() => import('@/screens/Assignments/AssignmentsScreen'));
const ProfileScreen = lazy(() => import('@/screens/Profile/ProfileScreen'));
const ComplianceScreen = lazy(() => import('@/screens/Compliance/ComplianceScreen'));
const EarningsScreen = lazy(() => import('@/screens/Earnings/EarningsScreen'));

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/" element={<DashboardScreen />} />
          <Route path="/assignments" element={<AssignmentsScreen />} />
          <Route path="/profile" element={<ProfileScreen />} />
          <Route path="/compliance" element={<ComplianceScreen />} />
          <Route path="/earnings" element={<EarningsScreen />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default App;
```

---

### **3. Virtual Scrolling for Long Lists**

```typescript
// ✅ GOOD: Virtual scrolling for assignment history

import React from 'react';
import { FixedSizeList as List } from 'react-window';
import { useAssignmentHistory } from '@/hooks';

const AssignmentHistory: React.FC = () => {
  const { assignments } = useAssignmentHistory();

  const Row = ({ index, style }) => (
    <div style={style}>
      <AssignmentHistoryCard assignment={assignments[index]} />
    </div>
  );

  return (
    <List
      height={600}
      itemCount={assignments.length}
      itemSize={120}
      width="100%"
    >
      {Row}
    </List>
  );
};

export default AssignmentHistory;
```

---

### **4. Image Optimization**

```typescript
// ✅ GOOD: Optimized image loading

import React from 'react';

interface CPOPhotoProps {
  url: string;
  alt: string;
  size?: 'small' | 'medium' | 'large';
}

const CPOPhoto: React.FC<CPOPhotoProps> = ({ url, alt, size = 'medium' }) => {
  const sizes = {
    small: '64px',
    medium: '128px',
    large: '256px'
  };

  return (
    <picture>
      {/* WebP for modern browsers */}
      <source
        srcSet={`${url}?format=webp&w=${sizes[size]}`}
        type="image/webp"
      />
      {/* Fallback to JPEG */}
      <img
        src={`${url}?format=jpeg&w=${sizes[size]}`}
        alt={alt}
        loading="lazy"
        decoding="async"
        width={sizes[size]}
        height={sizes[size]}
      />
    </picture>
  );
};

export default CPOPhoto;
```

---

## 🎣 Custom Hooks Patterns

### **1. API Hooks**

```typescript
// src/hooks/useAssignments.ts

import { useState, useEffect, useCallback } from 'react';
import { Assignment } from '@/types';
import { assignmentsAPI } from '@/services/api';

interface UseAssignmentsReturn {
  assignments: Assignment[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  acceptAssignment: (id: string) => Promise<void>;
  declineAssignment: (id: string) => Promise<void>;
}

export const useAssignments = (): UseAssignmentsReturn => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAssignments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await assignmentsAPI.getAvailable();
      setAssignments(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  const acceptAssignment = useCallback(async (id: string) => {
    try {
      await assignmentsAPI.accept(id);
      await fetchAssignments(); // Refresh list
    } catch (err) {
      throw err;
    }
  }, [fetchAssignments]);

  const declineAssignment = useCallback(async (id: string) => {
    try {
      await assignmentsAPI.decline(id);
      // Optimistic update
      setAssignments(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      // Rollback on error
      await fetchAssignments();
      throw err;
    }
  }, [fetchAssignments]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  return {
    assignments,
    loading,
    error,
    refetch: fetchAssignments,
    acceptAssignment,
    declineAssignment
  };
};
```

---

### **2. Geolocation Hook**

```typescript
// src/hooks/useGeolocation.ts

import { useState, useEffect, useCallback } from 'react';

interface Coordinates {
  latitude: number;
  longitude: number;
  accuracy: number;
}

interface UseGeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  watch?: boolean; // Continuous tracking
}

interface UseGeolocationReturn {
  coordinates: Coordinates | null;
  error: GeolocationPositionError | null;
  loading: boolean;
  refresh: () => void;
}

export const useGeolocation = (
  options: UseGeolocationOptions = {}
): UseGeolocationReturn => {
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [error, setError] = useState<GeolocationPositionError | null>(null);
  const [loading, setLoading] = useState(true);

  const {
    enableHighAccuracy = true,
    timeout = 10000,
    maximumAge = 0,
    watch = false
  } = options;

  const onSuccess = useCallback((position: GeolocationPosition) => {
    setCoordinates({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy
    });
    setError(null);
    setLoading(false);
  }, []);

  const onError = useCallback((err: GeolocationPositionError) => {
    setError(err);
    setLoading(false);
  }, []);

  const refresh = useCallback(() => {
    setLoading(true);
    navigator.geolocation.getCurrentPosition(onSuccess, onError, {
      enableHighAccuracy,
      timeout,
      maximumAge
    });
  }, [enableHighAccuracy, timeout, maximumAge, onSuccess, onError]);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError({
        code: 0,
        message: 'Geolocation not supported',
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3
      } as GeolocationPositionError);
      setLoading(false);
      return;
    }

    let watchId: number | null = null;

    if (watch) {
      // Continuous tracking
      watchId = navigator.geolocation.watchPosition(
        onSuccess,
        onError,
        { enableHighAccuracy, timeout, maximumAge }
      );
    } else {
      // One-time location
      refresh();
    }

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watch, enableHighAccuracy, timeout, maximumAge, onSuccess, onError, refresh]);

  return { coordinates, error, loading, refresh };
};
```

**Usage:**
```typescript
// In component
const { coordinates, error, loading } = useGeolocation({
  watch: true, // Continuous tracking
  enableHighAccuracy: true
});

// Update location to backend every 30 seconds
useEffect(() => {
  if (coordinates) {
    const interval = setInterval(() => {
      updateLocationAPI(coordinates);
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }
}, [coordinates]);
```

---

### **3. Real-time Updates Hook**

```typescript
// src/hooks/useRealtime.ts

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/services/supabase';

interface UseRealtimeOptions<T> {
  table: string;
  filter?: string;
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
}

export const useRealtime = <T>({
  table,
  filter,
  event = '*'
}: UseRealtimeOptions<T>) => {
  const [data, setData] = useState<T | null>(null);

  useEffect(() => {
    const channel = supabase
      .channel(`realtime-${table}`)
      .on(
        'postgres_changes',
        {
          event,
          schema: 'public',
          table,
          filter
        },
        (payload) => {
          setData(payload.new as T);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, filter, event]);

  return data;
};
```

**Usage:**
```typescript
// Listen for new assignments
const newAssignment = useRealtime<Assignment>({
  table: 'assignments',
  filter: `cpo_id=eq.${cpoId}`,
  event: 'INSERT'
});

useEffect(() => {
  if (newAssignment) {
    showNotification('New assignment available!');
  }
}, [newAssignment]);
```

---

## 🔒 Security Best Practices

### **1. Secure Data Handling**

```typescript
// ✅ GOOD: Never store sensitive data in localStorage

// src/utils/secureStorage.ts

import { AES, enc } from 'crypto-js';

const SECRET_KEY = process.env.REACT_APP_ENCRYPTION_KEY!;

export const secureStorage = {
  set: (key: string, value: any): void => {
    const encrypted = AES.encrypt(
      JSON.stringify(value),
      SECRET_KEY
    ).toString();
    sessionStorage.setItem(key, encrypted); // Use sessionStorage, not localStorage
  },

  get: <T>(key: string): T | null => {
    const encrypted = sessionStorage.getItem(key);
    if (!encrypted) return null;

    try {
      const decrypted = AES.decrypt(encrypted, SECRET_KEY).toString(enc.Utf8);
      return JSON.parse(decrypted) as T;
    } catch {
      return null;
    }
  },

  remove: (key: string): void => {
    sessionStorage.removeItem(key);
  },

  clear: (): void => {
    sessionStorage.clear();
  }
};
```

---

### **2. Input Validation & Sanitization**

```typescript
// ✅ GOOD: Always validate and sanitize user input

import DOMPurify from 'dompurify';

export const sanitizeInput = (input: string): string => {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  });
};

export const validateSIANumber = (siaNumber: string): boolean => {
  // SIA license format: 16 digits
  const regex = /^\d{16}$/;
  return regex.test(siaNumber);
};

export const validateEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  // UK phone number format
  const regex = /^(\+44|0)\d{10}$/;
  return regex.test(phone.replace(/\s/g, ''));
};
```

**Usage in forms:**
```typescript
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();

  // Sanitize all inputs
  const sanitizedName = sanitizeInput(name);
  const sanitizedEmail = sanitizeInput(email);

  // Validate
  if (!validateEmail(sanitizedEmail)) {
    setError('Invalid email format');
    return;
  }

  if (!validateSIANumber(siaNumber)) {
    setError('Invalid SIA license number (16 digits required)');
    return;
  }

  // Proceed with submission
  submitForm({ name: sanitizedName, email: sanitizedEmail, siaNumber });
};
```

---

### **3. Prevent XSS Attacks**

```typescript
// ✅ GOOD: Safe rendering of user-generated content

import React from 'react';
import DOMPurify from 'dompurify';

interface SafeHTMLProps {
  html: string;
  className?: string;
}

const SafeHTML: React.FC<SafeHTMLProps> = ({ html, className }) => {
  const cleanHTML = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br', 'p'],
    ALLOWED_ATTR: []
  });

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: cleanHTML }}
    />
  );
};

export default SafeHTML;
```

---

## 🎨 Context API Patterns

### **1. Authentication Context**

```typescript
// src/contexts/AuthContext.tsx

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import { authService } from '@/services/firebase/auth';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = authService.onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    const user = await authService.signIn(email, password);
    setUser(user);
  };

  const logout = async () => {
    await authService.signOut();
    setUser(null);
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) throw new Error('No user logged in');
    const updated = await authService.updateProfile(user.id, data);
    setUser(updated);
  };

  const value: AuthContextValue = {
    user,
    loading,
    login,
    logout,
    updateProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

---

### **2. Assignment Context (Real-time)**

```typescript
// src/contexts/AssignmentContext.tsx

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Assignment } from '@/types';
import { supabase } from '@/services/supabase';
import { useAuth } from './AuthContext';

interface AssignmentContextValue {
  activeAssignment: Assignment | null;
  availableCount: number;
  acceptAssignment: (id: string) => Promise<void>;
  completeAssignment: () => Promise<void>;
}

const AssignmentContext = createContext<AssignmentContextValue | undefined>(undefined);

export const AssignmentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [activeAssignment, setActiveAssignment] = useState<Assignment | null>(null);
  const [availableCount, setAvailableCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    // Fetch active assignment
    const fetchActive = async () => {
      const { data } = await supabase
        .from('assignments')
        .select('*')
        .eq('cpo_id', user.id)
        .eq('status', 'active')
        .single();

      setActiveAssignment(data);
    };

    // Subscribe to real-time updates
    const channel = supabase
      .channel('assignments-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'assignments',
          filter: `cpo_id=eq.${user.id}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            if (payload.new.status === 'active') {
              setActiveAssignment(payload.new as Assignment);
            }
          }
        }
      )
      .subscribe();

    fetchActive();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const acceptAssignment = async (id: string) => {
    const { data } = await supabase
      .from('assignments')
      .update({ status: 'accepted', cpo_id: user?.id })
      .eq('id', id)
      .select()
      .single();

    setActiveAssignment(data);
  };

  const completeAssignment = async () => {
    if (!activeAssignment) return;

    await supabase
      .from('assignments')
      .update({ status: 'completed', actual_end: new Date().toISOString() })
      .eq('id', activeAssignment.id);

    setActiveAssignment(null);
  };

  return (
    <AssignmentContext.Provider value={{
      activeAssignment,
      availableCount,
      acceptAssignment,
      completeAssignment
    }}>
      {children}
    </AssignmentContext.Provider>
  );
};

export const useAssignmentContext = () => {
  const context = useContext(AssignmentContext);
  if (!context) {
    throw new Error('useAssignmentContext must be used within AssignmentProvider');
  }
  return context;
};
```

---

## 📊 State Management Best Practices

### **useReducer for Complex State**

```typescript
// src/hooks/useAssignmentForm.ts

import { useReducer, useCallback } from 'react';

interface AssignmentFormState {
  pickupAddress: string;
  destinationAddress: string;
  scheduledStart: string;
  scheduledEnd: string;
  assignmentType: string;
  specialInstructions: string;
  errors: Record<string, string>;
}

type AssignmentFormAction =
  | { type: 'SET_FIELD'; field: string; value: string }
  | { type: 'SET_ERROR'; field: string; error: string }
  | { type: 'CLEAR_ERRORS' }
  | { type: 'RESET' };

const initialState: AssignmentFormState = {
  pickupAddress: '',
  destinationAddress: '',
  scheduledStart: '',
  scheduledEnd: '',
  assignmentType: '',
  specialInstructions: '',
  errors: {}
};

const formReducer = (
  state: AssignmentFormState,
  action: AssignmentFormAction
): AssignmentFormState => {
  switch (action.type) {
    case 'SET_FIELD':
      return {
        ...state,
        [action.field]: action.value,
        errors: { ...state.errors, [action.field]: '' }
      };

    case 'SET_ERROR':
      return {
        ...state,
        errors: { ...state.errors, [action.field]: action.error }
      };

    case 'CLEAR_ERRORS':
      return { ...state, errors: {} };

    case 'RESET':
      return initialState;

    default:
      return state;
  }
};

export const useAssignmentForm = () => {
  const [state, dispatch] = useReducer(formReducer, initialState);

  const setField = useCallback((field: string, value: string) => {
    dispatch({ type: 'SET_FIELD', field, value });
  }, []);

  const setError = useCallback((field: string, error: string) => {
    dispatch({ type: 'SET_ERROR', field, error });
  }, []);

  const validate = useCallback(() => {
    let isValid = true;

    if (!state.pickupAddress) {
      dispatch({ type: 'SET_ERROR', field: 'pickupAddress', error: 'Required' });
      isValid = false;
    }

    if (!state.destinationAddress) {
      dispatch({ type: 'SET_ERROR', field: 'destinationAddress', error: 'Required' });
      isValid = false;
    }

    return isValid;
  }, [state]);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  return {
    state,
    setField,
    setError,
    validate,
    reset
  };
};
```

---

## 🧪 Testing Patterns

### **Component Testing**

```typescript
// src/components/assignment/AssignmentCard.test.tsx

import { render, screen, fireEvent } from '@testing-library/react';
import AssignmentCard from './AssignmentCard';
import { mockAssignment } from '@/test-utils/mocks';

describe('AssignmentCard', () => {
  it('renders assignment details correctly', () => {
    render(
      <AssignmentCard
        assignment={mockAssignment}
        onAccept={jest.fn()}
        onDecline={jest.fn()}
      />
    );

    expect(screen.getByText(mockAssignment.type)).toBeInTheDocument();
    expect(screen.getByText(/2.3 miles away/)).toBeInTheDocument();
  });

  it('calls onAccept when accept button is clicked', () => {
    const onAccept = jest.fn();

    render(
      <AssignmentCard
        assignment={mockAssignment}
        onAccept={onAccept}
        onDecline={jest.fn()}
      />
    );

    fireEvent.click(screen.getByText('Accept'));
    expect(onAccept).toHaveBeenCalledWith(mockAssignment.id);
  });

  it('is accessible', () => {
    const { container } = render(
      <AssignmentCard
        assignment={mockAssignment}
        onAccept={jest.fn()}
        onDecline={jest.fn()}
      />
    );

    expect(container.querySelector('[aria-label="Available assignment"]')).toBeInTheDocument();
  });
});
```

---

### **Hook Testing**

```typescript
// src/hooks/useAssignments.test.ts

import { renderHook, waitFor } from '@testing-library/react';
import { useAssignments } from './useAssignments';
import * as api from '@/services/api/assignments';

jest.mock('@/services/api/assignments');

describe('useAssignments', () => {
  it('fetches assignments on mount', async () => {
    const mockAssignments = [{ id: '1', type: 'Executive Transport' }];
    (api.assignmentsAPI.getAvailable as jest.Mock).mockResolvedValue(mockAssignments);

    const { result } = renderHook(() => useAssignments());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.assignments).toEqual(mockAssignments);
    });
  });

  it('handles errors gracefully', async () => {
    const error = new Error('Network error');
    (api.assignmentsAPI.getAvailable as jest.Mock).mockRejectedValue(error);

    const { result } = renderHook(() => useAssignments());

    await waitFor(() => {
      expect(result.current.error).toEqual(error);
    });
  });
});
```

---

## 📏 Code Style Guidelines

### **TypeScript Configuration**

```json
// tsconfig.json

{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "module": "ESNext",
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "baseUrl": "src",
    "paths": {
      "@/*": ["./*"],
      "@components/*": ["components/*"],
      "@screens/*": ["screens/*"],
      "@hooks/*": ["hooks/*"],
      "@services/*": ["services/*"],
      "@types/*": ["types/*"],
      "@utils/*": ["utils/*"]
    }
  },
  "include": ["src"],
  "exclude": ["node_modules"]
}
```

---

### **ESLint Configuration**

```json
// .eslintrc.json

{
  "extends": [
    "react-app",
    "react-app/jest",
    "plugin:react/recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "rules": {
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "no-console": ["warn", { "allow": ["warn", "error"] }]
  }
}
```

---

## ✅ React Best Practices Checklist

### **Performance:**
- [x] Use React.memo for expensive components
- [x] Use useMemo for expensive computations
- [x] Use useCallback for stable function references
- [x] Implement lazy loading for routes
- [x] Use virtual scrolling for long lists
- [x] Optimize images (WebP, lazy loading)
- [x] Code splitting with React.lazy

### **Mobile:**
- [x] Touch targets minimum 44px
- [x] Mobile-first CSS (320px baseline)
- [x] Prevent text zoom (font-size >= 16px)
- [x] Optimize for 3G networks
- [x] Battery-efficient location tracking
- [x] Offline support with service workers

### **Security:**
- [x] Sanitize all user inputs
- [x] Validate on client and server
- [x] Use sessionStorage (not localStorage) for sensitive data
- [x] Encrypt sensitive data
- [x] HTTPS only
- [x] CSP headers configured

### **Accessibility:**
- [x] Semantic HTML
- [x] ARIA labels and roles
- [x] Keyboard navigation
- [x] Screen reader support
- [x] Color contrast 4.5:1+
- [x] Focus indicators visible

### **Testing:**
- [x] Unit tests for hooks
- [x] Component tests
- [x] Integration tests
- [x] E2E tests with Playwright
- [x] >80% code coverage

---

**Keep this guide updated as patterns evolve! ⚛️**
