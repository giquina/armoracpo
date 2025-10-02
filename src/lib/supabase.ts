import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our tables
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

// Database type for Supabase client
export type Database = {
  public: {
    Tables: {
      protection_officers: {
        Row: ProtectionOfficer;
        Insert: Omit<ProtectionOfficer, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<ProtectionOfficer, 'id' | 'created_at' | 'updated_at'>>;
      };
      protection_assignments: {
        Row: ProtectionAssignment;
        Insert: Omit<ProtectionAssignment, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<ProtectionAssignment, 'id' | 'created_at' | 'updated_at'>>;
      };
      payment_records: {
        Row: PaymentRecord;
        Insert: Omit<PaymentRecord, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<PaymentRecord, 'id' | 'created_at' | 'updated_at'>>;
      };
      incident_reports: {
        Row: IncidentReport;
        Insert: Omit<IncidentReport, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<IncidentReport, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
  };
};
