-- Armora CPO Platform - Initial Database Schema Migration
-- Migration: 20250101000000_initial_schema
-- Description: Creates all core tables for the Armora CPO platform

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom enum types
CREATE TYPE verification_status_enum AS ENUM ('pending', 'verified', 'rejected');
CREATE TYPE assignment_type_enum AS ENUM ('close_protection', 'event_security', 'residential_security', 'executive_protection', 'transport_security');
CREATE TYPE threat_level_enum AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE assignment_status_enum AS ENUM ('pending', 'assigned', 'en_route', 'active', 'completed', 'cancelled');
CREATE TYPE payment_method_enum AS ENUM ('bank_transfer', 'stripe', 'paypal');
CREATE TYPE payment_status_enum AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TYPE incident_type_enum AS ENUM ('threat', 'medical', 'property_damage', 'protocol_breach', 'other');
CREATE TYPE severity_enum AS ENUM ('low', 'medium', 'high', 'critical');

-- =====================================================
-- Table: protection_officers
-- Description: Stores all protection officer profiles and credentials
-- =====================================================
CREATE TABLE protection_officers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,

    -- SIA License Information
    sia_license_number VARCHAR(50),
    sia_license_type VARCHAR(100),
    sia_license_expiry TIMESTAMPTZ,

    -- Personal Information
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    profile_photo_url TEXT,
    date_of_birth DATE,

    -- Address Information
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    address_city VARCHAR(100),
    address_postcode VARCHAR(20),
    address_country VARCHAR(100) DEFAULT 'United Kingdom',

    -- Emergency Contact
    emergency_contact_name VARCHAR(200),
    emergency_contact_phone VARCHAR(20),

    -- Vehicle Information
    vehicle_make VARCHAR(100),
    vehicle_model VARCHAR(100),
    vehicle_color VARCHAR(50),
    vehicle_registration VARCHAR(20),

    -- Banking Information
    bank_account_name VARCHAR(200),
    bank_sort_code VARCHAR(10),
    bank_account_number VARCHAR(20),

    -- Employment & Legal
    national_insurance_number VARCHAR(20),
    right_to_work_status VARCHAR(50),
    right_to_work_document_url TEXT,

    -- Availability & Location
    is_available BOOLEAN DEFAULT true,
    current_latitude DECIMAL(10, 8),
    current_longitude DECIMAL(11, 8),

    -- Performance Metrics
    rating DECIMAL(3, 2) DEFAULT 0.00,
    total_assignments INTEGER DEFAULT 0,

    -- Verification
    verification_status verification_status_enum DEFAULT 'pending',

    -- Push Notifications
    fcm_token TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for protection_officers
CREATE INDEX idx_protection_officers_user_id ON protection_officers(user_id);
CREATE INDEX idx_protection_officers_verification_status ON protection_officers(verification_status);
CREATE INDEX idx_protection_officers_is_available ON protection_officers(is_available);
CREATE INDEX idx_protection_officers_location ON protection_officers(current_latitude, current_longitude);
CREATE INDEX idx_protection_officers_sia_license_number ON protection_officers(sia_license_number);
CREATE INDEX idx_protection_officers_email ON protection_officers(email);

-- =====================================================
-- Table: protection_assignments
-- Description: Stores all protection assignments/jobs
-- =====================================================
CREATE TABLE protection_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Relationships
    principal_id UUID,
    cpo_id UUID REFERENCES protection_officers(id) ON DELETE SET NULL,

    -- Pickup Location
    pickup_location TEXT NOT NULL,
    pickup_latitude DECIMAL(10, 8),
    pickup_longitude DECIMAL(11, 8),

    -- Dropoff Location (nullable for static assignments)
    dropoff_location TEXT,
    dropoff_latitude DECIMAL(10, 8),
    dropoff_longitude DECIMAL(11, 8),

    -- Scheduling
    scheduled_start_time TIMESTAMPTZ NOT NULL,
    scheduled_end_time TIMESTAMPTZ,
    actual_start_time TIMESTAMPTZ,
    actual_end_time TIMESTAMPTZ,

    -- Assignment Details
    assignment_type assignment_type_enum NOT NULL,
    threat_level threat_level_enum DEFAULT 'low',
    special_instructions TEXT,
    required_certifications TEXT[],
    job_title VARCHAR(255),

    -- Status
    status assignment_status_enum DEFAULT 'pending',

    -- Financial
    base_rate DECIMAL(10, 2),
    estimated_duration_hours DECIMAL(5, 2),
    total_cost DECIMAL(10, 2),

    -- Principal Information
    principal_name VARCHAR(200) NOT NULL,
    principal_phone VARCHAR(20),
    principal_photo_url TEXT,

    -- Requirements
    vehicle_required BOOLEAN DEFAULT false,
    armed_protection_required BOOLEAN DEFAULT false,
    number_of_cpos_required INTEGER DEFAULT 1,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for protection_assignments
CREATE INDEX idx_protection_assignments_cpo_id ON protection_assignments(cpo_id);
CREATE INDEX idx_protection_assignments_principal_id ON protection_assignments(principal_id);
CREATE INDEX idx_protection_assignments_status ON protection_assignments(status);
CREATE INDEX idx_protection_assignments_assignment_type ON protection_assignments(assignment_type);
CREATE INDEX idx_protection_assignments_scheduled_start_time ON protection_assignments(scheduled_start_time);
CREATE INDEX idx_protection_assignments_threat_level ON protection_assignments(threat_level);
CREATE INDEX idx_protection_assignments_pickup_location ON protection_assignments(pickup_latitude, pickup_longitude);

-- =====================================================
-- Table: payment_records
-- Description: Tracks all payments to protection officers
-- =====================================================
CREATE TABLE payment_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Relationships
    assignment_id UUID REFERENCES protection_assignments(id) ON DELETE CASCADE,
    cpo_id UUID REFERENCES protection_officers(id) ON DELETE CASCADE,

    -- Payment Details
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'GBP',
    payment_method payment_method_enum DEFAULT 'bank_transfer',
    payment_status payment_status_enum DEFAULT 'pending',

    -- External Payment Reference
    stripe_payment_intent_id VARCHAR(255),

    -- Payment Date
    paid_at TIMESTAMPTZ,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for payment_records
CREATE INDEX idx_payment_records_assignment_id ON payment_records(assignment_id);
CREATE INDEX idx_payment_records_cpo_id ON payment_records(cpo_id);
CREATE INDEX idx_payment_records_payment_status ON payment_records(payment_status);
CREATE INDEX idx_payment_records_stripe_payment_intent_id ON payment_records(stripe_payment_intent_id);
CREATE INDEX idx_payment_records_created_at ON payment_records(created_at);

-- =====================================================
-- Table: incident_reports
-- Description: Stores incident reports filed by CPOs
-- =====================================================
CREATE TABLE incident_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Relationships
    assignment_id UUID REFERENCES protection_assignments(id) ON DELETE CASCADE,
    cpo_id UUID REFERENCES protection_officers(id) ON DELETE CASCADE,

    -- Incident Classification
    incident_type incident_type_enum NOT NULL,
    severity severity_enum DEFAULT 'low',

    -- Incident Details
    description TEXT NOT NULL,
    location TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    incident_time TIMESTAMPTZ NOT NULL,
    witnesses TEXT[],

    -- Police Involvement
    police_notified BOOLEAN DEFAULT false,
    police_reference VARCHAR(100),

    -- Evidence
    photos TEXT[],
    video_evidence TEXT[],

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for incident_reports
CREATE INDEX idx_incident_reports_assignment_id ON incident_reports(assignment_id);
CREATE INDEX idx_incident_reports_cpo_id ON incident_reports(cpo_id);
CREATE INDEX idx_incident_reports_incident_type ON incident_reports(incident_type);
CREATE INDEX idx_incident_reports_severity ON incident_reports(severity);
CREATE INDEX idx_incident_reports_incident_time ON incident_reports(incident_time);
CREATE INDEX idx_incident_reports_location ON incident_reports(latitude, longitude);

-- =====================================================
-- Triggers for updated_at timestamps
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to all tables
CREATE TRIGGER update_protection_officers_updated_at
    BEFORE UPDATE ON protection_officers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_protection_assignments_updated_at
    BEFORE UPDATE ON protection_assignments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_records_updated_at
    BEFORE UPDATE ON payment_records
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_incident_reports_updated_at
    BEFORE UPDATE ON incident_reports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Row Level Security (RLS) Policies
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE protection_officers ENABLE ROW LEVEL SECURITY;
ALTER TABLE protection_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_reports ENABLE ROW LEVEL SECURITY;

-- Protection Officers Policies
CREATE POLICY "Protection officers can view their own profile"
    ON protection_officers FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Protection officers can update their own profile"
    ON protection_officers FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Anyone can insert a protection officer profile"
    ON protection_officers FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Protection Assignments Policies
CREATE POLICY "CPOs can view their assigned jobs"
    ON protection_assignments FOR SELECT
    USING (
        cpo_id IN (
            SELECT id FROM protection_officers WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "CPOs can update their assigned jobs"
    ON protection_assignments FOR UPDATE
    USING (
        cpo_id IN (
            SELECT id FROM protection_officers WHERE user_id = auth.uid()
        )
    );

-- Payment Records Policies
CREATE POLICY "CPOs can view their own payment records"
    ON payment_records FOR SELECT
    USING (
        cpo_id IN (
            SELECT id FROM protection_officers WHERE user_id = auth.uid()
        )
    );

-- Incident Reports Policies
CREATE POLICY "CPOs can view their own incident reports"
    ON incident_reports FOR SELECT
    USING (
        cpo_id IN (
            SELECT id FROM protection_officers WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "CPOs can create incident reports for their assignments"
    ON incident_reports FOR INSERT
    WITH CHECK (
        cpo_id IN (
            SELECT id FROM protection_officers WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "CPOs can update their own incident reports"
    ON incident_reports FOR UPDATE
    USING (
        cpo_id IN (
            SELECT id FROM protection_officers WHERE user_id = auth.uid()
        )
    );

-- =====================================================
-- Comments for documentation
-- =====================================================

COMMENT ON TABLE protection_officers IS 'Stores all protection officer profiles, credentials, and availability status';
COMMENT ON TABLE protection_assignments IS 'Stores all protection assignments/jobs with scheduling and principal information';
COMMENT ON TABLE payment_records IS 'Tracks all payments made to protection officers for completed assignments';
COMMENT ON TABLE incident_reports IS 'Stores incident reports filed by CPOs during or after assignments';

COMMENT ON COLUMN protection_officers.verification_status IS 'Verification status of the CPO profile (pending, verified, rejected)';
COMMENT ON COLUMN protection_officers.is_available IS 'Whether the CPO is currently available for new assignments';
COMMENT ON COLUMN protection_assignments.status IS 'Current status of the assignment (pending, assigned, en_route, active, completed, cancelled)';
COMMENT ON COLUMN protection_assignments.threat_level IS 'Assessed threat level for the assignment (low, medium, high, critical)';
COMMENT ON COLUMN payment_records.payment_status IS 'Current status of the payment (pending, processing, completed, failed)';
COMMENT ON COLUMN incident_reports.severity IS 'Severity level of the incident (low, medium, high, critical)';
