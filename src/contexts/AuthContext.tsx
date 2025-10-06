import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { ProtectionOfficer } from '../lib/supabase';
import { mockAuthService } from '../services/mockAuth.service';

// Legacy Profile interface for backward compatibility
interface Profile {
  id: string;
  email: string;
  full_name?: string;
  phone_number?: string;
  preferred_protection_level?: 'essential' | 'executive' | 'shadow';
  security_requirements?: any;
  accessibility_needs?: any;
  emergency_contacts?: any[];
  account_type?: 'standard' | 'premium' | 'corporate';
  subscription_status?: 'active' | 'inactive' | 'cancelled';
  sia_verification_status?: 'pending' | 'verified' | 'failed';
  martyns_law_acknowledged?: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  cpoProfile: ProtectionOfficer | null; // CPO-specific profile data
  loading: boolean;
  error: string | null;
  // Auth methods
  signUp: (email: string, password: string, fullName?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  // Profile methods
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
  // Protection service methods (legacy)
  saveQuestionnaire: (responses: any) => Promise<void>;
  acknowledgeMartynsLaw: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    // Always return a fallback in development to prevent app crashes
    console.warn('useAuth: AuthContext not found, returning mock implementation');
    return {
      user: null,
      session: null,
      profile: null,
      cpoProfile: null,
      loading: false,
      error: null,
      signUp: async () => {},
      signIn: async () => {},
      signInWithGoogle: async () => {},
      signOut: async () => {},
      updateProfile: async () => {},
      refreshProfile: async () => {},
      saveQuestionnaire: async () => {},
      acknowledgeMartynsLaw: async () => {},
    } as AuthContextType;
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [cpoProfile, setCpoProfile] = useState<ProtectionOfficer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user profile using mock auth service
  const fetchProfile = async (userId: string) => {
    try {
      // Get mock user and CPO profile
      const { user: mockUser, cpo: mockCPO } = await mockAuthService.getCurrentUser();

      // Set legacy profile format
      setProfile({
        id: mockUser.id,
        email: mockUser.email,
        full_name: `${mockCPO.first_name} ${mockCPO.last_name}`,
        phone_number: mockCPO.phone,
      });

      // Set CPO profile
      setCpoProfile(mockCPO);
    } catch (err: any) {
      console.error('Error fetching mock profile:', err);
      setError(err.message);
    }
  };

  // Initialize auth state with mock auto-login
  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log('[MOCK AUTH] Auto-logging in mock user...');

        // Auto-login with mock service
        const { user: mockUser, cpo: mockCPO, session: mockSession } = await mockAuthService.getCurrentUser();

        // Set mock session and user immediately
        setSession(mockSession as any);
        setUser(mockUser as any);

        // Set profiles
        setProfile({
          id: mockUser.id,
          email: mockUser.email,
          full_name: `${mockCPO.first_name} ${mockCPO.last_name}`,
          phone_number: mockCPO.phone,
        });
        setCpoProfile(mockCPO);

        console.log('[MOCK AUTH] Auto-login complete:', mockUser.email);
      } catch (err: any) {
        console.error('Mock auth initialization error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes (mock)
    const { data: { subscription } } = mockAuthService.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setCpoProfile(null);
      }

      // Handle auth events
      switch (event) {
        case 'SIGNED_IN':
          console.log('[MOCK AUTH] User signed in');
          break;
        case 'SIGNED_OUT':
          console.log('[MOCK AUTH] User signed out');
          break;
        case 'USER_UPDATED':
          console.log('[MOCK AUTH] User updated');
          break;
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sign up with email (mock)
  const signUp = async (email: string, password: string, fullName?: string) => {
    setError(null);
    setLoading(true);

    try {
      const { user: mockUser, cpo: mockCPO, session: mockSession } = await mockAuthService.signup(
        email,
        password,
        { full_name: fullName }
      );

      // Update local state
      setUser(mockUser as any);
      setSession(mockSession as any);
      setProfile({
        id: mockUser.id,
        email: mockUser.email,
        full_name: `${mockCPO.first_name} ${mockCPO.last_name}`,
        phone_number: mockCPO.phone,
      });
      setCpoProfile(mockCPO);

      console.log('[MOCK AUTH] Signup complete:', mockUser.email);
    } catch (err: any) {
      console.error('Mock sign up error:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Sign in with email (mock)
  const signIn = async (email: string, password: string) => {
    setError(null);
    setLoading(true);

    try {
      const { user: mockUser, cpo: mockCPO, session: mockSession } = await mockAuthService.login(
        email,
        password
      );

      // Update local state
      setUser(mockUser as any);
      setSession(mockSession as any);
      setProfile({
        id: mockUser.id,
        email: mockUser.email,
        full_name: `${mockCPO.first_name} ${mockCPO.last_name}`,
        phone_number: mockCPO.phone,
      });
      setCpoProfile(mockCPO);

      console.log('[MOCK AUTH] Login complete:', mockUser.email);
    } catch (err: any) {
      console.error('Mock sign in error:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Sign in with Google (mock - not supported)
  const handleSignInWithGoogle = async () => {
    setError(null);
    setLoading(true);

    try {
      console.log('[MOCK AUTH] Google sign-in not supported in mock mode');
      throw new Error('Google sign-in not supported in mock mode');
    } catch (err: any) {
      console.error('Mock Google sign in error:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Sign out (mock)
  const handleSignOut = async () => {
    setError(null);
    setLoading(true);

    try {
      await mockAuthService.logout();

      // Clear local state
      setUser(null);
      setSession(null);
      setProfile(null);
      setCpoProfile(null);

      // Clear localStorage
      localStorage.removeItem('armoraUser');
      localStorage.removeItem('armoraQuestionnaireResponses');
      localStorage.removeItem('armoraBookingData');

      console.log('[MOCK AUTH] Logout complete');
    } catch (err: any) {
      console.error('Mock sign out error:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update profile (mock)
  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) {
      throw new Error('No user logged in');
    }

    setError(null);
    setLoading(true);

    try {
      // Update mock CPO profile
      const updatedCPO = await mockAuthService.updateProfile(user.id, updates as any);

      // Update local state
      setProfile({
        ...profile!,
        ...updates,
      });
      setCpoProfile(updatedCPO);

      console.log('[MOCK AUTH] Profile update complete');
    } catch (err: any) {
      console.error('Mock profile update error:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Refresh profile
  const refreshProfile = async () => {
    if (!user) return;
    await fetchProfile(user.id);
  };

  // Save questionnaire responses (mock)
  const saveQuestionnaire = async (responses: any) => {
    if (!user) {
      throw new Error('No user logged in');
    }

    setError(null);
    setLoading(true);

    try {
      console.log('[MOCK AUTH] Saving questionnaire responses:', responses);

      // Update profile to mark questionnaire as completed
      await updateProfile({
        sia_verification_status: 'pending', // Trigger verification process
      });

      console.log('[MOCK AUTH] Questionnaire saved');
    } catch (err: any) {
      console.error('Mock questionnaire save error:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Acknowledge Martyn's Law (mock)
  const acknowledgeMartynsLaw = async () => {
    if (!user) {
      throw new Error('No user logged in');
    }

    console.log('[MOCK AUTH] Acknowledging Martyns Law');
    await updateProfile({
      martyns_law_acknowledged: true,
    });
  };

  const value: AuthContextType = {
    user,
    session,
    profile,
    cpoProfile,
    loading,
    error,
    signUp,
    signIn,
    signInWithGoogle: handleSignInWithGoogle,
    signOut: handleSignOut,
    updateProfile,
    refreshProfile,
    saveQuestionnaire,
    acknowledgeMartynsLaw,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};