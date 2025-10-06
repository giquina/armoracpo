-- ============================================================================
-- SUPABASE SEED DATA FILE
-- ============================================================================
--
-- This file is used to populate the local development database with test data
-- when running `supabase db reset` or when initializing a fresh local instance.
--
-- Purpose: Local development and testing only
-- Usage: Automatically executed by Supabase CLI during database reset
--
-- Data Overview:
-- - 5 CPOs with varied profiles and specializations
-- - 8 Protection assignments (various statuses)
-- - 4 Payment records
-- - 2 Incident reports
-- - 5 Assignment messages
--
-- All test data uses consistent naming conventions:
-- - IDs: xxx-00000000-0000-0000-000X-XXXXXXXXXXXX format
-- - Emails: @armoracpo.test domain
-- - Phones: +4477009000XX test range
--
-- WARNING: This data is for LOCAL DEVELOPMENT ONLY.
-- Never run this seed file in production environments.
--
-- ============================================================================

-- ============================================================================
-- PROTECTION OFFICERS (CPOs)
-- ============================================================================
-- Creating 5 test CPOs with varied profiles, specializations, and availability
-- Covers different experience levels, certifications, and operational status

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
) VALUES
-- CPO 1: James Mitchell - Executive Protection Specialist
-- Experienced CPO with strong rating, currently available
(
  'cpo-00000000-0000-0000-0001-111111111111',
  'user-0000000-0000-0000-0001-111111111111',
  'SIA-19-123456',
  'Close Protection',
  '2026-06-15',
  'James',
  'Mitchell',
  '+447700900001',
  'james.mitchell@armoracpo.test',
  '1985-03-12',
  '45 Wellington House',
  'Kensington High Street',
  'London',
  'W8 5SA',
  'United Kingdom',
  'Sarah Mitchell',
  '+447700900101',
  'Mercedes-Benz',
  'E-Class',
  'Black',
  'LO21 CPO',
  'James Mitchell',
  '20-00-00',
  '12345678',
  'AB123456C',
  'verified',
  true,
  51.5074,
  -0.1278,
  4.8,
  127,
  'verified',
  '2023-01-15 10:00:00+00',
  '2025-10-03 08:30:00+00'
),

-- CPO 2: Amara Okafor - Event Security & VIP Protection
-- Top-rated CPO specializing in event security, currently available
(
  'cpo-00000000-0000-0000-0002-222222222222',
  'user-0000000-0000-0000-0002-222222222222',
  'SIA-20-234567',
  'Close Protection',
  '2025-12-20',
  'Amara',
  'Okafor',
  '+447700900002',
  'amara.okafor@armoracpo.test',
  '1990-07-22',
  'Flat 12, The Riverside',
  'Chelsea Embankment',
  'London',
  'SW3 4LG',
  'United Kingdom',
  'Chidi Okafor',
  '+447700900102',
  'BMW',
  '5 Series',
  'Silver',
  'LO23 VIP',
  'Amara Okafor',
  '40-47-84',
  '87654321',
  'CD234567E',
  'verified',
  true,
  51.4875,
  -0.1687,
  4.9,
  89,
  'verified',
  '2023-04-20 14:30:00+00',
  '2025-10-03 09:15:00+00'
),

-- CPO 3: David Thompson - Residential & Transport Security
-- Very experienced CPO, currently on assignment (unavailable)
(
  'cpo-00000000-0000-0000-0003-333333333333',
  'user-0000000-0000-0000-0003-333333333333',
  'SIA-18-345678',
  'Close Protection',
  '2026-09-30',
  'David',
  'Thompson',
  '+447700900003',
  'david.thompson@armoracpo.test',
  '1982-11-08',
  '78 Mayfair Gardens',
  '',
  'London',
  'W1K 2LP',
  'United Kingdom',
  'Emma Thompson',
  '+447700900103',
  'Range Rover',
  'Vogue',
  'Santorini Black',
  'LO19 SEC',
  'David Thompson',
  '60-16-23',
  '23456789',
  'EF345678G',
  'verified',
  false,
  51.5108,
  -0.1502,
  4.7,
  156,
  'verified',
  '2022-11-10 11:20:00+00',
  '2025-10-03 07:45:00+00'
),

-- CPO 4: Priya Sharma - Medical Emergency & Close Protection
-- Newer CPO with medical training, currently available
(
  'cpo-00000000-0000-0000-0004-444444444444',
  'user-0000000-0000-0000-0004-444444444444',
  'SIA-21-456789',
  'Close Protection',
  '2027-03-15',
  'Priya',
  'Sharma',
  '+447700900004',
  'priya.sharma@armoracpo.test',
  '1988-05-17',
  '23 Canary Wharf Plaza',
  'South Quay',
  'London',
  'E14 9SH',
  'United Kingdom',
  'Raj Sharma',
  '+447700900104',
  'Audi',
  'A6',
  'Glacier White',
  'LO22 MED',
  'Priya Sharma',
  '20-65-82',
  '34567890',
  'GH456789I',
  'verified',
  true,
  51.5045,
  -0.0199,
  4.9,
  45,
  'verified',
  '2024-02-01 09:00:00+00',
  '2025-10-03 08:00:00+00'
),

-- CPO 5: Marcus Johnson - Armed Protection & High-Risk Details
-- Most experienced CPO with firearms certification, currently available
(
  'cpo-00000000-0000-0000-0005-555555555555',
  'user-0000000-0000-0000-0005-555555555555',
  'SIA-17-567890',
  'Close Protection (Firearms)',
  '2026-01-22',
  'Marcus',
  'Johnson',
  '+447700900005',
  'marcus.johnson@armoracpo.test',
  '1980-09-25',
  '156 Belgravia Mews',
  'Eaton Square',
  'London',
  'SW1W 9DA',
  'United Kingdom',
  'Angela Johnson',
  '+447700900105',
  'Mercedes-Benz',
  'S-Class',
  'Obsidian Black',
  'LO18 ARM',
  'Marcus Johnson',
  '30-00-02',
  '45678901',
  'IJ567890K',
  'verified',
  true,
  51.4950,
  -0.1533,
  5.0,
  203,
  'verified',
  '2022-06-05 08:45:00+00',
  '2025-10-03 10:00:00+00'
);

-- ============================================================================
-- PROTECTION ASSIGNMENTS
-- ============================================================================
-- Creating test assignments with various statuses:
-- - PENDING: Awaiting CPO assignment
-- - ASSIGNED: CPO assigned, waiting for start
-- - ACTIVE: Currently in progress
-- - COMPLETED: Successfully finished
-- - CANCELLED: Cancelled by client
--
-- Covers different assignment types, threat levels, and durations

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
  created_at,
  updated_at
) VALUES

-- Assignment 1: PENDING - VIP Event Security at Royal Albert Hall
-- Unassigned event security for upcoming charity gala
(
  'asn-00000000-0000-0000-0001-111111111111',
  'principal-0000-0000-0000-0001-111111111111',
  NULL,
  'Royal Albert Hall, Kensington Gore',
  51.5009,
  -0.1773,
  'The Dorchester Hotel, Park Lane',
  51.5074,
  -0.1498,
  '2025-10-06 19:00:00+00',
  '2025-10-06 23:30:00+00',
  NULL,
  NULL,
  'event_security',
  'medium',
  'Principal attending charity gala. Discreet protection required. Black tie event.',
  ARRAY['First Aid', 'Event Security'],
  'pending',
  75.00,
  4.5,
  337.50,
  'Mr. Alexander Bennett',
  '+447700800001',
  true,
  false,
  1,
  '2025-10-01 14:30:00+00',
  '2025-10-01 14:30:00+00'
),

-- Assignment 2: ASSIGNED - Executive Protection Shopping Trip
-- Assigned to Amara Okafor, scheduled for tomorrow
(
  'asn-00000000-0000-0000-0002-222222222222',
  'principal-0000-0000-0000-0002-222222222222',
  'cpo-00000000-0000-0000-0002-222222222222',
  'Harrods, Brompton Road',
  51.4994,
  -0.1633,
  'One Hyde Park, Knightsbridge',
  51.5015,
  -0.1607,
  '2025-10-04 11:00:00+00',
  '2025-10-04 15:00:00+00',
  NULL,
  NULL,
  'executive_protection',
  'low',
  'Personal shopping appointment. Principal is high-profile businesswoman. Discretion essential.',
  ARRAY['Close Protection'],
  'assigned',
  80.00,
  4.0,
  320.00,
  'Ms. Victoria Ashford',
  '+447700800002',
  false,
  false,
  1,
  '2025-10-02 09:15:00+00',
  '2025-10-03 08:30:00+00'
),

-- Assignment 3: ACTIVE - Transport Security to Airport
-- Currently in progress with James Mitchell, high-threat assignment
(
  'asn-00000000-0000-0000-0003-333333333333',
  'principal-0000-0000-0000-0003-333333333333',
  'cpo-00000000-0000-0000-0001-111111111111',
  'Claridge''s Hotel, Brook Street',
  51.5127,
  -0.1475,
  'London Heathrow Airport, Terminal 5',
  51.4700,
  -0.4543,
  '2025-10-03 14:00:00+00',
  '2025-10-03 16:00:00+00',
  '2025-10-03 14:02:00+00',
  NULL,
  'transport_security',
  'high',
  'Principal is CEO of tech company. Recent credible threats received. Vehicle sweep completed. Route pre-planned.',
  ARRAY['Close Protection', 'Advanced Driving'],
  'active',
  120.00,
  2.0,
  240.00,
  'Mr. David Chen',
  '+447700800003',
  true,
  false,
  1,
  '2025-10-01 16:45:00+00',
  '2025-10-03 14:02:00+00'
),

-- Assignment 4: COMPLETED - Residential Security Overnight Detail
-- Successfully completed high-risk residential protection
(
  'asn-00000000-0000-0000-0004-444444444444',
  'principal-0000-0000-0000-0004-444444444444',
  'cpo-00000000-0000-0000-0005-555555555555',
  'Private Residence, Bishops Avenue',
  51.5678,
  -0.1656,
  NULL,
  NULL,
  NULL,
  '2025-09-30 22:00:00+00',
  '2025-10-01 08:00:00+00',
  '2025-09-30 21:55:00+00',
  '2025-10-01 08:10:00+00',
  'residential_security',
  'critical',
  'Overnight residential protection. Family received threats. Armed protection authorized. Perimeter patrols hourly.',
  ARRAY['Close Protection', 'Firearms', 'Residential Security'],
  'completed',
  150.00,
  10.0,
  1500.00,
  'Mr. Ibrahim Al-Mansouri',
  '+447700800004',
  false,
  true,
  1,
  '2025-09-28 11:30:00+00',
  '2025-10-01 08:15:00+00'
),

-- Assignment 5: COMPLETED - Close Protection Restaurant & Theatre
-- Completed VIP protection with minor incident (paparazzi)
(
  'asn-00000000-0000-0000-0005-555555555555',
  'principal-0000-0000-0000-0005-555555555555',
  'cpo-00000000-0000-0000-0002-222222222222',
  'The Savoy Hotel, Strand',
  51.5105,
  -0.1206,
  'Theatre Royal Drury Lane',
  51.5133,
  -0.1201,
  '2025-09-25 18:30:00+00',
  '2025-09-25 23:30:00+00',
  '2025-09-25 18:28:00+00',
  '2025-09-25 23:45:00+00',
  'close_protection',
  'medium',
  'Dinner at hotel restaurant followed by theatre show. Principal is celebrity client. Press attention likely.',
  ARRAY['Close Protection', 'Crowd Management'],
  'completed',
  85.00,
  5.0,
  425.00,
  'Ms. Sophia Rodriguez',
  '+447700800005',
  true,
  false,
  1,
  '2025-09-20 10:00:00+00',
  '2025-09-25 23:50:00+00'
),

-- Assignment 6: COMPLETED - Business Conference Day
-- Successfully completed full-day executive protection
(
  'asn-00000000-0000-0000-0006-666666666666',
  'principal-0000-0000-0000-0006-666666666666',
  'cpo-00000000-0000-0000-0003-333333333333',
  'Four Seasons Hotel, Park Lane',
  51.5064,
  -0.1515,
  'ExCeL London, Royal Victoria Dock',
  51.5081,
  0.0294,
  '2025-09-20 07:00:00+00',
  '2025-09-20 19:00:00+00',
  '2025-09-20 06:58:00+00',
  '2025-09-20 19:15:00+00',
  'executive_protection',
  'medium',
  'Full day conference protection. Multiple venue changes. Principal is government minister.',
  ARRAY['Close Protection', 'Counter-surveillance'],
  'completed',
  95.00,
  12.0,
  1140.00,
  'The Rt Hon. James Whitmore MP',
  '+447700800006',
  true,
  false,
  1,
  '2025-09-15 14:20:00+00',
  '2025-09-20 19:20:00+00'
),

-- Assignment 7: CANCELLED - Event Security (Client Cancellation)
-- Cancelled concert security assignment
(
  'asn-00000000-0000-0000-0007-777777777777',
  'principal-0000-0000-0000-0007-777777777777',
  'cpo-00000000-0000-0000-0004-444444444444',
  'O2 Arena, Peninsula Square',
  51.5033,
  0.0031,
  NULL,
  NULL,
  NULL,
  '2025-09-28 20:00:00+00',
  '2025-09-28 23:00:00+00',
  NULL,
  NULL,
  'event_security',
  'low',
  'Concert attendance. VIP box access. Principal changed plans.',
  ARRAY['Event Security'],
  'cancelled',
  70.00,
  3.0,
  0.00,
  'Mr. Thomas Wright',
  '+447700800007',
  false,
  false,
  1,
  '2025-09-22 16:00:00+00',
  '2025-09-27 11:30:00+00'
),

-- Assignment 8: PENDING - Multi-Day Residential Protection
-- Unassigned weekend estate protection requiring multiple CPOs
(
  'asn-00000000-0000-0000-0008-888888888888',
  'principal-0000-0000-0000-0008-888888888888',
  NULL,
  'Country Estate, Cotswolds',
  51.8330,
  -1.8433,
  NULL,
  NULL,
  NULL,
  '2025-10-10 18:00:00+00',
  '2025-10-13 10:00:00+00',
  NULL,
  NULL,
  'residential_security',
  'high',
  'Weekend estate protection. High-net-worth family hosting private gathering. 24/7 coverage required. Rotation with other CPOs.',
  ARRAY['Close Protection', 'Residential Security', 'First Aid'],
  'pending',
  120.00,
  64.0,
  7680.00,
  'Lord & Lady Pemberton',
  '+447700800008',
  false,
  false,
  2,
  '2025-09-29 13:15:00+00',
  '2025-09-29 13:15:00+00'
);

-- ============================================================================
-- PAYMENT RECORDS
-- ============================================================================
-- Creating payment records for completed and active assignments
-- Demonstrates different payment statuses and processing states

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

-- Payment 1: Completed - Residential Security (Marcus Johnson)
-- Successfully processed payment for overnight protection
(
  'pay-00000000-0000-0000-0001-111111111111',
  'asn-00000000-0000-0000-0004-444444444444',
  'cpo-00000000-0000-0000-0005-555555555555',
  1500.00,
  'GBP',
  'stripe',
  'completed',
  'pi_test_1MqPwL2eZvKYlo2C7X8Y9Z3A',
  '2025-10-01 10:30:00+00',
  '2025-10-01 08:20:00+00',
  '2025-10-01 10:30:00+00'
),

-- Payment 2: Completed - Restaurant & Theatre (Amara Okafor)
-- Successfully processed payment for VIP protection
(
  'pay-00000000-0000-0000-0002-222222222222',
  'asn-00000000-0000-0000-0005-555555555555',
  'cpo-00000000-0000-0000-0002-222222222222',
  425.00,
  'GBP',
  'stripe',
  'completed',
  'pi_test_2NrQxM3fAwLZmp3D8Y9Z4B4B',
  '2025-09-26 09:15:00+00',
  '2025-09-26 00:05:00+00',
  '2025-09-26 09:15:00+00'
),

-- Payment 3: Completed - Business Conference (David Thompson)
-- Successfully processed payment for full-day protection
(
  'pay-00000000-0000-0000-0003-333333333333',
  'asn-00000000-0000-0000-0006-666666666666',
  'cpo-00000000-0000-0000-0003-333333333333',
  1140.00,
  'GBP',
  'stripe',
  'completed',
  'pi_test_3OsRyN4gBxMAnq4E9Z0A5C5C',
  '2025-09-21 11:45:00+00',
  '2025-09-20 19:30:00+00',
  '2025-09-21 11:45:00+00'
),

-- Payment 4: Processing - Transport Security (James Mitchell)
-- Payment being processed for currently active assignment
(
  'pay-00000000-0000-0000-0004-444444444444',
  'asn-00000000-0000-0000-0003-333333333333',
  'cpo-00000000-0000-0000-0001-111111111111',
  240.00,
  'GBP',
  'stripe',
  'processing',
  'pi_test_4PtSzO5hCyNBoR5F0A1B6D6D',
  NULL,
  '2025-10-03 14:05:00+00',
  '2025-10-03 14:05:00+00'
);

-- ============================================================================
-- INCIDENT REPORTS
-- ============================================================================
-- Creating sample security incidents with varying severity levels
-- Demonstrates incident documentation and response procedures

INSERT INTO incident_reports (
  id,
  assignment_id,
  cpo_id,
  incident_type,
  severity,
  description,
  location,
  latitude,
  longitude,
  incident_time,
  witnesses,
  police_notified,
  police_reference,
  photos,
  created_at,
  updated_at
) VALUES

-- Incident 1: Medium Severity - Aggressive Paparazzi
-- Protocol breach incident with successful de-escalation
(
  'inc-00000000-0000-0000-0001-111111111111',
  'asn-00000000-0000-0000-0005-555555555555',
  'cpo-00000000-0000-0000-0002-222222222222',
  'protocol_breach',
  'medium',
  'Group of approximately 6-8 photographers gathered outside theatre entrance during principal''s arrival. Two individuals attempted to breach security cordon and approach principal directly. Physical intervention required to maintain protective bubble. No physical contact with principal. Situation de-escalated within 90 seconds. Alternative exit route used for departure. Theatre security cooperated fully.',
  'Theatre Royal Drury Lane, Catherine Street Entrance',
  51.5133,
  -0.1201,
  '2025-09-25 20:45:00+00',
  ARRAY['Theatre Security Manager - John Davies', 'Principal''s Assistant - Emma Richardson'],
  false,
  NULL,
  ARRAY['https://armora-test-storage.s3.eu-west-2.amazonaws.com/incident-photos/inc-001-photo-1.jpg'],
  '2025-09-25 21:15:00+00',
  '2025-09-25 21:15:00+00'
),

-- Incident 2: High Severity - Credible Threat During Transport
-- Active threat requiring police notification and evasive protocols
(
  'inc-00000000-0000-0000-0002-222222222222',
  'asn-00000000-0000-0000-0003-333333333333',
  'cpo-00000000-0000-0000-0001-111111111111',
  'threat',
  'high',
  'During transport to Heathrow, principal received threatening phone call with specific details about current journey including vehicle type and location. Call traced to unknown number. Immediately implemented evasive driving protocols and altered route. Notified Metropolitan Police Counter-Terrorism unit. Vehicle conducted anti-surveillance maneuvers. No physical tail detected. Principal safely delivered to airport with enhanced security handover to airline security team. Recommend threat assessment review before future assignments.',
  'A4 Great West Road, vicinity of Chiswick Roundabout',
  51.4897,
  -0.2687,
  '2025-10-03 14:35:00+00',
  ARRAY['Principal - Mr. David Chen'],
  true,
  'CAD-2025-100312-4567',
  ARRAY['https://armora-test-storage.s3.eu-west-2.amazonaws.com/incident-photos/inc-002-route-map.jpg'],
  '2025-10-03 15:00:00+00',
  '2025-10-03 15:00:00+00'
);

-- ============================================================================
-- ASSIGNMENT MESSAGES
-- ============================================================================
-- Creating sample message threads between principals and CPOs
-- Demonstrates real-time communication during assignments

INSERT INTO assignment_messages (
  id,
  assignment_id,
  sender_type,
  sender_id,
  message,
  read,
  created_at
) VALUES

-- Message Thread 1: Assignment 2 (Amara with Ms. Ashford - Shopping Trip)
-- Pre-assignment coordination messages
(
  'msg-00000000-0000-0000-0001-111111111111',
  'asn-00000000-0000-0000-0002-222222222222',
  'principal',
  'principal-0000-0000-0000-0002-222222222222',
  'Good morning. I should be ready to leave at 11am sharp. Please meet me in the hotel lobby.',
  true,
  '2025-10-03 09:15:00+00'
),
(
  'msg-00000000-0000-0000-0002-222222222222',
  'asn-00000000-0000-0000-0002-222222222222',
  'cpo',
  'cpo-00000000-0000-0000-0002-222222222222',
  'Understood, Ms. Ashford. I will be in the lobby at 10:50am. The route to Harrods has been planned - approximately 8 minutes travel time.',
  true,
  '2025-10-03 09:18:00+00'
),

-- Message Thread 2: Assignment 3 (James with Mr. Chen - Active Transport)
-- Active assignment communication including urgent security alert
(
  'msg-00000000-0000-0000-0003-333333333333',
  'asn-00000000-0000-0000-0003-333333333333',
  'cpo',
  'cpo-00000000-0000-0000-0001-111111111111',
  'Good afternoon, Mr. Chen. I have completed the vehicle security sweep. All clear. Ready to depart at your convenience.',
  true,
  '2025-10-03 13:45:00+00'
),
(
  'msg-00000000-0000-0000-0004-444444444444',
  'asn-00000000-0000-0000-0003-333333333333',
  'principal',
  'principal-0000-0000-0000-0003-333333333333',
  'Thank you. Just finishing a call, will be down in 5 minutes.',
  true,
  '2025-10-03 13:47:00+00'
),
(
  'msg-00000000-0000-0000-0005-555555555555',
  'asn-00000000-0000-0000-0003-333333333333',
  'cpo',
  'cpo-00000000-0000-0000-0001-111111111111',
  'URGENT: Route alteration implemented due to security concern. ETA now 16:15. You are safe. Will brief on arrival.',
  false,
  '2025-10-03 14:38:00+00'
);

-- ============================================================================
-- SEED DATA COMPLETE
-- ============================================================================
--
-- Successfully seeded local development database with:
-- - 5 Protection Officers (CPOs) with varied specializations
-- - 8 Protection Assignments (pending, assigned, active, completed, cancelled)
-- - 4 Payment Records (completed and processing)
-- - 2 Incident Reports (medium and high severity)
-- - 5 Assignment Messages between principals and CPOs
--
-- All test data uses consistent identifiers:
-- - IDs: xxx-00000000-0000-0000-000X-XXXXXXXXXXXX format
-- - Emails: @armoracpo.test domain
-- - Phone numbers: +4477009000XX test range
--
-- This seed data provides comprehensive coverage for testing:
-- - Assignment workflows and status transitions
-- - Payment processing and tracking
-- - Incident reporting and documentation
-- - Real-time messaging between users
-- - Various threat levels and assignment types
-- - Different CPO specializations and ratings
--
-- This data is automatically loaded when running: supabase db reset
--
-- ============================================================================
