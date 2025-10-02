import { supabase, ProtectionOfficer } from '../lib/supabase';
import { requestNotificationPermission } from '../lib/firebase';

export const authService = {
  /**
   * Sign in with email and password
   */
  async login(email: string, password: string) {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('No user returned from authentication');

      // Get CPO profile
      const cpoProfile = await this.getCPOProfile(authData.user.id);

      // Check verification status
      if (cpoProfile.verification_status !== 'verified') {
        await supabase.auth.signOut();
        throw new Error('Your account is pending verification. Please contact support.');
      }

      // Request notification permission
      await requestNotificationPermission(authData.user.id);

      return { user: authData.user, cpo: cpoProfile };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to sign in');
    }
  },

  /**
   * Get CPO profile by user ID
   */
  async getCPOProfile(userId: string): Promise<ProtectionOfficer> {
    const { data, error } = await supabase
      .from('protection_officers')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    if (!data) throw new Error('CPO profile not found');

    return data;
  },

  /**
   * Get current authenticated user
   */
  async getCurrentUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const cpoProfile = await this.getCPOProfile(user.id);
      return { user, cpo: cpoProfile };
    } catch (error) {
      return null;
    }
  },

  /**
   * Sign out
   */
  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  /**
   * Update CPO availability status
   */
  async updateAvailability(cpoId: string, isAvailable: boolean) {
    const { data, error } = await supabase
      .from('protection_officers')
      .update({ is_available: isAvailable })
      .eq('id', cpoId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update CPO location
   */
  async updateLocation(cpoId: string, latitude: number, longitude: number) {
    const { data, error } = await supabase
      .from('protection_officers')
      .update({
        current_latitude: latitude,
        current_longitude: longitude,
      })
      .eq('id', cpoId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update FCM token for push notifications
   */
  async updateFCMToken(userId: string, token: string) {
    const { error } = await supabase
      .from('protection_officers')
      .update({ fcm_token: token })
      .eq('user_id', userId);

    if (error) throw error;
  },

  /**
   * Update CPO profile
   */
  async updateProfile(cpoId: string, updates: Partial<ProtectionOfficer>) {
    const { data, error } = await supabase
      .from('protection_officers')
      .update(updates)
      .eq('id', cpoId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update CPO profile by user ID
   */
  async updateProfileByUserId(userId: string, updates: Partial<ProtectionOfficer>) {
    const { data, error } = await supabase
      .from('protection_officers')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
