// MOCK MODE - All Supabase functionality disabled for testing
// This file provides mock implementations that match the real API surface

console.warn('[Supabase Mock] Running in MOCK MODE - no real Supabase connections will be made')

// ============================================================================
// TYPE DEFINITIONS (Keep all existing TypeScript interfaces)
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
// MOCK SUPABASE CLIENT
// ============================================================================

const createMockQueryBuilder = () => ({
  select: (query?: string) => {
    console.log('[Mock Query] select:', query);
    return createMockQueryBuilder();
  },
  insert: (data: any) => {
    console.log('[Mock Query] insert:', data);
    return createMockQueryBuilder();
  },
  update: (data: any) => {
    console.log('[Mock Query] update:', data);
    return createMockQueryBuilder();
  },
  upsert: (data: any) => {
    console.log('[Mock Query] upsert:', data);
    return createMockQueryBuilder();
  },
  delete: () => {
    console.log('[Mock Query] delete');
    return createMockQueryBuilder();
  },
  eq: (column: string, value: any) => {
    console.log('[Mock Query] eq:', column, value);
    return createMockQueryBuilder();
  },
  neq: (column: string, value: any) => {
    console.log('[Mock Query] neq:', column, value);
    return createMockQueryBuilder();
  },
  gt: (column: string, value: any) => {
    console.log('[Mock Query] gt:', column, value);
    return createMockQueryBuilder();
  },
  gte: (column: string, value: any) => {
    console.log('[Mock Query] gte:', column, value);
    return createMockQueryBuilder();
  },
  lt: (column: string, value: any) => {
    console.log('[Mock Query] lt:', column, value);
    return createMockQueryBuilder();
  },
  lte: (column: string, value: any) => {
    console.log('[Mock Query] lte:', column, value);
    return createMockQueryBuilder();
  },
  like: (column: string, pattern: string) => {
    console.log('[Mock Query] like:', column, pattern);
    return createMockQueryBuilder();
  },
  ilike: (column: string, pattern: string) => {
    console.log('[Mock Query] ilike:', column, pattern);
    return createMockQueryBuilder();
  },
  is: (column: string, value: any) => {
    console.log('[Mock Query] is:', column, value);
    return createMockQueryBuilder();
  },
  in: (column: string, values: any[]) => {
    console.log('[Mock Query] in:', column, values);
    return createMockQueryBuilder();
  },
  contains: (column: string, value: any) => {
    console.log('[Mock Query] contains:', column, value);
    return createMockQueryBuilder();
  },
  containedBy: (column: string, value: any) => {
    console.log('[Mock Query] containedBy:', column, value);
    return createMockQueryBuilder();
  },
  rangeGt: (column: string, range: string) => {
    console.log('[Mock Query] rangeGt:', column, range);
    return createMockQueryBuilder();
  },
  rangeGte: (column: string, range: string) => {
    console.log('[Mock Query] rangeGte:', column, range);
    return createMockQueryBuilder();
  },
  rangeLt: (column: string, range: string) => {
    console.log('[Mock Query] rangeLt:', column, range);
    return createMockQueryBuilder();
  },
  rangeLte: (column: string, range: string) => {
    console.log('[Mock Query] rangeLte:', column, range);
    return createMockQueryBuilder();
  },
  rangeAdjacent: (column: string, range: string) => {
    console.log('[Mock Query] rangeAdjacent:', column, range);
    return createMockQueryBuilder();
  },
  overlaps: (column: string, value: any) => {
    console.log('[Mock Query] overlaps:', column, value);
    return createMockQueryBuilder();
  },
  textSearch: (column: string, query: string, config?: any) => {
    console.log('[Mock Query] textSearch:', column, query, config);
    return createMockQueryBuilder();
  },
  match: (query: Record<string, any>) => {
    console.log('[Mock Query] match:', query);
    return createMockQueryBuilder();
  },
  not: (column: string, operator: string, value: any) => {
    console.log('[Mock Query] not:', column, operator, value);
    return createMockQueryBuilder();
  },
  or: (filters: string) => {
    console.log('[Mock Query] or:', filters);
    return createMockQueryBuilder();
  },
  filter: (column: string, operator: string, value: any) => {
    console.log('[Mock Query] filter:', column, operator, value);
    return createMockQueryBuilder();
  },
  order: (column: string, options?: any) => {
    console.log('[Mock Query] order:', column, options);
    return createMockQueryBuilder();
  },
  limit: (count: number) => {
    console.log('[Mock Query] limit:', count);
    return createMockQueryBuilder();
  },
  range: (from: number, to: number) => {
    console.log('[Mock Query] range:', from, to);
    return createMockQueryBuilder();
  },
  single: async () => {
    console.log('[Mock Query] single - returning empty data');
    return { data: null, error: null };
  },
  maybeSingle: async () => {
    console.log('[Mock Query] maybeSingle - returning empty data');
    return { data: null, error: null };
  },
  then: async (resolve: any) => {
    console.log('[Mock Query] then - returning empty data');
    return resolve({ data: [], error: null });
  },
});

const createMockChannel = (name: string) => ({
  on: (event: string, options: any, callback?: any) => {
    console.log('[Mock Channel] on:', name, event, options);
    return createMockChannel(name);
  },
  subscribe: (callback?: any) => {
    console.log('[Mock Channel] subscribe:', name);
    return {
      unsubscribe: () => {
        console.log('[Mock Channel] unsubscribe:', name);
      },
    };
  },
  unsubscribe: () => {
    console.log('[Mock Channel] unsubscribe:', name);
  },
});

export const supabase = {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,

    getUser: async () => {
      console.log('[Mock Auth] getUser - returning null user');
      return { data: { user: null }, error: null };
    },

    getSession: async () => {
      console.log('[Mock Auth] getSession - returning null session');
      return { data: { session: null }, error: null };
    },

    signUp: async (credentials: any) => {
      console.log('[Mock Auth] signUp:', credentials.email);
      return {
        data: {
          user: {
            id: 'mock-user-id',
            email: credentials.email,
            created_at: new Date().toISOString(),
          },
          session: {
            access_token: 'mock-access-token',
            refresh_token: 'mock-refresh-token',
          },
        },
        error: null,
      };
    },

    signInWithPassword: async (credentials: any) => {
      console.log('[Mock Auth] signInWithPassword:', credentials.email);
      return {
        data: {
          user: {
            id: 'mock-user-id',
            email: credentials.email,
          },
          session: {
            access_token: 'mock-access-token',
            refresh_token: 'mock-refresh-token',
          },
        },
        error: null,
      };
    },

    signInWithOAuth: async (options: any) => {
      console.log('[Mock Auth] signInWithOAuth:', options.provider);
      return { data: { url: '/dashboard' }, error: null };
    },

    signOut: async () => {
      console.log('[Mock Auth] signOut');
      return { error: null };
    },

    onAuthStateChange: (callback: any) => {
      console.log('[Mock Auth] onAuthStateChange - setting up listener');
      return {
        data: {
          subscription: {
            unsubscribe: () => {
              console.log('[Mock Auth] onAuthStateChange - unsubscribed');
            },
          },
        },
      };
    },

    resetPasswordForEmail: async (email: string) => {
      console.log('[Mock Auth] resetPasswordForEmail:', email);
      return { data: {}, error: null };
    },

    updateUser: async (attributes: any) => {
      console.log('[Mock Auth] updateUser:', attributes);
      return { data: { user: { id: 'mock-user-id', ...attributes } }, error: null };
    },
  },

  from: (table: string) => {
    console.log('[Mock] from:', table);
    return createMockQueryBuilder();
  },

  rpc: async (fn: string, params?: any) => {
    console.log('[Mock] rpc:', fn, params);
    return { data: null, error: null };
  },

  channel: (name: string) => {
    console.log('[Mock] channel:', name);
    return createMockChannel(name);
  },

  storage: {
    from: (bucket: string) => ({
      upload: async (path: string, file: any) => {
        console.log('[Mock Storage] upload:', bucket, path);
        return { data: { path }, error: null };
      },
      download: async (path: string) => {
        console.log('[Mock Storage] download:', bucket, path);
        return { data: new Blob(), error: null };
      },
      remove: async (paths: string[]) => {
        console.log('[Mock Storage] remove:', bucket, paths);
        return { data: paths, error: null };
      },
      getPublicUrl: (path: string) => {
        console.log('[Mock Storage] getPublicUrl:', bucket, path);
        return { data: { publicUrl: `https://mock-storage.url/${bucket}/${path}` } };
      },
    }),
  },
} as any;

// ============================================================================
// MOCK AUTH HELPER FUNCTIONS
// ============================================================================

export const signUpWithEmail = async (email: string, password: string, metadata?: any) => {
  console.log('[Mock] signUpWithEmail:', email, metadata);
  return await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
    },
  });
};

export const signInWithEmail = async (email: string, password: string) => {
  console.log('[Mock] signInWithEmail:', email);
  return await supabase.auth.signInWithPassword({
    email,
    password,
  });
};

export const signInWithGoogle = async () => {
  console.log('[Mock] signInWithGoogle');
  return await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: '/dashboard',
    },
  });
};

export const signOut = async () => {
  console.log('[Mock] signOut');
  return await supabase.auth.signOut();
};

export const getCurrentUser = async () => {
  console.log('[Mock] getCurrentUser - returning null');
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// ============================================================================
// MOCK PROTECTION SERVICE QUERIES
// ============================================================================

export const getProtectionOfficers = async (location?: string) => {
  console.log('[Mock] getProtectionOfficers:', location);
  return { data: [], error: null };
};

export const createProtectionAssignment = async (assignmentData: any) => {
  console.log('[Mock] createProtectionAssignment:', assignmentData);
  return { data: { id: 'mock-assignment-id', ...assignmentData }, error: null };
};

export const getProtectionAssignment = async (assignmentId: string) => {
  console.log('[Mock] getProtectionAssignment:', assignmentId);
  return { data: null, error: null };
};

export const updateProtectionAssignment = async (assignmentId: string, updates: any) => {
  console.log('[Mock] updateProtectionAssignment:', assignmentId, updates);
  return { data: { id: assignmentId, ...updates }, error: null };
};

export const getUserProfile = async (userId: string) => {
  console.log('[Mock] getUserProfile:', userId);
  return { data: null, error: null };
};

export const updateUserProfile = async (userId: string, updates: any) => {
  console.log('[Mock] updateUserProfile:', userId, updates);
  return { data: { id: userId, ...updates }, error: null };
};

export const getUserAssignments = async (userId: string) => {
  console.log('[Mock] getUserAssignments:', userId);
  return { data: [], error: null };
};

// ============================================================================
// MOCK REAL-TIME SUBSCRIPTIONS
// ============================================================================

export const subscribeToAssignmentUpdates = (assignmentId: string, callback: (payload: any) => void) => {
  console.log('[Mock] subscribeToAssignmentUpdates:', assignmentId);
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
  console.log('[Mock] subscribeToOfficerLocation:', officerId);
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
// MOCK EMERGENCY FUNCTIONS
// ============================================================================

export const activateEmergency = async (userId: string, location: any, assignmentId?: string) => {
  console.log('[Mock] activateEmergency:', userId, location, assignmentId);
  return {
    data: {
      id: 'mock-emergency-id',
      user_id: userId,
      assignment_id: assignmentId,
      activation_type: 'panic_button',
      location: location,
      response_status: 'activated',
      activated_at: new Date().toISOString(),
    },
    error: null,
  };
};

export const deactivateEmergency = async (emergencyId: string) => {
  console.log('[Mock] deactivateEmergency:', emergencyId);
  return {
    data: {
      id: emergencyId,
      response_status: 'resolved',
      resolved_at: new Date().toISOString(),
    },
    error: null,
  };
};

// ============================================================================
// MOCK PAYMENT OPERATIONS
// ============================================================================

export const createPaymentTransaction = async (transactionData: any) => {
  console.log('[Mock] createPaymentTransaction:', transactionData);
  return { data: { id: 'mock-payment-id', ...transactionData }, error: null };
};

export const updatePaymentStatus = async (transactionId: string, status: string, metadata?: any) => {
  console.log('[Mock] updatePaymentStatus:', transactionId, status, metadata);
  return {
    data: {
      id: transactionId,
      payment_status: status,
      payment_metadata: metadata,
      updated_at: new Date().toISOString(),
    },
    error: null,
  };
};

// ============================================================================
// MOCK QUESTIONNAIRE FUNCTIONS
// ============================================================================

export const saveQuestionnaireResponse = async (userId: string, responses: any) => {
  console.log('[Mock] saveQuestionnaireResponse:', userId, responses);
  return {
    data: {
      user_id: userId,
      responses: responses,
      completed: true,
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    error: null,
  };
};

export const getQuestionnaireResponse = async (userId: string) => {
  console.log('[Mock] getQuestionnaireResponse:', userId);
  return { data: null, error: null };
};

// ============================================================================
// MOCK REVIEW FUNCTIONS
// ============================================================================

export const createProtectionReview = async (reviewData: any) => {
  console.log('[Mock] createProtectionReview:', reviewData);
  return { data: { id: 'mock-review-id', ...reviewData }, error: null };
};

export const getOfficerReviews = async (officerId: string) => {
  console.log('[Mock] getOfficerReviews:', officerId);
  return { data: [], error: null };
};

// ============================================================================
// MOCK VENUE PROTECTION FUNCTIONS
// ============================================================================

export const createVenueProtectionContract = async (contractData: any) => {
  console.log('[Mock] createVenueProtectionContract:', contractData);
  return { data: { id: 'mock-contract-id', ...contractData }, error: null };
};

export const getVenueProtectionContracts = async (userId: string) => {
  console.log('[Mock] getVenueProtectionContracts:', userId);
  return { data: [], error: null };
};

// ============================================================================
// MOCK ANALYTICS FUNCTIONS
// ============================================================================

export const getAssignmentAnalytics = async (userId: string, startDate?: string, endDate?: string) => {
  console.log('[Mock] getAssignmentAnalytics:', userId, startDate, endDate);
  return { data: [], error: null };
};

// ============================================================================
// MOCK SAFE ASSIGNMENT FUND FUNCTIONS
// ============================================================================

export const recordSafeAssignmentFundContribution = async (contributionData: any) => {
  console.log('[Mock] recordSafeAssignmentFundContribution:', contributionData);
  return { data: { id: 'mock-contribution-id', ...contributionData }, error: null };
};

export const getSafeAssignmentFundStats = async () => {
  console.log('[Mock] getSafeAssignmentFundStats');
  return { data: null, error: null };
};

// ============================================================================
// MOCK SIA LICENSE VERIFICATION
// ============================================================================

export const verifySIALicense = async (licenseNumber: string) => {
  console.log('[Mock] verifySIALicense:', licenseNumber);
  return { data: null, error: null };
};

// ============================================================================
// MOCK OFFICER AVAILABILITY MANAGEMENT
// ============================================================================

export const updateOfficerAvailability = async (officerId: string, status: string, location?: any) => {
  console.log('[Mock] updateOfficerAvailability:', officerId, status, location);
  const updates: any = {
    availability_status: status,
    updated_at: new Date().toISOString(),
  };

  if (location) {
    updates.current_location = location;
  }

  return { data: { id: officerId, ...updates }, error: null };
};

// ============================================================================
// MOCK NEARBY OFFICERS SEARCH
// ============================================================================

export const findNearbyOfficers = async (lat: number, lng: number, radiusKm: number = 10, protectionLevel?: string) => {
  console.log('[Mock] findNearbyOfficers:', lat, lng, radiusKm, protectionLevel);
  return { data: [], error: null };
};

export default supabase;
