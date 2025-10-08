-- ============================================================================
-- ArmoraCPO - Test Data Seed Script
-- ============================================================================
-- Purpose: Populate database with comprehensive test data for QA and E2E testing
-- Version: 1.0.0
-- Last Updated: 2025-10-08
--
-- USAGE:
--   1. Run this script against your test/staging Supabase database
--   2. DO NOT run against production database
--   3. Script is idempotent - can be run multiple times safely
--
-- CONTENTS:
--   - Test user accounts (CPO and Admin)
--   - Test protection assignments (various states)
--   - Test messages
--   - Test incident reports
--   - Test DOB entries
--   - Test location history
-- ============================================================================

-- ============================================================================
-- CLEAN UP EXISTING TEST DATA (Optional - uncomment to reset)
-- ============================================================================

-- DELETE FROM officer_location_history WHERE cpo_id IN (
--   SELECT id FROM protection_officers WHERE email LIKE '%@armoracpo.test'
-- );
-- DELETE FROM dob_entries WHERE cpo_id IN (
--   SELECT id FROM protection_officers WHERE email LIKE '%@armoracpo.test'
-- );
-- DELETE FROM incident_media WHERE incident_report_id IN (
--   SELECT id FROM incident_reports WHERE cpo_id IN (
--     SELECT id FROM protection_officers WHERE email LIKE '%@armoracpo.test'
--   )
-- );
-- DELETE FROM incident_reports WHERE cpo_id IN (
--   SELECT id FROM protection_officers WHERE email LIKE '%@armoracpo.test'
-- );
-- DELETE FROM assignment_messages WHERE assignment_id IN (
--   SELECT id FROM protection_assignments WHERE cpo_id IN (
--     SELECT id FROM protection_officers WHERE email LIKE '%@armoracpo.test'
--   )
-- );
-- DELETE FROM payment_records WHERE cpo_id IN (
--   SELECT id FROM protection_officers WHERE email LIKE '%@armoracpo.test'
-- );
-- DELETE FROM protection_assignments WHERE cpo_id IN (
--   SELECT id FROM protection_officers WHERE email LIKE '%@armoracpo.test'
-- );
-- DELETE FROM protection_officers WHERE email LIKE '%@armoracpo.test';

-- ============================================================================
-- TEST CPO ACCOUNTS
-- ============================================================================
-- Note: Passwords are hashed by Supabase Auth. Use raw passwords in tests.
-- For Supabase Auth, create users via Dashboard or Auth API, then link here.

-- Test CPO 1 - Verified, Active
INSERT INTO protection_officers (
  id,
  user_id,
  sia_license_number,
  sia_license_type,
  sia_license_expiry,
  first_name,
  last_name,
  phone,
  email,
  date_of_birth,
  address_line1,
  address_line2,
  city,
  postcode,
  country,
  emergency_contact_name,
  emergency_contact_phone,
  vehicle_make,
  vehicle_model,
  vehicle_color,
  vehicle_registration,
  bank_account_name,
  bank_sort_code,
  bank_account_number,
  national_insurance_number,
  right_to_work_status,
  is_available,
  current_latitude,
  current_longitude,
  rating,
  total_assignments,
  verification_status,
  created_at,
  updated_at
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  'auth_user_id_1', -- Replace with actual Supabase Auth user ID
  'SIA123456789',
  'Front Line SIA License',
  '2026-12-31',
  'John',
  'Smith',
  '+447700900001',
  'john.smith@armoracpo.test',
  '1985-03-15',
  '123 Security Street',
  'Apartment 4B',
  'London',
  'SW1A 1AA',
  'United Kingdom',
  'Jane Smith',
  '+447700900002',
  'BMW',
  '5 Series',
  'Black',
  'AB12 CDE',
  'John Smith',
  '12-34-56',
  '12345678',
  'AB123456C',
  'verified',
  true,
  51.5074,
  -0.1278,
  4.8,
  45,
  'verified',
  NOW() - INTERVAL '6 months',
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  updated_at = NOW(),
  is_available = true,
  verification_status = 'verified';

-- Test CPO 2 - Verified, Active (Different location)
INSERT INTO protection_officers (
  id,
  user_id,
  sia_license_number,
  sia_license_type,
  sia_license_expiry,
  first_name,
  last_name,
  phone,
  email,
  date_of_birth,
  address_line1,
  city,
  postcode,
  country,
  emergency_contact_name,
  emergency_contact_phone,
  vehicle_make,
  vehicle_model,
  vehicle_color,
  vehicle_registration,
  right_to_work_status,
  is_available,
  current_latitude,
  current_longitude,
  rating,
  total_assignments,
  verification_status,
  created_at,
  updated_at
) VALUES (
  '22222222-2222-2222-2222-222222222222',
  'auth_user_id_2',
  'SIA987654321',
  'Front Line SIA License',
  '2027-06-30',
  'Sarah',
  'Johnson',
  '+447700900003',
  'sarah.johnson@armoracpo.test',
  '1990-07-22',
  '456 Protection Avenue',
  'Manchester',
  'M1 1AA',
  'United Kingdom',
  'Michael Johnson',
  '+447700900004',
  'Mercedes-Benz',
  'E-Class',
  'Silver',
  'CD34 EFG',
  'verified',
  true,
  53.4808,
  -2.2426,
  4.9,
  67,
  'verified',
  NOW() - INTERVAL '8 months',
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  updated_at = NOW(),
  is_available = true,
  verification_status = 'verified';

-- Test CPO 3 - Pending Verification
INSERT INTO protection_officers (
  id,
  user_id,
  sia_license_number,
  sia_license_type,
  sia_license_expiry,
  first_name,
  last_name,
  phone,
  email,
  date_of_birth,
  address_line1,
  city,
  postcode,
  country,
  emergency_contact_name,
  emergency_contact_phone,
  right_to_work_status,
  is_available,
  rating,
  total_assignments,
  verification_status,
  created_at,
  updated_at
) VALUES (
  '33333333-3333-3333-3333-333333333333',
  'auth_user_id_3',
  'SIA555666777',
  'Front Line SIA License',
  '2026-09-15',
  'David',
  'Williams',
  '+447700900005',
  'david.williams@armoracpo.test',
  '1988-11-10',
  '789 Guard Lane',
  'Birmingham',
  'B1 1AA',
  'United Kingdom',
  'Emma Williams',
  '+447700900006',
  'pending_verification',
  false,
  0,
  0,
  'pending',
  NOW() - INTERVAL '3 days',
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  updated_at = NOW(),
  verification_status = 'pending';

-- Test CPO 4 - Rejected/Suspended
INSERT INTO protection_officers (
  id,
  user_id,
  sia_license_number,
  sia_license_type,
  sia_license_expiry,
  first_name,
  last_name,
  phone,
  email,
  date_of_birth,
  address_line1,
  city,
  postcode,
  country,
  emergency_contact_name,
  emergency_contact_phone,
  right_to_work_status,
  is_available,
  rating,
  total_assignments,
  verification_status,
  created_at,
  updated_at
) VALUES (
  '44444444-4444-4444-4444-444444444444',
  'auth_user_id_4',
  'SIA111222333',
  'Front Line SIA License',
  '2025-03-31',
  'Michael',
  'Brown',
  '+447700900007',
  'michael.brown@armoracpo.test',
  '1982-05-18',
  '321 Patrol Road',
  'Leeds',
  'LS1 1AA',
  'United Kingdom',
  'Lisa Brown',
  '+447700900008',
  'rejected',
  false,
  3.2,
  12,
  'rejected',
  NOW() - INTERVAL '4 months',
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  updated_at = NOW(),
  verification_status = 'rejected';

-- ============================================================================
-- TEST PRINCIPAL ACCOUNTS (Clients)
-- ============================================================================

INSERT INTO principals (
  id,
  user_id,
  email,
  full_name,
  phone,
  discount_percentage,
  questionnaire_completed,
  questionnaire_data,
  preferred_protection_level,
  emergency_contacts,
  created_at,
  updated_at
) VALUES (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'auth_principal_1',
  'robert.davies@client.test',
  'Robert Davies',
  '+447700900101',
  0,
  true,
  '{"riskLevel": "medium", "travelFrequency": "weekly"}',
  'executive_protection',
  '[{"name": "Emily Davies", "phone": "+447700900102", "relationship": "spouse"}]',
  NOW() - INTERVAL '3 months',
  NOW()
) ON CONFLICT (id) DO UPDATE SET updated_at = NOW();

INSERT INTO principals (
  id,
  user_id,
  email,
  full_name,
  phone,
  discount_percentage,
  questionnaire_completed,
  questionnaire_data,
  preferred_protection_level,
  created_at,
  updated_at
) VALUES (
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'auth_principal_2',
  'amanda.taylor@client.test',
  'Amanda Taylor',
  '+447700900103',
  10,
  true,
  '{"riskLevel": "high", "travelFrequency": "daily"}',
  'close_protection',
  NOW() - INTERVAL '5 months',
  NOW()
) ON CONFLICT (id) DO UPDATE SET updated_at = NOW();

-- ============================================================================
-- TEST PROTECTION ASSIGNMENTS
-- ============================================================================

-- Assignment 1: Pending (Available for CPOs to accept)
INSERT INTO protection_assignments (
  id,
  principal_id,
  cpo_id,
  pickup_location,
  pickup_latitude,
  pickup_longitude,
  dropoff_location,
  dropoff_latitude,
  dropoff_longitude,
  scheduled_start_time,
  scheduled_end_time,
  assignment_type,
  threat_level,
  special_instructions,
  required_certifications,
  status,
  base_rate,
  estimated_duration_hours,
  total_cost,
  principal_name,
  principal_phone,
  vehicle_required,
  armed_protection_required,
  number_of_cpos_required,
  job_title,
  created_at,
  updated_at
) VALUES (
  'a1111111-1111-1111-1111-111111111111',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  NULL,
  'Heathrow Airport, Terminal 5, London',
  51.4700,
  -0.4543,
  'The Dorchester Hotel, Park Lane, London',
  51.5074,
  -0.1480,
  NOW() + INTERVAL '3 days',
  NOW() + INTERVAL '3 days' + INTERVAL '4 hours',
  'executive_protection',
  'medium',
  'VIP client arriving from international flight. Discrete protection required. Client prefers minimal visibility.',
  ARRAY['Close Protection', 'Defensive Driving'],
  'pending',
  50.00,
  4,
  200.00,
  'Robert Davies',
  '+447700900101',
  true,
  false,
  1,
  'Airport Transfer - VIP Protection',
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '2 days'
) ON CONFLICT (id) DO UPDATE SET updated_at = NOW();

-- Assignment 2: Assigned (Accepted by CPO 1)
INSERT INTO protection_assignments (
  id,
  principal_id,
  cpo_id,
  pickup_location,
  pickup_latitude,
  pickup_longitude,
  dropoff_location,
  dropoff_latitude,
  dropoff_longitude,
  scheduled_start_time,
  scheduled_end_time,
  assignment_type,
  threat_level,
  special_instructions,
  status,
  base_rate,
  estimated_duration_hours,
  total_cost,
  principal_name,
  principal_phone,
  vehicle_required,
  armed_protection_required,
  number_of_cpos_required,
  job_title,
  created_at,
  updated_at
) VALUES (
  'a2222222-2222-2222-2222-222222222222',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '11111111-1111-1111-1111-111111111111',
  'Ritz Hotel, Piccadilly, London',
  51.5074,
  -0.1419,
  'British Museum, Great Russell St, London',
  51.5194,
  -0.1270,
  NOW() + INTERVAL '1 day',
  NOW() + INTERVAL '1 day' + INTERVAL '3 hours',
  'close_protection',
  'low',
  'Principal attending museum exhibition. Low-profile protection.',
  'assigned',
  45.00,
  3,
  135.00,
  'Robert Davies',
  '+447700900101',
  true,
  false,
  1,
  'Museum Visit - Close Protection',
  NOW() - INTERVAL '12 hours',
  NOW() - INTERVAL '6 hours'
) ON CONFLICT (id) DO UPDATE SET updated_at = NOW();

-- Assignment 3: En Route (CPO 2 on the way)
INSERT INTO protection_assignments (
  id,
  principal_id,
  cpo_id,
  pickup_location,
  pickup_latitude,
  pickup_longitude,
  dropoff_location,
  dropoff_latitude,
  dropoff_longitude,
  scheduled_start_time,
  scheduled_end_time,
  actual_start_time,
  assignment_type,
  threat_level,
  special_instructions,
  status,
  base_rate,
  estimated_duration_hours,
  total_cost,
  principal_name,
  principal_phone,
  vehicle_required,
  armed_protection_required,
  number_of_cpos_required,
  job_title,
  created_at,
  updated_at
) VALUES (
  'a3333333-3333-3333-3333-333333333333',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  '22222222-2222-2222-2222-222222222222',
  'Manchester Piccadilly Station',
  53.4773,
  -2.2309,
  'Manchester Central Convention Complex',
  53.4767,
  -2.2460,
  NOW() - INTERVAL '30 minutes',
  NOW() + INTERVAL '2 hours',
  NOW() - INTERVAL '15 minutes',
  'event_security',
  'medium',
  'Principal attending business conference. Crowd control may be needed.',
  'en_route',
  55.00,
  2.5,
  137.50,
  'Amanda Taylor',
  '+447700900103',
  true,
  false,
  1,
  'Conference Security',
  NOW() - INTERVAL '4 hours',
  NOW() - INTERVAL '15 minutes'
) ON CONFLICT (id) DO UPDATE SET updated_at = NOW();

-- Assignment 4: Active (CPO 1 currently on assignment)
INSERT INTO protection_assignments (
  id,
  principal_id,
  cpo_id,
  pickup_location,
  pickup_latitude,
  pickup_longitude,
  dropoff_location,
  dropoff_latitude,
  dropoff_longitude,
  scheduled_start_time,
  scheduled_end_time,
  actual_start_time,
  assignment_type,
  threat_level,
  special_instructions,
  status,
  base_rate,
  estimated_duration_hours,
  principal_name,
  principal_phone,
  vehicle_required,
  armed_protection_required,
  number_of_cpos_required,
  job_title,
  created_at,
  updated_at
) VALUES (
  'a4444444-4444-4444-4444-444444444444',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '11111111-1111-1111-1111-111111111111',
  'Claridge''s Hotel, Brook St, London',
  51.5129,
  -0.1477,
  'TBD - Multi-stop itinerary',
  51.5074,
  -0.1278,
  NOW() - INTERVAL '1 hour',
  NOW() + INTERVAL '5 hours',
  NOW() - INTERVAL '45 minutes',
  'executive_protection',
  'high',
  'High-profile CEO. Potential media presence. Maintain strict perimeter.',
  'active',
  75.00,
  6,
  'Robert Davies',
  '+447700900101',
  true,
  false,
  1,
  'Executive Day Protection',
  NOW() - INTERVAL '6 hours',
  NOW() - INTERVAL '45 minutes'
) ON CONFLICT (id) DO UPDATE SET updated_at = NOW();

-- Assignment 5: Completed (CPO 2, yesterday)
INSERT INTO protection_assignments (
  id,
  principal_id,
  cpo_id,
  pickup_location,
  pickup_latitude,
  pickup_longitude,
  dropoff_location,
  dropoff_latitude,
  dropoff_longitude,
  scheduled_start_time,
  scheduled_end_time,
  actual_start_time,
  actual_end_time,
  assignment_type,
  threat_level,
  special_instructions,
  status,
  base_rate,
  estimated_duration_hours,
  total_cost,
  principal_name,
  principal_phone,
  vehicle_required,
  armed_protection_required,
  number_of_cpos_required,
  job_title,
  created_at,
  updated_at
) VALUES (
  'a5555555-5555-5555-5555-555555555555',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  '22222222-2222-2222-2222-222222222222',
  'Manchester Airport, Terminal 1',
  53.3656,
  -2.2790,
  'Lowry Hotel, Chapel Wharf, Manchester',
  53.4867,
  -2.2521,
  NOW() - INTERVAL '1 day' - INTERVAL '3 hours',
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '1 day' - INTERVAL '3 hours',
  NOW() - INTERVAL '1 day' - INTERVAL '15 minutes',
  'transport_security',
  'low',
  'Standard airport pickup. No special requirements.',
  'completed',
  40.00,
  2,
  80.00,
  'Amanda Taylor',
  '+447700900103',
  true,
  false,
  1,
  'Airport Pickup',
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '1 day' - INTERVAL '15 minutes'
) ON CONFLICT (id) DO UPDATE SET updated_at = NOW();

-- Assignment 6: Cancelled
INSERT INTO protection_assignments (
  id,
  principal_id,
  cpo_id,
  pickup_location,
  pickup_latitude,
  pickup_longitude,
  scheduled_start_time,
  scheduled_end_time,
  assignment_type,
  threat_level,
  status,
  base_rate,
  estimated_duration_hours,
  principal_name,
  principal_phone,
  vehicle_required,
  armed_protection_required,
  number_of_cpos_required,
  job_title,
  created_at,
  updated_at
) VALUES (
  'a6666666-6666-6666-6666-666666666666',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '11111111-1111-1111-1111-111111111111',
  '10 Downing Street, London',
  51.5034,
  -0.1276,
  NOW() + INTERVAL '2 weeks',
  NOW() + INTERVAL '2 weeks' + INTERVAL '4 hours',
  'residential_security',
  'medium',
  'cancelled',
  60.00,
  4,
  'Robert Davies',
  '+447700900101',
  false,
  false,
  2,
  'Residential Security Detail',
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '1 day'
) ON CONFLICT (id) DO UPDATE SET updated_at = NOW();

-- Assignment 7: High Threat - Pending
INSERT INTO protection_assignments (
  id,
  principal_id,
  cpo_id,
  pickup_location,
  pickup_latitude,
  pickup_longitude,
  dropoff_location,
  dropoff_latitude,
  dropoff_longitude,
  scheduled_start_time,
  scheduled_end_time,
  assignment_type,
  threat_level,
  special_instructions,
  required_certifications,
  status,
  base_rate,
  estimated_duration_hours,
  total_cost,
  principal_name,
  principal_phone,
  vehicle_required,
  armed_protection_required,
  number_of_cpos_required,
  job_title,
  created_at,
  updated_at
) VALUES (
  'a7777777-7777-7777-7777-777777777777',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  NULL,
  'Private Residence, Kensington, London',
  51.4991,
  -0.1938,
  'House of Commons, Westminster, London',
  51.4995,
  -0.1248,
  NOW() + INTERVAL '5 days',
  NOW() + INTERVAL '5 days' + INTERVAL '8 hours',
  'executive_protection',
  'critical',
  'CRITICAL: High-profile political figure. Known threats. Armed protection required. Full background check mandatory. Discrete route planning essential.',
  ARRAY['Close Protection', 'Counter-Terrorism', 'Advanced Driving', 'First Aid'],
  'pending',
  100.00,
  8,
  800.00,
  'Amanda Taylor',
  '+447700900103',
  true,
  true,
  2,
  'Political Figure Protection - High Risk',
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '1 day'
) ON CONFLICT (id) DO UPDATE SET updated_at = NOW();

-- ============================================================================
-- TEST MESSAGES
-- ============================================================================

-- Messages for Assignment 2 (Assigned)
INSERT INTO assignment_messages (
  id,
  assignment_id,
  sender_id,
  sender_type,
  message,
  read_at,
  created_at
) VALUES
  (
    'm1111111-1111-1111-1111-111111111111',
    'a2222222-2222-2222-2222-222222222222',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'principal',
    'Hello, looking forward to tomorrow''s assignment. I''ll be ready at the hotel lobby by 10 AM.',
    NOW() - INTERVAL '3 hours',
    NOW() - INTERVAL '5 hours'
  ),
  (
    'm2222222-2222-2222-2222-222222222222',
    'a2222222-2222-2222-2222-222222222222',
    '11111111-1111-1111-1111-111111111111',
    'cpo',
    'Good morning Mr. Davies. Confirmed, I will arrive at 9:55 AM sharp. I''ll be in a black BMW 5 Series, registration AB12 CDE.',
    NOW() - INTERVAL '2 hours',
    NOW() - INTERVAL '3 hours'
  ),
  (
    'm3333333-3333-3333-3333-333333333333',
    'a2222222-2222-2222-2222-222222222222',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'principal',
    'Perfect. Should I exit through the main entrance or side entrance?',
    NULL,
    NOW() - INTERVAL '2 hours'
  );

-- Messages for Assignment 3 (En Route)
INSERT INTO assignment_messages (
  id,
  assignment_id,
  sender_id,
  sender_type,
  message,
  read_at,
  created_at
) VALUES
  (
    'm4444444-4444-4444-4444-444444444444',
    'a3333333-3333-3333-3333-333333333333',
    '22222222-2222-2222-2222-222222222222',
    'cpo',
    'En route to pickup location. ETA 10 minutes.',
    NOW() - INTERVAL '5 minutes',
    NOW() - INTERVAL '10 minutes'
  ),
  (
    'm5555555-5555-5555-5555-555555555555',
    'a3333333-3333-3333-3333-333333333333',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'principal',
    'Thank you. I''ll be waiting at the main entrance.',
    NOW() - INTERVAL '3 minutes',
    NOW() - INTERVAL '5 minutes'
  );

-- Messages for Assignment 4 (Active)
INSERT INTO assignment_messages (
  id,
  assignment_id,
  sender_id,
  sender_type,
  message,
  read_at,
  created_at
) VALUES
  (
    'm6666666-6666-6666-6666-666666666666',
    'a4444444-4444-4444-4444-444444444444',
    '11111111-1111-1111-1111-111111111111',
    'cpo',
    'Principal secured. Currently in transit to first meeting location.',
    NOW() - INTERVAL '20 minutes',
    NOW() - INTERVAL '30 minutes'
  ),
  (
    'm7777777-7777-7777-7777-777777777777',
    'a4444444-4444-4444-4444-444444444444',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'principal',
    'Please add a stop at Starbucks on Regent Street before the next meeting.',
    NULL,
    NOW() - INTERVAL '5 minutes'
  );

-- ============================================================================
-- TEST INCIDENT REPORTS
-- ============================================================================

-- Incident 1: Low Severity - Completed
INSERT INTO incident_reports (
  id,
  assignment_id,
  cpo_id,
  incident_number,
  incident_type,
  severity,
  title,
  description,
  incident_datetime,
  location,
  latitude,
  longitude,
  witnesses,
  actions_taken,
  outcome,
  cpo_signature_url,
  principal_signature_url,
  status,
  reported_by,
  created_at,
  updated_at
) VALUES (
  'i1111111-1111-1111-1111-111111111111',
  'a5555555-5555-5555-5555-555555555555',
  '22222222-2222-2222-2222-222222222222',
  'IR-20251007-0001',
  'protocol_breach',
  'low',
  'Minor Protocol Deviation',
  'Principal briefly separated from protective detail while taking a phone call in terminal. Situation was immediately rectified. Principal remained in public view at all times. No threat materialized. Advised principal on maintaining proximity during future assignments.',
  NOW() - INTERVAL '1 day' - INTERVAL '2 hours',
  'Manchester Airport, Terminal 1, Arrivals Hall',
  53.3656,
  -2.2790,
  ARRAY['Terminal security officer witnessed the incident'],
  'Immediately re-established proximity. Briefed principal on security protocols. Adjusted positioning to prevent recurrence.',
  'Situation resolved. No harm or threat. Principal cooperative and understanding.',
  'https://storage.supabase.co/signatures/cpo_signature_1.png',
  'https://storage.supabase.co/signatures/principal_signature_1.png',
  'submitted',
  'Sarah Johnson',
  NOW() - INTERVAL '1 day' - INTERVAL '1 hour',
  NOW() - INTERVAL '1 day' - INTERVAL '1 hour'
) ON CONFLICT (id) DO UPDATE SET updated_at = NOW();

-- Incident 2: Medium Severity - Submitted
INSERT INTO incident_reports (
  id,
  assignment_id,
  cpo_id,
  incident_number,
  incident_type,
  severity,
  title,
  description,
  incident_datetime,
  location,
  latitude,
  longitude,
  witnesses,
  actions_taken,
  outcome,
  cpo_signature_url,
  status,
  reported_by,
  created_at,
  updated_at
) VALUES (
  'i2222222-2222-2222-2222-222222222222',
  'a4444444-4444-4444-4444-444444444444',
  '11111111-1111-1111-1111-111111111111',
  'IR-20251008-0001',
  'threat',
  'medium',
  'Verbal Confrontation by Unauthorized Individual',
  'At approximately 14:35, an unidentified male (approx. 30-35 years, 6ft, dark clothing) approached the principal near the vehicle. Subject shouted aggressive questions regarding principal''s business activities. I immediately positioned myself between subject and principal, escorted principal to vehicle. Subject attempted to follow but was blocked. Hotel security arrived within 60 seconds. Subject dispersed when security approached. No physical contact occurred. Incident captured on vehicle dash camera. Police not contacted as principal declined to file report. Increased vigilance maintained for remainder of assignment.',
  NOW() - INTERVAL '2 hours',
  'Brook Street, outside Claridge''s Hotel, London',
  51.5129,
  -0.1477,
  ARRAY['Hotel doorman', 'Hotel security officer', 'Valet parking attendant'],
  'Created physical barrier between subject and principal. Escorted principal to secure vehicle. Coordinated with hotel security. Documented subject description. Captured incident on dash camera. Conducted area sweep before departure.',
  'Principal secured without harm. Subject dispersed. No further contact. Enhanced security protocols for remainder of assignment.',
  'https://storage.supabase.co/signatures/cpo_signature_2.png',
  'submitted',
  'John Smith',
  NOW() - INTERVAL '1 hour',
  NOW() - INTERVAL '1 hour'
) ON CONFLICT (id) DO UPDATE SET updated_at = NOW();

-- Incident 3: High Severity - Draft (for testing editable incidents)
INSERT INTO incident_reports (
  id,
  assignment_id,
  cpo_id,
  incident_number,
  incident_type,
  severity,
  title,
  description,
  incident_datetime,
  location,
  latitude,
  longitude,
  status,
  reported_by,
  created_at,
  updated_at
) VALUES (
  'i3333333-3333-3333-3333-333333333333',
  'a4444444-4444-4444-4444-444444444444',
  '11111111-1111-1111-1111-111111111111',
  'IR-20251008-0002',
  'medical',
  'high',
  'Principal Medical Emergency - Allergic Reaction',
  'DRAFT - Need to complete witness statements and obtain principal signature.',
  NOW() - INTERVAL '30 minutes',
  'Regent Street, London',
  51.5099,
  -0.1337,
  'draft',
  'John Smith',
  NOW() - INTERVAL '20 minutes',
  NOW() - INTERVAL '10 minutes'
) ON CONFLICT (id) DO UPDATE SET updated_at = NOW();

-- ============================================================================
-- TEST INCIDENT MEDIA FILES
-- ============================================================================

INSERT INTO incident_media (
  id,
  incident_report_id,
  file_url,
  file_type,
  file_size,
  gps_latitude,
  gps_longitude,
  timestamp,
  sha256_hash,
  uploaded_by,
  created_at
) VALUES
  (
    'im111111-1111-1111-1111-111111111111',
    'i2222222-2222-2222-2222-222222222222',
    'https://storage.supabase.co/incident-media/2025/10/08/incident_photo_1.jpg',
    'image/jpeg',
    2457600,
    51.5129,
    -0.1477,
    NOW() - INTERVAL '2 hours',
    'a3c4f5e6d7b8a9c0f1e2d3b4a5c6f7e8d9c0b1a2f3e4d5c6b7a8f9e0d1c2b3a4',
    '11111111-1111-1111-1111-111111111111',
    NOW() - INTERVAL '2 hours'
  ),
  (
    'im222222-2222-2222-2222-222222222222',
    'i2222222-2222-2222-2222-222222222222',
    'https://storage.supabase.co/incident-media/2025/10/08/dashcam_video_1.mp4',
    'video/mp4',
    15728640,
    51.5129,
    -0.1477,
    NOW() - INTERVAL '2 hours',
    'b4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5',
    '11111111-1111-1111-1111-111111111111',
    NOW() - INTERVAL '2 hours'
  );

-- ============================================================================
-- TEST DOB ENTRIES (Daily Occurrence Book)
-- ============================================================================

-- Auto-logged DOB entries for Assignment 4 (Active)
INSERT INTO dob_entries (
  id,
  assignment_id,
  cpo_id,
  entry_type,
  description,
  location,
  latitude,
  longitude,
  timestamp,
  is_auto_logged,
  is_submitted,
  created_at
) VALUES
  (
    'd1111111-1111-1111-1111-111111111111',
    'a4444444-4444-4444-4444-444444444444',
    '11111111-1111-1111-1111-111111111111',
    'assignment_start',
    'Assignment commenced. Principal secured at Claridge''s Hotel.',
    'Claridge''s Hotel, Brook St, London',
    51.5129,
    -0.1477,
    NOW() - INTERVAL '45 minutes',
    true,
    true,
    NOW() - INTERVAL '45 minutes'
  ),
  (
    'd2222222-2222-2222-2222-222222222222',
    'a4444444-4444-4444-4444-444444444444',
    '11111111-1111-1111-1111-111111111111',
    'location_change',
    'Departed Claridge''s Hotel. En route to first meeting location.',
    'Brook Street, London',
    51.5125,
    -0.1465,
    NOW() - INTERVAL '35 minutes',
    true,
    true,
    NOW() - INTERVAL '35 minutes'
  ),
  (
    'd3333333-3333-3333-3333-333333333333',
    'a4444444-4444-4444-4444-444444444444',
    '11111111-1111-1111-1111-111111111111',
    'observation',
    'Increased pedestrian activity on Regent Street. Maintained close proximity to principal. No threats identified.',
    'Regent Street, London',
    51.5099,
    -0.1337,
    NOW() - INTERVAL '15 minutes',
    false,
    true,
    NOW() - INTERVAL '15 minutes'
  );

-- DOB entries for completed Assignment 5
INSERT INTO dob_entries (
  id,
  assignment_id,
  cpo_id,
  entry_type,
  description,
  location,
  latitude,
  longitude,
  timestamp,
  is_auto_logged,
  is_submitted,
  created_at
) VALUES
  (
    'd4444444-4444-4444-4444-444444444444',
    'a5555555-5555-5555-5555-555555555555',
    '22222222-2222-2222-2222-222222222222',
    'assignment_start',
    'Journey commenced from Manchester Airport.',
    'Manchester Airport, Terminal 1',
    53.3656,
    -2.2790,
    NOW() - INTERVAL '1 day' - INTERVAL '3 hours',
    true,
    true,
    NOW() - INTERVAL '1 day' - INTERVAL '3 hours'
  ),
  (
    'd5555555-5555-5555-5555-555555555555',
    'a5555555-5555-5555-5555-555555555555',
    '22222222-2222-2222-2222-222222222222',
    'observation',
    'Routine airport pickup. No delays or incidents. Principal collected luggage without issue.',
    'Manchester Airport, Terminal 1, Arrivals',
    53.3656,
    -2.2790,
    NOW() - INTERVAL '1 day' - INTERVAL '2 hours' - INTERVAL '45 minutes',
    false,
    true,
    NOW() - INTERVAL '1 day' - INTERVAL '2 hours' - INTERVAL '45 minutes'
  ),
  (
    'd6666666-6666-6666-6666-666666666666',
    'a5555555-5555-5555-5555-555555555555',
    '22222222-2222-2222-2222-222222222222',
    'assignment_end',
    'Assignment completed. Principal safely delivered to Lowry Hotel.',
    'Lowry Hotel, Chapel Wharf, Manchester',
    53.4867,
    -2.2521,
    NOW() - INTERVAL '1 day' - INTERVAL '15 minutes',
    true,
    true,
    NOW() - INTERVAL '1 day' - INTERVAL '15 minutes'
  );

-- ============================================================================
-- TEST LOCATION HISTORY (GPS Tracking)
-- ============================================================================

-- Location history for Assignment 3 (En Route)
INSERT INTO officer_location_history (
  id,
  cpo_id,
  assignment_id,
  latitude,
  longitude,
  accuracy,
  speed,
  heading,
  timestamp,
  created_at
) VALUES
  (
    'l1111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    'a3333333-3333-3333-3333-333333333333',
    53.4773,
    -2.2309,
    15.0,
    0.0,
    NULL,
    NOW() - INTERVAL '15 minutes',
    NOW() - INTERVAL '15 minutes'
  ),
  (
    'l2222222-2222-2222-2222-222222222222',
    '22222222-2222-2222-2222-222222222222',
    'a3333333-3333-3333-3333-333333333333',
    53.4770,
    -2.2330,
    12.0,
    25.0,
    45,
    NOW() - INTERVAL '10 minutes',
    NOW() - INTERVAL '10 minutes'
  ),
  (
    'l3333333-3333-3333-3333-333333333333',
    '22222222-2222-2222-2222-222222222222',
    'a3333333-3333-3333-3333-333333333333',
    53.4768,
    -2.2380,
    10.0,
    30.0,
    90,
    NOW() - INTERVAL '5 minutes',
    NOW() - INTERVAL '5 minutes'
  ),
  (
    'l4444444-4444-4444-4444-444444444444',
    '22222222-2222-2222-2222-222222222222',
    'a3333333-3333-3333-3333-333333333333',
    53.4767,
    -2.2430,
    8.0,
    15.0,
    135,
    NOW() - INTERVAL '2 minutes',
    NOW() - INTERVAL '2 minutes'
  ),
  (
    'l5555555-5555-5555-5555-555555555555',
    '22222222-2222-2222-2222-222222222222',
    'a3333333-3333-3333-3333-333333333333',
    53.4767,
    -2.2460,
    5.0,
    0.0,
    NULL,
    NOW(),
    NOW()
  );

-- Location history for Assignment 4 (Active)
INSERT INTO officer_location_history (
  id,
  cpo_id,
  assignment_id,
  latitude,
  longitude,
  accuracy,
  speed,
  timestamp,
  created_at
) VALUES
  (
    'l6666666-6666-6666-6666-666666666666',
    '11111111-1111-1111-1111-111111111111',
    'a4444444-4444-4444-4444-444444444444',
    51.5129,
    -0.1477,
    10.0,
    0.0,
    NOW() - INTERVAL '45 minutes',
    NOW() - INTERVAL '45 minutes'
  ),
  (
    'l7777777-7777-7777-7777-777777777777',
    '11111111-1111-1111-1111-111111111111',
    'a4444444-4444-4444-4444-444444444444',
    51.5120,
    -0.1450,
    12.0,
    20.0,
    NOW() - INTERVAL '30 minutes',
    NOW() - INTERVAL '30 minutes'
  ),
  (
    'l8888888-8888-8888-8888-888888888888',
    '11111111-1111-1111-1111-111111111111',
    'a4444444-4444-4444-4444-444444444444',
    51.5099,
    -0.1337,
    8.0,
    0.0,
    NOW() - INTERVAL '15 minutes',
    NOW() - INTERVAL '15 minutes'
  );

-- ============================================================================
-- TEST PAYMENT RECORDS
-- ============================================================================

INSERT INTO payment_records (
  id,
  assignment_id,
  cpo_id,
  amount,
  currency,
  payment_method,
  payment_status,
  stripe_payment_intent_id,
  paid_at,
  created_at,
  updated_at
) VALUES
  (
    'p1111111-1111-1111-1111-111111111111',
    'a5555555-5555-5555-5555-555555555555',
    '22222222-2222-2222-2222-222222222222',
    80.00,
    'GBP',
    'stripe',
    'completed',
    'pi_test_1234567890abcdef',
    NOW() - INTERVAL '12 hours',
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '12 hours'
  ),
  (
    'p2222222-2222-2222-2222-222222222222',
    'a4444444-4444-4444-4444-444444444444',
    '11111111-1111-1111-1111-111111111111',
    375.00,
    'GBP',
    'bank_transfer',
    'pending',
    NULL,
    NULL,
    NOW() - INTERVAL '1 hour',
    NOW() - INTERVAL '1 hour'
  );

-- ============================================================================
-- TEST EMERGENCY ACTIVATIONS (if table exists)
-- ============================================================================

-- Uncomment if emergency_activations table exists
-- INSERT INTO emergency_activations (
--   id,
--   cpo_id,
--   assignment_id,
--   activation_type,
--   latitude,
--   longitude,
--   status,
--   response_time,
--   created_at,
--   resolved_at
-- ) VALUES (
--   'e1111111-1111-1111-1111-111111111111',
--   '11111111-1111-1111-1111-111111111111',
--   'a4444444-4444-4444-4444-444444444444',
--   'panic_button',
--   51.5099,
--   -0.1337,
--   'resolved',
--   '00:02:15',
--   NOW() - INTERVAL '3 hours',
--   NOW() - INTERVAL '2 hours' - INTERVAL '45 minutes'
-- );

-- ============================================================================
-- VERIFICATION QUERIES (Run after seeding to verify data)
-- ============================================================================

-- Check CPO accounts
-- SELECT id, first_name, last_name, email, verification_status, total_assignments, rating
-- FROM protection_officers
-- WHERE email LIKE '%@armoracpo.test'
-- ORDER BY created_at;

-- Check assignments
-- SELECT id, job_title, status, assignment_type, threat_level, scheduled_start_time, principal_name
-- FROM protection_assignments
-- WHERE principal_id IN (SELECT id FROM principals WHERE email LIKE '%@client.test')
-- ORDER BY scheduled_start_time;

-- Check messages
-- SELECT am.message, am.sender_type, am.created_at, pa.job_title
-- FROM assignment_messages am
-- JOIN protection_assignments pa ON am.assignment_id = pa.id
-- ORDER BY am.created_at DESC
-- LIMIT 10;

-- Check incident reports
-- SELECT incident_number, title, severity, status, reported_by
-- FROM incident_reports
-- ORDER BY created_at DESC;

-- Check DOB entries
-- SELECT de.description, de.entry_type, de.is_auto_logged, pa.job_title
-- FROM dob_entries de
-- JOIN protection_assignments pa ON de.assignment_id = pa.id
-- ORDER BY de.timestamp DESC
-- LIMIT 10;

-- Check location history
-- SELECT olh.latitude, olh.longitude, olh.speed, olh.timestamp, pa.job_title
-- FROM officer_location_history olh
-- JOIN protection_assignments pa ON olh.assignment_id = pa.id
-- ORDER BY olh.timestamp DESC
-- LIMIT 10;

-- ============================================================================
-- NOTES FOR QA TEAM
-- ============================================================================

/*
TEST CREDENTIALS (use with Supabase Auth):

CPO Accounts:
1. john.smith@armoracpo.test / TestPassword123! (Verified, Active)
2. sarah.johnson@armoracpo.test / TestPassword123! (Verified, Active)
3. david.williams@armoracpo.test / TestPassword123! (Pending Verification)
4. michael.brown@armoracpo.test / TestPassword123! (Rejected/Suspended)

Principal Accounts:
1. robert.davies@client.test / ClientPassword123!
2. amanda.taylor@client.test / ClientPassword123!

ASSIGNMENT STATES FOR TESTING:
- a1111111... : Pending (available to accept)
- a2222222... : Assigned (accepted by John Smith)
- a3333333... : En Route (Sarah Johnson on the way)
- a4444444... : Active (John Smith currently on assignment)
- a5555555... : Completed (Sarah Johnson, yesterday)
- a6666666... : Cancelled
- a7777777... : High Threat Pending (requires special certifications)

TESTING SCENARIOS:
1. Login as CPO 1 (john.smith) → See assigned and active assignments
2. Login as CPO 2 (sarah.johnson) → See en_route assignment with real-time location
3. Login as CPO 3 (david.williams) → Cannot accept jobs (pending verification)
4. View messages in Assignment 2, 3, 4
5. Test incident reporting with existing incidents
6. View DOB entries for active/completed assignments
7. Test GPS tracking with location history data

DATA RELATIONSHIPS:
- Assignment 4 has: Messages, Incident Reports (1 submitted, 1 draft), DOB Entries, Location History
- Assignment 3 has: Messages, Location History (real-time tracking)
- Assignment 5 has: Completed status, DOB entries, Payment record

IMPORTANT:
- Update user_id fields with actual Supabase Auth user IDs after creating auth accounts
- Adjust timestamps as needed for realistic testing scenarios
- This is TEST DATA ONLY - never run against production database
*/

-- ============================================================================
-- END OF SEED SCRIPT
-- ============================================================================
