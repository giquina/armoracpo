import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, ProtectionOfficer } from '../lib/supabase';
import { authService } from '../services/authService';

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

  // Fetch user profile using real auth service
  const fetchProfile = async (userId: string) => {
    try {
      // Get CPO profile from Supabase
      const cpoProfile = await authService.getCPOProfile(userId);

      // Get current user from Supabase auth
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      // Set legacy profile format for backward compatibility
      setProfile({
        id: user.id,
        email: user.email || '',
        full_name: `${cpoProfile.first_name} ${cpoProfile.last_name}`,
        phone_number: cpoProfile.phone,
      });

      // Set CPO profile
      setCpoProfile(cpoProfile);
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      setError(err.message);
    }
  };

  // Initialize auth state with real Supabase Auth
  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log('[Supabase Auth] Initializing authentication...');

        // Get current session from Supabase
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          setSession(session);
          setUser(session.user);

          // Fetch CPO profile
          try {
            const cpoProfile = await authService.getCPOProfile(session.user.id);

            // Set legacy profile format for backward compatibility
            setProfile({
              id: session.user.id,
              email: session.user.email || '',
              full_name: `${cpoProfile.first_name} ${cpoProfile.last_name}`,
              phone_number: cpoProfile.phone,
            });
            setCpoProfile(cpoProfile);

            console.log('[Supabase Auth] Session restored:', session.user.email);
          } catch (profileErr: any) {
            console.error('[Supabase Auth] Error fetching CPO profile:', profileErr);
            // If profile fetch fails, sign out
            await supabase.auth.signOut();
            setSession(null);
            setUser(null);
            setProfile(null);
            setCpoProfile(null);
          }
        } else {
          console.log('[Supabase Auth] No active session');
        }
      } catch (err: any) {
        console.error('[Supabase Auth] Initialization error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[Supabase Auth] Auth state changed:', event);

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
          console.log('[Supabase Auth] User signed in');
          break;
        case 'SIGNED_OUT':
          console.log('[Supabase Auth] User signed out');
          break;
        case 'TOKEN_REFRESHED':
          console.log('[Supabase Auth] Token refreshed');
          break;
        case 'USER_UPDATED':
          console.log('[Supabase Auth] User updated');
          break;
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sign up with email (real Supabase Auth)
  const signUp = async (email: string, password: string, fullName?: string) => {
    setError(null);
    setLoading(true);

    try {
      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('No user returned from sign up');

      console.log('[Supabase Auth] Signup complete:', authData.user.email);

      // Note: The user will need to verify their email and create a CPO profile
      // Auth state will be updated via onAuthStateChange listener
    } catch (err: any) {
      console.error('[Supabase Auth] Sign up error:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Sign in with email (real Supabase Auth)
  const signIn = async (email: string, password: string) => {
    setError(null);
    setLoading(true);

    try {
      // Use authService which handles verification check and FCM token
      const { user, cpo } = await authService.login(email, password);

      // Update local state
      setUser(user);

      // Get session from Supabase
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);

      // Set profiles
      setProfile({
        id: user.id,
        email: user.email || '',
        full_name: `${cpo.first_name} ${cpo.last_name}`,
        phone_number: cpo.phone,
      });
      setCpoProfile(cpo);

      console.log('[Supabase Auth] Login complete:', user.email);
    } catch (err: any) {
      console.error('[Supabase Auth] Sign in error:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Sign in with Google (real Supabase Auth)
  const handleSignInWithGoogle = async () => {
    setError(null);
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) throw error;

      console.log('[Supabase Auth] Google sign-in initiated');
      // Note: Auth state will be updated via onAuthStateChange listener after redirect
    } catch (err: any) {
      console.error('[Supabase Auth] Google sign in error:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Sign out (real Supabase Auth)
  const handleSignOut = async () => {
    setError(null);
    setLoading(true);

    try {
      await authService.logout();

      // Clear local state
      setUser(null);
      setSession(null);
      setProfile(null);
      setCpoProfile(null);

      // Clear localStorage
      localStorage.removeItem('armoraUser');
      localStorage.removeItem('armoraQuestionnaireResponses');
      localStorage.removeItem('armoraBookingData');

      console.log('[Supabase Auth] Logout complete');
    } catch (err: any) {
      console.error('[Supabase Auth] Sign out error:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update profile (real Supabase)
  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user || !cpoProfile) {
      throw new Error('No user logged in');
    }

    setError(null);
    setLoading(true);

    try {
      // Map legacy Profile updates to ProtectionOfficer fields
      const cpoUpdates: Partial<ProtectionOfficer> = {};

      if (updates.full_name) {
        const [firstName, ...lastNameParts] = updates.full_name.split(' ');
        cpoUpdates.first_name = firstName;
        cpoUpdates.last_name = lastNameParts.join(' ');
      }
      if (updates.phone_number) cpoUpdates.phone = updates.phone_number;

      // Update CPO profile using authService
      const updatedCPO = await authService.updateProfileByUserId(user.id, cpoUpdates);

      // Update local state
      setProfile({
        ...profile!,
        ...updates,
      });
      setCpoProfile(updatedCPO);

      console.log('[Supabase Auth] Profile update complete');
    } catch (err: any) {
      console.error('[Supabase Auth] Profile update error:', err);
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

  // Save questionnaire responses (legacy - not used in CPO app)
  const saveQuestionnaire = async (responses: any) => {
    if (!user) {
      throw new Error('No user logged in');
    }

    setError(null);
    setLoading(true);

    try {
      console.log('[Supabase Auth] Saving questionnaire responses:', responses);

      // This is a legacy method from the principal app
      // For CPO app, questionnaire data would be stored differently
      // For now, just log it
      console.log('[Supabase Auth] Questionnaire saved (no-op for CPO app)');
    } catch (err: any) {
      console.error('[Supabase Auth] Questionnaire save error:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Acknowledge Martyn's Law (legacy - not used in CPO app)
  const acknowledgeMartynsLaw = async () => {
    if (!user) {
      throw new Error('No user logged in');
    }

    console.log('[Supabase Auth] Acknowledging Martyns Law (no-op for CPO app)');
    // This is a legacy method from the principal app
    // CPO app doesn't use this functionality
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