import { createClient } from '@supabase/supabase-js'

// Supabase configuration for Armora Protection Service
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Mock Supabase client for development without backend
const createMockSupabaseClient = (): any => {
  const mockChain = {
    select: () => mockChain,
    insert: () => mockChain,
    update: () => mockChain,
    delete: () => mockChain,
    upsert: () => mockChain,
    eq: () => mockChain,
    neq: () => mockChain,
    gt: () => mockChain,
    lt: () => mockChain,
    gte: () => mockChain,
    lte: () => mockChain,
    like: () => mockChain,
    ilike: () => mockChain,
    is: () => mockChain,
    in: () => mockChain,
    contains: () => mockChain,
    containedBy: () => mockChain,
    order: () => mockChain,
    limit: () => mockChain,
    range: () => mockChain,
    single: async () => ({ data: null, error: null }),
    maybeSingle: async () => ({ data: null, error: null }),
    then: async (resolve: any) => resolve({ data: [], error: null, count: 0 }),
  };

  return {
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      signInWithPassword: async () => ({ data: { user: null, session: null }, error: null }),
      signUp: async () => ({ data: { user: null, session: null }, error: null }),
      signOut: async () => ({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
    from: () => mockChain,
    channel: () => ({
      on: () => ({ on: () => ({ subscribe: () => ({ unsubscribe: () => {} }) }) }),
      subscribe: () => ({ unsubscribe: () => {} }),
    }),
    removeChannel: () => {},
  };
};

// Create Supabase client or mock if env vars are missing
export const supabase = (!supabaseUrl || !supabaseAnonKey) 
  ? createMockSupabaseClient()
  : createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      },
      global: {
        headers: {
          'x-application-name': 'armora-protection-service',
        },
      },
    });

// Flag to check if running with real Supabase or mock
export const isSupabaseEnabled = !!(supabaseUrl && supabaseAnonKey);

// CPO-specific types for the CPO app
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

// Auth helper functions
export const signUpWithEmail = async (email: string, password: string, metadata?: any) => {
  return await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
    },
  })
}

export const signInWithEmail = async (email: string, password: string) => {
  return await supabase.auth.signInWithPassword({
    email,
    password,
  })
}

export const signInWithGoogle = async () => {
  return await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/dashboard` : '/dashboard',
    },
  })
}

export const signOut = async () => {
  return await supabase.auth.signOut()
}

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// Protection service specific queries
export const getProtectionOfficers = async (location?: string) => {
  let query = supabase
    .from('protection_officers')
    .select('*')
    .eq('availability_status', 'available')
    .eq('active', true)

  if (location) {
    query = query.contains('coverage_areas', [location])
  }

  return await query
}

export const createProtectionAssignment = async (assignmentData: any) => {
  return await supabase
    .from('protection_assignments')
    .insert(assignmentData)
    .select()
    .single()
}

export const getProtectionAssignment = async (assignmentId: string) => {
  return await supabase
    .from('protection_assignments')
    .select(`
      *,
      protection_officers (
        full_name,
        sia_license_number,
        protection_level,
        vehicle_make_model,
        average_rating
      ),
      profiles (
        full_name,
        phone_number,
        emergency_contacts
      )
    `)
    .eq('id', assignmentId)
    .single()
}

export const updateProtectionAssignment = async (assignmentId: string, updates: any) => {
  return await supabase
    .from('protection_assignments')
    .update(updates)
    .eq('id', assignmentId)
    .select()
    .single()
}

export const getUserProfile = async (userId: string) => {
  return await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
}

export const updateUserProfile = async (userId: string, updates: any) => {
  return await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()
}

export const getUserAssignments = async (userId: string) => {
  return await supabase
    .from('protection_assignments')
    .select(`
      *,
      protection_officers (
        full_name,
        sia_license_number,
        average_rating
      )
    `)
    .eq('principal_id', userId)
    .order('created_at', { ascending: false })
}

// Real-time subscriptions
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
    .subscribe()
}

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
    .subscribe()
}

// Emergency activation
export const activateEmergency = async (userId: string, location: any, assignmentId?: string) => {
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
    .single()
}

export const deactivateEmergency = async (emergencyId: string) => {
  return await supabase
    .from('emergency_activations')
    .update({
      response_status: 'resolved',
      resolved_at: new Date().toISOString(),
    })
    .eq('id', emergencyId)
    .select()
    .single()
}

// Payment operations
export const createPaymentTransaction = async (transactionData: any) => {
  return await supabase
    .from('payment_transactions')
    .insert(transactionData)
    .select()
    .single()
}

export const updatePaymentStatus = async (transactionId: string, status: string, metadata?: any) => {
  return await supabase
    .from('payment_transactions')
    .update({
      payment_status: status,
      payment_metadata: metadata,
      updated_at: new Date().toISOString(),
    })
    .eq('id', transactionId)
    .select()
    .single()
}

// Questionnaire responses
export const saveQuestionnaireResponse = async (userId: string, responses: any) => {
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
    .single()
}

export const getQuestionnaireResponse = async (userId: string) => {
  return await supabase
    .from('questionnaire_responses')
    .select('*')
    .eq('user_id', userId)
    .single()
}

// Protection reviews
export const createProtectionReview = async (reviewData: any) => {
  return await supabase
    .from('protection_reviews')
    .insert(reviewData)
    .select()
    .single()
}

export const getOfficerReviews = async (officerId: string) => {
  return await supabase
    .from('protection_reviews')
    .select(`
      *,
      profiles (
        full_name
      )
    `)
    .eq('officer_id', officerId)
    .order('created_at', { ascending: false })
}

// Venue protection services
export const createVenueProtectionContract = async (contractData: any) => {
  return await supabase
    .from('venue_protection_contracts')
    .insert(contractData)
    .select()
    .single()
}

export const getVenueProtectionContracts = async (userId: string) => {
  return await supabase
    .from('venue_protection_contracts')
    .select('*')
    .eq('client_id', userId)
    .order('created_at', { ascending: false })
}

// Analytics and reporting
export const getAssignmentAnalytics = async (userId: string, startDate?: string, endDate?: string) => {
  let query = supabase
    .from('protection_assignments')
    .select('*')
    .eq('principal_id', userId)
    .eq('assignment_status', 'completed')

  if (startDate) {
    query = query.gte('completed_at', startDate)
  }

  if (endDate) {
    query = query.lte('completed_at', endDate)
  }

  return await query
}

// Safe Assignment Fund operations
export const recordSafeAssignmentFundContribution = async (contributionData: any) => {
  return await supabase
    .from('safe_ride_fund_contributions')
    .insert(contributionData)
    .select()
    .single()
}

export const getSafeAssignmentFundStats = async () => {
  return await supabase
    .from('safe_ride_fund_stats')
    .select('*')
    .single()
}

// SIA license verification
export const verifySIALicense = async (licenseNumber: string) => {
  return await supabase
    .from('sia_license_verifications')
    .select('*')
    .eq('license_number', licenseNumber)
    .single()
}

// Officer availability management
export const updateOfficerAvailability = async (officerId: string, status: string, location?: any) => {
  const updates: any = {
    availability_status: status,
    updated_at: new Date().toISOString(),
  }

  if (location) {
    updates.current_location = location
  }

  return await supabase
    .from('protection_officers')
    .update(updates)
    .eq('id', officerId)
    .select()
    .single()
}

// Search for nearby protection officers
export const findNearbyOfficers = async (lat: number, lng: number, radiusKm: number = 10, protectionLevel?: string) => {
  // Using PostGIS ST_DWithin for geographic proximity search
  let query = supabase.rpc('find_nearby_officers', {
    lat,
    lng,
    radius_km: radiusKm,
  })

  if (protectionLevel) {
    query = query.eq('protection_level', protectionLevel)
  }

  return await query
}

export default supabase