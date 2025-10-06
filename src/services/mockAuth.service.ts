/**
 * Mock Authentication Service
 * Provides fake authentication for UI testing without backend
 */

import { ProtectionOfficer } from '../lib/supabase';

// Mock CPO user for testing
const mockCPO: ProtectionOfficer = {
  id: 'mock-cpo-001',
  user_id: 'mock-user-001',
  first_name: 'John',
  last_name: 'Smith',
  email: 'john.smith@armoracpo.com',
  phone: '+44 7700 900000',
  date_of_birth: '1985-06-15',
  sia_license_number: 'SIA123456789',
  sia_license_type: 'Close Protection',
  sia_license_expiry: '2026-12-31',
  verification_status: 'verified',
  is_available: true,
  current_latitude: 51.5074,
  current_longitude: -0.1278,
  rating: 4.8,
  total_assignments: 47,
  profile_photo_url: undefined,
  fcm_token: undefined,
  address_line1: '123 Security Street',
  address_line2: undefined,
  city: 'London',
  postcode: 'SW1A 1AA',
  country: 'United Kingdom',
  emergency_contact_name: 'Jane Smith',
  emergency_contact_phone: '+44 7700 900001',
  right_to_work_status: 'verified',
  right_to_work_document_url: undefined,
  created_at: '2023-01-15T10:00:00Z',
  updated_at: new Date().toISOString(),
};

const mockUser = {
  id: 'mock-user-001',
  email: 'john.smith@armoracpo.com',
  user_metadata: {
    first_name: 'John',
    last_name: 'Smith',
  },
};

const mockSession = {
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  token_type: 'bearer',
  user: mockUser,
};

class MockAuthService {
  /**
   * Mock login - always succeeds
   */
  async login(email: string, password: string) {
    console.log('[MOCK AUTH] Login:', email);
    return {
      user: mockUser,
      cpo: mockCPO,
      session: mockSession,
    };
  }

  /**
   * Mock signup - always succeeds
   */
  async signup(email: string, password: string, userData: any) {
    console.log('[MOCK AUTH] Signup:', email);
    return {
      user: mockUser,
      cpo: mockCPO,
      session: mockSession,
    };
  }

  /**
   * Mock logout
   */
  async logout() {
    console.log('[MOCK AUTH] Logout');
    return;
  }

  /**
   * Get current user - returns mock user
   */
  async getCurrentUser() {
    return {
      user: mockUser,
      cpo: mockCPO,
      session: mockSession,
    };
  }

  /**
   * Get current session
   */
  async getSession() {
    return mockSession;
  }

  /**
   * Get CPO profile
   */
  async getCPOProfile(userId: string) {
    return mockCPO;
  }

  /**
   * Update availability
   */
  async updateAvailability(cpoId: string, isAvailable: boolean) {
    console.log('[MOCK AUTH] Update availability:', isAvailable);
    mockCPO.is_available = isAvailable;
    return { ...mockCPO };
  }

  /**
   * Update location
   */
  async updateLocation(cpoId: string, latitude: number, longitude: number) {
    console.log('[MOCK AUTH] Update location:', latitude, longitude);
    mockCPO.current_latitude = latitude;
    mockCPO.current_longitude = longitude;
    mockCPO.updated_at = new Date().toISOString();
    return { ...mockCPO };
  }

  /**
   * Update profile
   */
  async updateProfile(cpoId: string, updates: Partial<ProtectionOfficer>) {
    console.log('[MOCK AUTH] Update profile:', updates);
    Object.assign(mockCPO, updates);
    return { ...mockCPO };
  }

  /**
   * Auth state change listener (mock)
   */
  onAuthStateChange(callback: (event: string, session: any) => void) {
    // Immediately trigger signed in state
    setTimeout(() => {
      callback('SIGNED_IN', mockSession);
    }, 100);

    // Return unsubscribe function
    return {
      data: {
        subscription: {
          unsubscribe: () => console.log('[MOCK AUTH] Unsubscribed'),
        },
      },
    };
  }

  /**
   * Password reset (mock)
   */
  async resetPassword(email: string) {
    console.log('[MOCK AUTH] Password reset:', email);
    return;
  }

  /**
   * Update password (mock)
   */
  async updatePassword(newPassword: string) {
    console.log('[MOCK AUTH] Password updated');
    return;
  }
}

export const mockAuthService = new MockAuthService();
export default mockAuthService;
