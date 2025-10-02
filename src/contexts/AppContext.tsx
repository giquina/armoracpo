import { createContext, useContext, useReducer, useEffect, useCallback, ReactNode } from 'react';
import { AppState, ViewState, User, PersonalizationData, DeviceCapabilities, Assignment, INotificationItem, AssignmentStatus } from '../types';
import {
  createProtectionAssignment,
  updateProtectionAssignment,
  subscribeToAssignmentUpdates,
  activateEmergency,
} from "../lib/supabase"

// Protection Assignment Context Interface
export interface AssignmentContext {
  preselectedService?: 'essential' | 'executive' | 'shadow' | 'client-vehicle';
  source?: 'home' | 'services' | 'toolbar' | 'hamburger';
}

// Initial state
const initialState: AppState = {
  currentView: 'splash',
  user: null,
  questionnaireData: null,
  deviceCapabilities: {
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isMobile: typeof navigator !== 'undefined' ? /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) : false,
    isTouch: typeof window !== 'undefined' ? 'ontouchstart' in window : false,
    screenWidth: typeof window !== 'undefined' ? window.innerWidth : 1024,
    screenHeight: typeof window !== 'undefined' ? window.innerHeight : 768,
    orientation: typeof window !== 'undefined' ? (window.innerWidth > window.innerHeight ? 'landscape' : 'portrait') : 'landscape',
    supportsInstallPrompt: typeof navigator !== 'undefined' ? 'serviceWorker' in navigator : false,
    deferredPrompt: null,
    isInstallable: false,
    isInstalled: false,
  },
  selectedServiceForProtectionAssignment: undefined,
  userProfileSelection: undefined,
  assignmentState: {
    currentAssignment: null,
    hasActiveAssignment: false,
    activeAssignmentId: null,
    panicAlertSent: false,
    panicAlertTimestamp: null,
    lastKnownLocation: null,
  },
  assignmentContext: null,
  isAssignmentActive: false,
  isLoading: false,
  error: null,
  notifications: [],
};

// Action types
type AppAction =
  | { type: 'SET_VIEW'; payload: ViewState }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_QUESTIONNAIRE_DATA'; payload: PersonalizationData }
  | { type: 'SET_USER_PROFILE_SELECTION'; payload: string | undefined }
  | { type: 'UPDATE_USER_QUESTIONNAIRE_COMPLETION' }
  | { type: 'START_ASSIGNMENT'; payload: AssignmentContext }
  | { type: 'END_ASSIGNMENT' }
  | { type: 'UPDATE_DEVICE_CAPABILITIES'; payload: Partial<DeviceCapabilities> }
  | { type: 'SET_SELECTED_SERVICE'; payload: string }
  | { type: 'SET_ASSIGNMENT'; payload: Assignment | null }
  | { type: 'UPDATE_ASSIGNMENT_STATUS'; payload: { assignmentId: string; status: string } }
  | { type: 'SET_PANIC_ALERT_SENT'; payload: { sent: boolean; timestamp?: Date } }
  | { type: 'UPDATE_LAST_KNOWN_LOCATION'; payload: { lat: number; lng: number; address: string; timestamp: string } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_ERROR' }
  | { type: 'RESET_APP' }
  | { type: 'ADD_NOTIFICATION'; payload: INotificationItem }
  | { type: 'MARK_NOTIFICATION_READ'; payload: { id: string } }
  | { type: 'MARK_ALL_NOTIFICATIONS_READ' }
  | { type: 'SET_NOTIFICATIONS'; payload: INotificationItem[] };

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_VIEW':
      return { ...state, currentView: action.payload };
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_QUESTIONNAIRE_DATA':
      return { ...state, questionnaireData: action.payload };
    case 'SET_USER_PROFILE_SELECTION':
      return { ...state, userProfileSelection: action.payload };
    case 'UPDATE_USER_QUESTIONNAIRE_COMPLETION':
      return {
        ...state,
        user: state.user ? {
          ...state.user,
          hasCompletedQuestionnaire: true,
          hasUnlockedReward: state.user.userType !== 'guest'
        } : state.user
      };
    case 'UPDATE_DEVICE_CAPABILITIES':
      return { 
        ...state, 
        deviceCapabilities: { ...state.deviceCapabilities, ...action.payload } 
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'SET_SELECTED_SERVICE':
      return { ...state, selectedServiceForProtectionAssignment: action.payload };
    case 'SET_ASSIGNMENT':
      return {
        ...state,
        assignmentState: {
          ...state.assignmentState,
          currentAssignment: action.payload,
          hasActiveAssignment: action.payload?.status === 'protection_active' || action.payload?.status === 'officer_en_route',
          activeAssignmentId: action.payload?.id || null,
        }
      };
    case 'UPDATE_ASSIGNMENT_STATUS':
      if (state.assignmentState.currentAssignment?.id === action.payload.assignmentId) {
        const updatedAssignment = {
          ...state.assignmentState.currentAssignment,
          status: action.payload.status as AssignmentStatus,
        };
        return {
          ...state,
          assignmentState: {
            ...state.assignmentState,
            currentAssignment: updatedAssignment,
            hasActiveAssignment: action.payload.status === 'active' || action.payload.status === 'in_progress',
          }
        };
      }
      return state;
    case 'SET_PANIC_ALERT_SENT':
      return {
        ...state,
        assignmentState: {
          ...state.assignmentState,
          panicAlertSent: action.payload.sent,
          panicAlertTimestamp: action.payload.timestamp || null,
        }
      };
    case 'UPDATE_LAST_KNOWN_LOCATION':
      return {
        ...state,
        assignmentState: {
          ...state.assignmentState,
          lastKnownLocation: action.payload,
        }
      };
    case 'START_ASSIGNMENT':
      return {
        ...state,
        assignmentContext: action.payload,
        isAssignmentActive: true
      };
    case 'END_ASSIGNMENT':
      return {
        ...state,
        assignmentContext: null,
        isAssignmentActive: false
      };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'RESET_APP':
      return { ...initialState, deviceCapabilities: state.deviceCapabilities };
    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [action.payload, ...(state.notifications || [])] };
    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: (state.notifications || []).map(n => n.id === action.payload.id ? { ...n, isRead: true } : n)
      };
    case 'MARK_ALL_NOTIFICATIONS_READ':
      return { ...state, notifications: (state.notifications || []).map(n => ({ ...n, isRead: true })) };
    case 'SET_NOTIFICATIONS':
      return { ...state, notifications: action.payload };
    default:
      return state;
  }
}

// Context type
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  // Convenience actions
  navigateToView: (view: ViewState) => void;
  startProtectionRequest: (preselectedService?: 'essential' | 'executive' | 'shadow' | 'client-vehicle', source?: 'home' | 'services' | 'toolbar' | 'hamburger') => void;
  setUser: (user: User | null) => void;
  updateQuestionnaireData: (data: PersonalizationData) => void;
  setUserProfileSelection: (profileSelection: string | undefined) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  resetApp: () => void;
  setSelectedService: (service: string) => void;
  // Notifications
  addNotification: (n: Omit<INotificationItem, 'id' | 'timestamp'> & Partial<Pick<INotificationItem, 'id' | 'timestamp'>>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  // Assignment actions
  createAssignment: (assignmentData: any) => Promise<Assignment>;
  updateAssignmentStatus: (assignmentId: string, status: string) => Promise<void>;
  activatePanicAlert: (location?: any) => Promise<void>;
  deactivatePanicAlert: () => Promise<void>;
  // Assignment actions
  startAssignment: (context: AssignmentContext) => void;
  endAssignment: () => void;
  updateLastKnownLocation: (location: { lat: number; lng: number; address: string }) => void;
  // PWA Install actions
  showInstallPrompt: () => Promise<boolean>;
  canInstall: () => boolean;
}

// Create context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Convenience actions
  const navigateToView = useCallback((view: ViewState) => {
    // Development mode: always allow questionnaire navigation for testing
    const isDevelopment = process.env.NODE_ENV === 'development';

    console.log('Navigation debug:', {
      targetView: view,
      currentUser: state.user,
      hasCompletedQuestionnaire: state.user?.hasCompletedQuestionnaire,
      isDevelopment,
      willBypassSkip: isDevelopment && view === 'questionnaire'
    });
    
    // Skip questionnaire for returning users who already completed it (but not in development)
    if (view === 'questionnaire' && state.user?.hasCompletedQuestionnaire && !isDevelopment) {
      dispatch({ type: 'SET_VIEW', payload: 'home' });
      return;
    }
    
    dispatch({ type: 'SET_VIEW', payload: view });
    // Keep URL hash in sync for simple deep linking (e.g., #protection assignment)
    try {
      if (typeof window !== 'undefined' && window.location.hash !== `#${view}`) {
        window.location.hash = view as string;
      }
    } catch (e) {
      // no-op if hash cannot be set (e.g., SSR or restricted env)
    }
  }, []);

  const startProtectionRequest = useCallback((preselectedService?: 'essential' | 'executive' | 'shadow' | 'client-vehicle', source?: 'home' | 'services' | 'toolbar' | 'hamburger') => {
    // Set the assignment context with preselected service
    if (preselectedService) {
      dispatch({
        type: 'START_ASSIGNMENT',
        payload: {
          preselectedService,
          source: source || 'home'
        }
      });
    }
    // Navigate to protection request view
    dispatch({ type: 'SET_VIEW', payload: 'protection-request' });
    // Keep URL hash in sync
    try {
      if (typeof window !== 'undefined') {
        window.location.hash = 'protection-request';
      }
    } catch (e) {
      // no-op if hash cannot be set
    }
  }, []);

  const setUser = (user: User | null) => {
    dispatch({ type: 'SET_USER', payload: user });
  };

  const updateQuestionnaireData = useCallback((data: PersonalizationData) => {
    dispatch({ type: 'SET_QUESTIONNAIRE_DATA', payload: data });

    // Store profile selection for personalization
    if (data.profileSelection) {
      dispatch({ type: 'SET_USER_PROFILE_SELECTION', payload: data.profileSelection });
    }

    // If questionnaire is completed, mark user as completed
    if (data.completedAt) {
      dispatch({
        type: 'UPDATE_USER_QUESTIONNAIRE_COMPLETION'
      });
    }
  }, []); // Remove state.user dependency to prevent infinite loop
  // TypeScript update to force recompilation

  const setUserProfileSelection = (profileSelection: string | undefined) => {
    dispatch({ type: 'SET_USER_PROFILE_SELECTION', payload: profileSelection });
  };

  const setError = (error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const setLoading = (loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  const resetApp = () => {
    dispatch({ type: 'RESET_APP' });
  };

  // Initialize view from URL hash for simple deep linking support
  useEffect(() => {
    const applyHashView = () => {
      try {
        if (typeof window === 'undefined') return;
        const raw = window.location.hash || '';
        const hash = raw.startsWith('#') ? raw.slice(1) : raw;
        if (!hash) return;
        // Best-effort cast; invalid values will be handled by AppRouter's default case
        const nextView = hash as ViewState;
        // Avoid redundant dispatches
        if (state.currentView !== nextView) {
          dispatch({ type: 'SET_VIEW', payload: nextView });
        }
      } catch (e) {
        // Ignore malformed hashes
      }
    };

    applyHashView();
    window.addEventListener('hashchange', applyHashView);
    return () => window.removeEventListener('hashchange', applyHashView);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setSelectedService = (service: string) => {
    dispatch({ type: 'SET_SELECTED_SERVICE', payload: service });
  };

  // Assignment management functions
  const createAssignment = useCallback(async (assignmentData: any): Promise<Assignment> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await createProtectionAssignment(assignmentData);
      if (error) throw error;

      // Update local state
      dispatch({ type: 'SET_ASSIGNMENT', payload: data });

      // Subscribe to real-time updates
      if (data.id) {
        subscribeToAssignmentUpdates(data.id, (payload) => {
          if (payload.eventType === 'UPDATE') {
            dispatch({
              type: 'UPDATE_ASSIGNMENT_STATUS',
              payload: {
                assignmentId: payload.new.id,
                status: payload.new.assignment_status
              }
            });
          }
        });
      }

      return data;
    } catch (error: any) {
      console.error('Error creating assignment:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateAssignmentStatus = useCallback(async (assignmentId: string, status: string): Promise<void> => {
    try {
      const { error } = await updateProtectionAssignment(assignmentId, { assignment_status: status });
      if (error) throw error;

      // Update local state
      dispatch({
        type: 'UPDATE_ASSIGNMENT_STATUS',
        payload: { assignmentId, status }
      });
    } catch (error: any) {
      console.error('Error updating assignment status:', error);
      setError(error.message);
      throw error;
    }
  }, []);

  const activatePanicAlert = useCallback(async (location?: any): Promise<void> => {
    if (!state.user?.id) {
      throw new Error('User must be logged in to activate panic alert');
    }

    setLoading(true);
    setError(null);

    try {
      const currentLocation = location || state.assignmentState.lastKnownLocation;

      const { error } = await activateEmergency(
        state.user.id,
        currentLocation,
        state.assignmentState.activeAssignmentId || undefined
      );

      if (error) throw error;

      // Update local state
      dispatch({
        type: 'SET_PANIC_ALERT_SENT',
        payload: { sent: true, timestamp: new Date() }
      });

      // Add notification
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          id: `emergency-${Date.now()}`,
          type: 'emergency',
          title: 'Emergency Alert Activated',
          message: 'Your panic alert has been sent. Emergency services are being contacted.',
          timestamp: new Date(),
          isRead: false,
          requiresAction: false,
        }
      });

      // Navigate to hub for real-time updates
      navigateToView('hub');

    } catch (error: any) {
      console.error('Error activating panic alert:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [state.user?.id, state.assignmentState, navigateToView]);

  const deactivatePanicAlert = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      // Find the latest emergency activation to deactivate
      // Note: This would need to be implemented with proper tracking
      // For now, just update local state
      dispatch({
        type: 'SET_PANIC_ALERT_SENT',
        payload: { sent: false }
      });

      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          id: `emergency-deactivated-${Date.now()}`,
          type: 'success',
          title: 'Emergency Alert Deactivated',
          message: 'Your panic alert has been successfully deactivated.',
          timestamp: new Date(),
          isRead: false,
          requiresAction: false,
        }
      });

    } catch (error: any) {
      console.error('Error deactivating panic alert:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateLastKnownLocation = useCallback((location: { lat: number; lng: number; address: string }) => {
    dispatch({
      type: 'UPDATE_LAST_KNOWN_LOCATION',
      payload: {
        ...location,
        timestamp: new Date().toISOString()
      }
    });
  }, []);

  // Assignment actions
  const startAssignment = (context: AssignmentContext) => {
    dispatch({ type: 'START_ASSIGNMENT', payload: context });
  };

  const endAssignment = () => {
    dispatch({ type: 'END_ASSIGNMENT' });
  };

  // Monitor device capabilities
  useEffect(() => {
    const handleResize = () => {
      dispatch({
        type: 'UPDATE_DEVICE_CAPABILITIES',
        payload: {
          screenWidth: window.innerWidth,
          screenHeight: window.innerHeight,
          orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait',
        },
      });
    };

    const handleOnlineStatus = () => {
      dispatch({
        type: 'UPDATE_DEVICE_CAPABILITIES',
        payload: { isOnline: navigator.onLine },
      });
    };

    // PWA install prompt handling
    const handleBeforeInstallPrompt = (e: any) => {
      console.log('[PWA] beforeinstallprompt event fired');
      e.preventDefault(); // Prevent the mini-infobar from appearing

      dispatch({
        type: 'UPDATE_DEVICE_CAPABILITIES',
        payload: {
          deferredPrompt: e,
          isInstallable: true,
        },
      });
    };

    const handleAppInstalled = () => {
      console.log('[PWA] App was installed');

      dispatch({
        type: 'UPDATE_DEVICE_CAPABILITIES',
        payload: {
          deferredPrompt: null,
          isInstallable: false,
          isInstalled: true,
        },
      });
    };

    // Check if already installed
    const checkIfInstalled = () => {
      if (window.matchMedia && window.matchMedia('(display-mode: standalone)')?.matches) {
        dispatch({
          type: 'UPDATE_DEVICE_CAPABILITIES',
          payload: {
            isInstalled: true,
            isInstallable: false,
          },
        });
      } else if ((window.navigator as any).standalone === true) {
        // iOS Safari standalone mode
        dispatch({
          type: 'UPDATE_DEVICE_CAPABILITIES',
          payload: {
            isInstalled: true,
            isInstallable: false,
          },
        });
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Check install status on load
    checkIfInstalled();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Local storage persistence
  useEffect(() => {
    const savedUser = localStorage.getItem('armora_user');
    const savedQuestionnaireData = localStorage.getItem('armora_questionnaire');
    const savedNotifications = localStorage.getItem('armora_notifications');

    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);

        // Add mock saved addresses for testing if none exist
        if (!user.savedAddresses || user.savedAddresses.length === 0) {
          user.savedAddresses = [
            {
              id: 'home-001',
              label: 'home',
              address: '10 Downing Street, Westminster, London SW1A 2AA',
              createdAt: new Date('2024-01-15'),
              lastUsed: new Date('2024-09-28')
            },
            {
              id: 'work-001',
              label: 'work',
              address: 'Canary Wharf, London E14 5AB',
              createdAt: new Date('2024-01-20'),
              lastUsed: new Date('2024-09-29')
            },
            {
              id: 'custom-001',
              label: 'custom',
              customLabel: "Mum's House",
              address: '221B Baker Street, Marylebone, London NW1 6XE',
              createdAt: new Date('2024-02-10')
            }
          ];
        }

        // Add mock recent addresses if none exist
        if (!user.recentAddresses || user.recentAddresses.length === 0) {
          user.recentAddresses = [
            'Heathrow Airport, Hounslow TW6 1AP',
            'The Shard, 32 London Bridge Street, London SE1 9SG',
            'Harrods, 87-135 Brompton Road, Knightsbridge, London SW1X 7XL'
          ];
        }

        setUser(user);
      } catch (error) {
        console.error('Failed to parse saved user data:', error);
        localStorage.removeItem('armora_user');
      }
    }

    if (savedQuestionnaireData) {
      try {
        const questionnaireData = JSON.parse(savedQuestionnaireData);
        updateQuestionnaireData(questionnaireData);
      } catch (error) {
        console.error('Failed to parse saved questionnaire data:', error);
        localStorage.removeItem('armora_questionnaire');
      }
    }

    if (savedNotifications) {
      try {
        const parsed = JSON.parse(savedNotifications) as any[];
        const normalized: INotificationItem[] = parsed.map((n: any) => ({
          id: n.id,
          type: n.type || 'info',
          title: n.title || 'Update',
          message: n.message || '',
          timestamp: n.timestamp ? new Date(n.timestamp) : new Date(),
          isRead: !!n.isRead,
          requiresAction: !!n.requiresAction,
          actionText: n.actionText,
        }));
        dispatch({ type: 'SET_NOTIFICATIONS', payload: normalized });
      } catch (e) {
        console.warn('Failed to parse saved notifications');
      }
    }
  }, [updateQuestionnaireData]);

  // Save user and questionnaire data to localStorage
  useEffect(() => {
    if (state.user) {
      localStorage.setItem('armora_user', JSON.stringify(state.user));
    } else {
      localStorage.removeItem('armora_user');
    }
  }, [state.user]);

  useEffect(() => {
    if (state.questionnaireData) {
      localStorage.setItem('armora_questionnaire', JSON.stringify(state.questionnaireData));
    }
  }, [state.questionnaireData]);

  // PWA Install functions
  const showInstallPrompt = useCallback(async (): Promise<boolean> => {
    const deferredPrompt = state.deviceCapabilities.deferredPrompt;

    if (!deferredPrompt) {
      console.log('[PWA] No deferred prompt available');
      return false;
    }

    try {
      // Show the install prompt
      deferredPrompt.prompt();

      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;

      console.log(`[PWA] User choice: ${outcome}`);

      if (outcome === 'accepted') {
        console.log('[PWA] User accepted the install prompt');

        // Clear the deferred prompt
        dispatch({
          type: 'UPDATE_DEVICE_CAPABILITIES',
          payload: {
            deferredPrompt: null,
            isInstallable: false,
          },
        });

        return true;
      } else {
        console.log('[PWA] User dismissed the install prompt');
        return false;
      }
    } catch (error) {
      console.error('[PWA] Error showing install prompt:', error);
      return false;
    }
  }, [state.deviceCapabilities.deferredPrompt]);

  const canInstall = useCallback((): boolean => {
    return !!(state.deviceCapabilities.isInstallable &&
           !state.deviceCapabilities.isInstalled &&
           state.deviceCapabilities.deferredPrompt);
  }, [state.deviceCapabilities]);

  const value: AppContextType = {
    state,
    dispatch,
    navigateToView,
    startProtectionRequest,
    setUser,
    updateQuestionnaireData,
    setUserProfileSelection,
    setError,
    clearError,
    setLoading,
    resetApp,
    setSelectedService,
    addNotification: (n) => {
      const id = n.id || `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const item: INotificationItem = {
        id,
        type: n.type || 'info',
        title: n.title || 'Update',
        message: n.message || '',
        timestamp: n.timestamp || new Date(),
        isRead: !!n.isRead,
        requiresAction: !!n.requiresAction,
        actionText: n.actionText,
        actionHandler: n.actionHandler,
      };
      dispatch({ type: 'ADD_NOTIFICATION', payload: item });
      try {
        const raw = localStorage.getItem('armora_notifications') || '[]';
        const parsed: any[] = JSON.parse(raw);
        parsed.unshift({ ...item, timestamp: item.timestamp.toISOString() });
        localStorage.setItem('armora_notifications', JSON.stringify(parsed));
      } catch {}
    },
    markNotificationRead: (id: string) => {
      dispatch({ type: 'MARK_NOTIFICATION_READ', payload: { id } });
      try {
        const raw = localStorage.getItem('armora_notifications') || '[]';
        const parsed: any[] = JSON.parse(raw);
        const updated = parsed.map(n => n.id === id ? { ...n, isRead: true } : n);
        localStorage.setItem('armora_notifications', JSON.stringify(updated));
      } catch {}
    },
    markAllNotificationsRead: () => {
      dispatch({ type: 'MARK_ALL_NOTIFICATIONS_READ' });
      try {
        const raw = localStorage.getItem('armora_notifications') || '[]';
        const parsed: any[] = JSON.parse(raw);
        const updated = parsed.map(n => ({ ...n, isRead: true }));
        localStorage.setItem('armora_notifications', JSON.stringify(updated));
      } catch {}
    },
    // Assignment functions
    createAssignment,
    updateAssignmentStatus,
    activatePanicAlert,
    deactivatePanicAlert,
    updateLastKnownLocation,
    startAssignment,
    endAssignment,
    // PWA Install functions
    showInstallPrompt,
    canInstall,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// Hook to use the context
export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}