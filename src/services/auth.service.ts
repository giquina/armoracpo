import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';
import type { ProtectionOfficer } from '../lib/supabase';

export interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  userType: 'client' | 'cpo';
  // CPO-specific fields
  siaLicenseNumber?: string;
  siaLicenseType?: string;
  siaLicenseExpiry?: string;
  dateOfBirth?: string;
  addressLine1?: string;
  city?: string;
  postcode?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface ProfileData {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  user_type: 'client' | 'cpo';
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

class AuthService {
  /**
   * Sign up a new user (Client or CPO)
   */
  async signUp(data: SignUpData): Promise<{ user: User | null; error: Error | null }> {
    try {
      // Step 1: Create Supabase Auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            phone: data.phone,
            user_type: data.userType,
          },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('User creation failed');

      // Step 2: Create profile record in profiles table (if it exists)
      // This might be auto-created by database trigger, so we'll use upsert
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: authData.user.id,
        full_name: data.fullName,
        email: data.email,
        phone: data.phone,
        user_type: data.userType,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });

      // Ignore profile errors if table doesn't exist or trigger handles it
      if (profileError) {
        console.warn('Profile creation warning:', profileError.message);
      }

      // Step 3: If CPO, create protection_officers record
      if (data.userType === 'cpo') {
        const [firstName, ...lastNameParts] = data.fullName.split(' ');
        const lastName = lastNameParts.join(' ') || firstName;

        const { error: cpoError } = await supabase.from('protection_officers').insert({
          user_id: authData.user.id,
          first_name: firstName,
          last_name: lastName,
          email: data.email,
          phone: data.phone,
          sia_license_number: data.siaLicenseNumber || '',
          sia_license_type: data.siaLicenseType || 'Door Supervisor',
          sia_license_expiry: data.siaLicenseExpiry || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          date_of_birth: data.dateOfBirth || '1990-01-01',
          address_line1: data.addressLine1 || '',
          city: data.city || '',
          postcode: data.postcode || '',
          country: 'United Kingdom',
          emergency_contact_name: data.emergencyContactName || '',
          emergency_contact_phone: data.emergencyContactPhone || '',
          right_to_work_status: 'verified',
          is_available: true,
          verification_status: 'pending',
          rating: 5.0,
          total_assignments: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        if (cpoError) throw cpoError;
      }

      return { user: authData.user, error: null };
    } catch (error) {
      console.error('Signup error:', error);
      return { user: null, error: error as Error };
    }
  }

  /**
   * Sign in existing user
   */
  async signIn(data: SignInData): Promise<{ session: Session | null; error: Error | null }> {
    try {
      const { data: sessionData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) throw error;

      return { session: sessionData.session, error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      return { session: null, error: error as Error };
    }
  }

  /**
   * Sign out current user
   */
  async signOut(): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Sign out error:', error);
      return { error: error as Error };
    }
  }

  /**
   * Get current user profile
   */
  async getCurrentUserProfile(): Promise<{ profile: ProfileData | null; error: Error | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('No authenticated user');
      }

      // Try to get from profiles table first
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      // If no profile in profiles table, construct from user metadata
      if (!data) {
        return {
          profile: {
            id: user.id,
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
            email: user.email || '',
            phone: user.user_metadata?.phone || '',
            user_type: user.user_metadata?.user_type || 'cpo',
            created_at: user.created_at,
            updated_at: user.updated_at || user.created_at,
          },
          error: null,
        };
      }

      return { profile: data, error: null };
    } catch (error) {
      console.error('Get profile error:', error);
      return { profile: null, error: error as Error };
    }
  }

  /**
   * Get CPO profile details
   */
  async getCPOProfile(userId: string): Promise<{ profile: ProtectionOfficer | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('protection_officers')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return { profile: data, error: null };
    } catch (error) {
      console.error('Get CPO profile error:', error);
      return { profile: null, error: error as Error };
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, updates: Partial<ProfileData>): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) throw error;

      return { error: null };
    } catch (error) {
      console.error('Update profile error:', error);
      return { error: error as Error };
    }
  }

  /**
   * Reset password
   */
  async resetPassword(email: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      return { error: null };
    } catch (error) {
      console.error('Reset password error:', error);
      return { error: error as Error };
    }
  }

  /**
   * Update password
   */
  async updatePassword(newPassword: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      return { error: null };
    } catch (error) {
      console.error('Update password error:', error);
      return { error: error as Error };
    }
  }

  /**
   * Listen to auth state changes
   */
  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
  }
}

export const authService = new AuthService();
export default authService;
