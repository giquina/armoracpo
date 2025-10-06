// Real Supabase client implementation
import { createClient } from '@supabase/supabase-js';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface ProtectionOfficer {
  id: string;
  user_id: string;
  sia_license_number: string;
  sia_license_type: string;
  sia_license_expiry: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  profile_photo_url?: string;
  date_of_birth: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  postcode: string;
  country: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  vehicle_make?: string;
  vehicle_model?: string;
  vehicle_color?: string;
  vehicle_registration?: string;
  bank_account_name?: string;
  bank_sort_code?: string;
  bank_account_number?: string;
  national_insurance_number?: string;
  right_to_work_status: string;
  right_to_work_document_url?: string;
  is_available: boolean;
  current_latitude?: number;
  current_longitude?: number;
  rating?: number;
  total_assignments?: number;
  created_at: string;
  updated_at: string;
  verification_status: 'pending' | 'verified' | 'rejected';
  fcm_token?: string;
}

export interface ProtectionAssignment {
  id: string;
  principal_id: string;
  cpo_id?: string;
  pickup_location: string;
  pickup_latitude: number;
  pickup_longitude: number;
  dropoff_location?: string;
  dropoff_latitude?: number;
  dropoff_longitude?: number;
  scheduled_start_time: string;
  scheduled_end_time?: string;
  actual_start_time?: string;
  actual_end_time?: string;
  assignment_type: 'close_protection' | 'event_security' | 'residential_security' | 'executive_protection' | 'transport_security';
  threat_level: 'low' | 'medium' | 'high' | 'critical';
  special_instructions?: string;
  required_certifications?: string[];
  status: 'pending' | 'assigned' | 'en_route' | 'active' | 'completed' | 'cancelled';
  base_rate: number;
  estimated_duration_hours?: number;
  total_cost?: number;
  principal_name: string;
  principal_phone: string;
  principal_photo_url?: string;
  vehicle_required: boolean;
  armed_protection_required: boolean;
  number_of_cpos_required: number;
  created_at: string;
  updated_at: string;
    job_title?: string;
}

export interface PaymentRecord {
  id: string;
  assignment_id: string;
  cpo_id: string;
  amount: number;
  currency: string;
  payment_method: 'bank_transfer' | 'stripe' | 'paypal';
  payment_status: 'pending' | 'processing' | 'completed' | 'failed';
  stripe_payment_intent_id?: string;
  paid_at?: string;
  created_at: string;
  updated_at: string;
}

export interface IncidentReport {
  id: string;
  assignment_id: string;
  cpo_id: string;
  incident_type: 'threat' | 'medical' | 'property_damage' | 'protocol_breach' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  location: string;
  latitude?: number;
  longitude?: number;
  incident_time: string;
  witnesses?: string[];
  police_notified: boolean;
  police_reference?: string;
  photos?: string[];
  video_evidence?: string[];
  created_at: string;
  updated_at: string;
}

export interface AssignmentMessage {
  id: string;
  assignment_id: string;
  sender_type: 'principal' | 'cpo';
  sender_id: string;
  message: string;
  read: boolean;
  created_at: string;
}

// ============================================================================
// REAL SUPABASE CLIENT
// ============================================================================

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

if (!supabaseAnonKey && !process.env.REACT_APP_SUPABASE_URL) {
  console.warn('[Supabase] No environment variables found. Set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY in your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// ============================================================================
// AUTH HELPER FUNCTIONS
// ============================================================================

export const signUpWithEmail = async (email: string, password: string, metadata?: any) => {
  try {
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });
  } catch (error) {
    console.error('[Supabase] signUpWithEmail error:', error);
    return { data: { user: null, session: null }, error: error as Error };
  }
};

export const signInWithEmail = async (email: string, password: string) => {
  try {
    return await supabase.auth.signInWithPassword({
      email,
      password,
    });
  } catch (error) {
    console.error('[Supabase] signInWithEmail error:', error);
    return { data: { user: null, session: null }, error: error as Error };
  }
};

export const signInWithGoogle = async () => {
  try {
    return await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
  } catch (error) {
    console.error('[Supabase] signInWithGoogle error:', error);
    return { data: { url: null, provider: 'google' }, error: error as Error };
  }
};

export const signOut = async () => {
  try {
    return await supabase.auth.signOut();
  } catch (error) {
    console.error('[Supabase] signOut error:', error);
    return { error: error as Error };
  }
};

export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  } catch (error) {
    console.error('[Supabase] getCurrentUser error:', error);
    return null;
  }
};

// ============================================================================
// PROTECTION SERVICE QUERIES
// ============================================================================

export const getProtectionOfficers = async (location?: string) => {
  try {
    let query = supabase
      .from('protection_officers')
      .select('*')
      .eq('is_available', true);

    if (location) {
      query = query.eq('city', location);
    }

    return await query;
  } catch (error) {
    console.error('[Supabase] getProtectionOfficers error:', error);
    return { data: null, error: error as Error };
  }
};

export const createProtectionAssignment = async (assignmentData: any) => {
  try {
    return await supabase
      .from('protection_assignments')
      .insert(assignmentData)
      .select()
      .single();
  } catch (error) {
    console.error('[Supabase] createProtectionAssignment error:', error);
    return { data: null, error: error as Error };
  }
};

export const getProtectionAssignment = async (assignmentId: string) => {
  try {
    return await supabase
      .from('protection_assignments')
      .select('*')
      .eq('id', assignmentId)
      .single();
  } catch (error) {
    console.error('[Supabase] getProtectionAssignment error:', error);
    return { data: null, error: error as Error };
  }
};

export const updateProtectionAssignment = async (assignmentId: string, updates: any) => {
  try {
    return await supabase
      .from('protection_assignments')
      .update(updates)
      .eq('id', assignmentId)
      .select()
      .single();
  } catch (error) {
    console.error('[Supabase] updateProtectionAssignment error:', error);
    return { data: null, error: error as Error };
  }
};

export const getUserProfile = async (userId: string) => {
  try {
    return await supabase
      .from('protection_officers')
      .select('*')
      .eq('user_id', userId)
      .single();
  } catch (error) {
    console.error('[Supabase] getUserProfile error:', error);
    return { data: null, error: error as Error };
  }
};

export const updateUserProfile = async (userId: string, updates: any) => {
  try {
    return await supabase
      .from('protection_officers')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();
  } catch (error) {
    console.error('[Supabase] updateUserProfile error:', error);
    return { data: null, error: error as Error };
  }
};

export const getUserAssignments = async (userId: string) => {
  try {
    return await supabase
      .from('protection_assignments')
      .select('*')
      .eq('cpo_id', userId)
      .order('scheduled_start_time', { ascending: false });
  } catch (error) {
    console.error('[Supabase] getUserAssignments error:', error);
    return { data: null, error: error as Error };
  }
};

// ============================================================================
// REAL-TIME SUBSCRIPTIONS
// ============================================================================

export const subscribeToAssignmentUpdates = (assignmentId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`assignment-${assignmentId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'protection_assignments',
        filter: `id=eq.${assignmentId}`,
      },
      callback
    )
    .subscribe();
};

export const subscribeToOfficerLocation = (officerId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`officer-location-${officerId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'protection_officers',
        filter: `id=eq.${officerId}`,
      },
      callback
    )
    .subscribe();
};

// ============================================================================
// EMERGENCY FUNCTIONS
// ============================================================================

export const activateEmergency = async (userId: string, location: any, assignmentId?: string) => {
  try {
    return await supabase
      .from('emergency_activations')
      .insert({
        user_id: userId,
        assignment_id: assignmentId,
        activation_type: 'panic_button',
        location: location,
        response_status: 'activated',
        activated_at: new Date().toISOString(),
      })
      .select()
      .single();
  } catch (error) {
    console.error('[Supabase] activateEmergency error:', error);
    return { data: null, error: error as Error };
  }
};

export const deactivateEmergency = async (emergencyId: string) => {
  try {
    return await supabase
      .from('emergency_activations')
      .update({
        response_status: 'resolved',
        resolved_at: new Date().toISOString(),
      })
      .eq('id', emergencyId)
      .select()
      .single();
  } catch (error) {
    console.error('[Supabase] deactivateEmergency error:', error);
    return { data: null, error: error as Error };
  }
};

// ============================================================================
// PAYMENT OPERATIONS
// ============================================================================

export const createPaymentTransaction = async (transactionData: any) => {
  try {
    return await supabase
      .from('payment_records')
      .insert(transactionData)
      .select()
      .single();
  } catch (error) {
    console.error('[Supabase] createPaymentTransaction error:', error);
    return { data: null, error: error as Error };
  }
};

export const updatePaymentStatus = async (transactionId: string, status: string, metadata?: any) => {
  try {
    return await supabase
      .from('payment_records')
      .update({
        payment_status: status,
        payment_metadata: metadata,
        updated_at: new Date().toISOString(),
      })
      .eq('id', transactionId)
      .select()
      .single();
  } catch (error) {
    console.error('[Supabase] updatePaymentStatus error:', error);
    return { data: null, error: error as Error };
  }
};

// ============================================================================
// QUESTIONNAIRE FUNCTIONS
// ============================================================================

export const saveQuestionnaireResponse = async (userId: string, responses: any) => {
  try {
    return await supabase
      .from('questionnaire_responses')
      .upsert({
        user_id: userId,
        responses: responses,
        completed: true,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();
  } catch (error) {
    console.error('[Supabase] saveQuestionnaireResponse error:', error);
    return { data: null, error: error as Error };
  }
};

export const getQuestionnaireResponse = async (userId: string) => {
  try {
    return await supabase
      .from('questionnaire_responses')
      .select('*')
      .eq('user_id', userId)
      .single();
  } catch (error) {
    console.error('[Supabase] getQuestionnaireResponse error:', error);
    return { data: null, error: error as Error };
  }
};

// ============================================================================
// REVIEW FUNCTIONS
// ============================================================================

export const createProtectionReview = async (reviewData: any) => {
  try {
    return await supabase
      .from('protection_reviews')
      .insert(reviewData)
      .select()
      .single();
  } catch (error) {
    console.error('[Supabase] createProtectionReview error:', error);
    return { data: null, error: error as Error };
  }
};

export const getOfficerReviews = async (officerId: string) => {
  try {
    return await supabase
      .from('protection_reviews')
      .select('*')
      .eq('officer_id', officerId)
      .order('created_at', { ascending: false });
  } catch (error) {
    console.error('[Supabase] getOfficerReviews error:', error);
    return { data: null, error: error as Error };
  }
};

// ============================================================================
// VENUE PROTECTION FUNCTIONS
// ============================================================================

export const createVenueProtectionContract = async (contractData: any) => {
  try {
    return await supabase
      .from('venue_protection_contracts')
      .insert(contractData)
      .select()
      .single();
  } catch (error) {
    console.error('[Supabase] createVenueProtectionContract error:', error);
    return { data: null, error: error as Error };
  }
};

export const getVenueProtectionContracts = async (userId: string) => {
  try {
    return await supabase
      .from('venue_protection_contracts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
  } catch (error) {
    console.error('[Supabase] getVenueProtectionContracts error:', error);
    return { data: null, error: error as Error };
  }
};

// ============================================================================
// ANALYTICS FUNCTIONS
// ============================================================================

export const getAssignmentAnalytics = async (userId: string, startDate?: string, endDate?: string) => {
  try {
    let query = supabase
      .from('protection_assignments')
      .select('*')
      .eq('cpo_id', userId);

    if (startDate) {
      query = query.gte('scheduled_start_time', startDate);
    }
    if (endDate) {
      query = query.lte('scheduled_start_time', endDate);
    }

    return await query;
  } catch (error) {
    console.error('[Supabase] getAssignmentAnalytics error:', error);
    return { data: null, error: error as Error };
  }
};

// ============================================================================
// SAFE ASSIGNMENT FUND FUNCTIONS
// ============================================================================

export const recordSafeAssignmentFundContribution = async (contributionData: any) => {
  try {
    return await supabase
      .from('safe_assignment_fund_contributions')
      .insert(contributionData)
      .select()
      .single();
  } catch (error) {
    console.error('[Supabase] recordSafeAssignmentFundContribution error:', error);
    return { data: null, error: error as Error };
  }
};

export const getSafeAssignmentFundStats = async () => {
  try {
    return await supabase
      .from('safe_assignment_fund_stats')
      .select('*')
      .single();
  } catch (error) {
    console.error('[Supabase] getSafeAssignmentFundStats error:', error);
    return { data: null, error: error as Error };
  }
};

// ============================================================================
// SIA LICENSE VERIFICATION
// ============================================================================

export const verifySIALicense = async (licenseNumber: string) => {
  try {
    return await supabase.rpc('verify_sia_license', { license_number: licenseNumber });
  } catch (error) {
    console.error('[Supabase] verifySIALicense error:', error);
    return { data: null, error: error as Error };
  }
};

// ============================================================================
// OFFICER AVAILABILITY MANAGEMENT
// ============================================================================

export const updateOfficerAvailability = async (officerId: string, status: string, location?: any) => {
  try {
    const updates: any = {
      availability_status: status,
      updated_at: new Date().toISOString(),
    };

    if (location) {
      updates.current_location = location;
    }

    return await supabase
      .from('protection_officers')
      .update(updates)
      .eq('id', officerId)
      .select()
      .single();
  } catch (error) {
    console.error('[Supabase] updateOfficerAvailability error:', error);
    return { data: null, error: error as Error };
  }
};

// ============================================================================
// NEARBY OFFICERS SEARCH
// ============================================================================

export const findNearbyOfficers = async (lat: number, lng: number, radiusKm: number = 10, protectionLevel?: string) => {
  try {
    const params: any = { lat, lng, radius_km: radiusKm };
    if (protectionLevel) {
      params.protection_level = protectionLevel;
    }

    return await supabase.rpc('find_nearby_officers', params);
  } catch (error) {
    console.error('[Supabase] findNearbyOfficers error:', error);
    return { data: null, error: error as Error };
  }
};

export default supabase;
