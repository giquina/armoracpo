/**
 * Mock Data for UI Testing
 * Contains realistic test data for all app features
 */

import { ProtectionAssignment, PaymentRecord, AssignmentMessage } from '../lib/supabase';

// Mock Assignments
export const mockAssignments: ProtectionAssignment[] = [
  {
    id: 'assignment-001',
    client_id: 'client-001',
    cpo_id: 'mock-cpo-001',
    status: 'assigned',
    assignment_type: 'Executive Protection',
    threat_level: 'medium',
    pickup_location: {
      address: '10 Downing Street, Westminster, London',
      latitude: 51.5034,
      longitude: -0.1276,
    },
    dropoff_location: {
      address: 'The Shard, London Bridge Street, London',
      latitude: 51.5045,
      longitude: -0.0865,
    },
    scheduled_start: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
    scheduled_end: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), // 6 hours from now
    actual_start: null,
    actual_end: null,
    hourly_rate: 45,
    estimated_hours: 4,
    final_cost: null,
    special_instructions: 'Executive requires discreet protection during business meeting.',
    required_certifications: ['Executive Protection', 'First Aid'],
    vehicle_required: true,
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'assignment-002',
    client_id: 'client-002',
    cpo_id: null,
    status: 'pending',
    assignment_type: 'Event Security',
    threat_level: 'low',
    pickup_location: {
      address: 'Royal Albert Hall, Kensington Gore, London',
      latitude: 51.5009,
      longitude: -0.1773,
    },
    dropoff_location: null,
    scheduled_start: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // 2 days from now
    scheduled_end: new Date(Date.now() + 54 * 60 * 60 * 1000).toISOString(),
    actual_start: null,
    actual_end: null,
    hourly_rate: 40,
    estimated_hours: 6,
    final_cost: null,
    special_instructions: 'VIP event protection. Black tie dress code.',
    required_certifications: ['Event Security', 'Crowd Management'],
    vehicle_required: false,
    created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'assignment-003',
    client_id: 'client-003',
    cpo_id: 'mock-cpo-001',
    status: 'completed',
    assignment_type: 'Residential Security',
    threat_level: 'high',
    pickup_location: {
      address: 'Mayfair, London W1K',
      latitude: 51.5074,
      longitude: -0.1419,
    },
    dropoff_location: null,
    scheduled_start: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(), // 3 days ago
    scheduled_end: new Date(Date.now() - 60 * 60 * 60 * 1000).toISOString(),
    actual_start: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    actual_end: new Date(Date.now() - 60 * 60 * 60 * 1000).toISOString(),
    hourly_rate: 50,
    estimated_hours: 12,
    final_cost: 600,
    special_instructions: 'Overnight residential security. High-profile client.',
    required_certifications: ['Residential Security', 'Advanced Security'],
    vehicle_required: false,
    created_at: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 60 * 60 * 60 * 1000).toISOString(),
  },
];

// Mock Payments
export const mockPayments: PaymentRecord[] = [
  {
    id: 'payment-001',
    assignment_id: 'assignment-003',
    cpo_id: 'mock-cpo-001',
    amount: 600,
    currency: 'GBP',
    payment_status: 'completed',
    payment_method: 'stripe',
    stripe_payment_intent_id: 'pi_mock_001',
    paid_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 60 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'payment-002',
    assignment_id: 'assignment-001',
    cpo_id: 'mock-cpo-001',
    amount: 180,
    currency: 'GBP',
    payment_status: 'pending',
    payment_method: 'stripe',
    stripe_payment_intent_id: 'pi_mock_002',
    paid_at: null,
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Mock Messages
export const mockMessages: AssignmentMessage[] = [
  {
    id: 'message-001',
    assignment_id: 'assignment-001',
    sender_id: 'client-001',
    sender_type: 'client',
    message_text: 'Hello, I have updated the meeting location. Please confirm you received this.',
    read_at: null,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'message-002',
    assignment_id: 'assignment-001',
    sender_id: 'mock-cpo-001',
    sender_type: 'cpo',
    message_text: 'Confirmed. I have updated my route to the new location.',
    read_at: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 1.8 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'message-003',
    assignment_id: 'assignment-001',
    sender_id: 'client-001',
    sender_type: 'client',
    message_text: 'Great, thank you. See you tomorrow.',
    read_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
  },
];

// Mock Recent Activity
export const mockRecentActivity = [
  {
    id: 'activity-001',
    type: 'assignment_completed',
    title: 'Assignment Completed',
    description: 'You completed a 12-hour residential security assignment',
    timestamp: new Date(Date.now() - 60 * 60 * 60 * 1000).toISOString(),
    metadata: { assignmentId: 'assignment-003' },
  },
  {
    id: 'activity-002',
    type: 'payment_received',
    title: 'Payment Received',
    description: 'You received £600 for assignment #003',
    timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    metadata: { paymentId: 'payment-001', amount: 600 },
  },
  {
    id: 'activity-003',
    type: 'assignment_assigned',
    title: 'New Assignment',
    description: 'You accepted an executive protection assignment',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    metadata: { assignmentId: 'assignment-001' },
  },
  {
    id: 'activity-004',
    type: 'message_received',
    title: 'New Message',
    description: 'Client sent you a message about assignment #001',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    metadata: { messageId: 'message-001' },
  },
];

// Mock Jobs/Available Assignments
export const mockAvailableJobs = [
  {
    id: 'job-001',
    title: 'Executive Protection - City of London',
    location: 'City of London, EC2',
    distance: 2.3,
    dateRange: 'Tomorrow, 14:00 - 18:00',
    duration: '4 hours',
    payRate: 45,
    riskLevel: 'medium' as const,
    clientName: 'Sarah Johnson',
    clientRating: 4.9,
    applicantCount: 3,
    description: 'Executive protection for business meeting in the City.',
    requirements: ['SIA Close Protection License', 'Executive Protection Experience', 'First Aid Certified'],
    isSaved: false,
  },
  {
    id: 'job-002',
    title: 'Event Security - Royal Albert Hall',
    location: 'Kensington, SW7',
    distance: 3.1,
    dateRange: 'Fri 8 Oct, 18:00 - 23:00',
    duration: '5 hours',
    payRate: 40,
    riskLevel: 'low' as const,
    clientName: 'Events Ltd',
    clientRating: 4.7,
    applicantCount: 8,
    description: 'VIP event security for classical music concert.',
    requirements: ['SIA Door Supervisor License', 'Event Security Experience'],
    isSaved: true,
  },
];

// Mock Client Info
export const mockClients = {
  'client-001': {
    id: 'client-001',
    name: 'Sarah Johnson',
    rating: 4.9,
    completedBookings: 23,
  },
  'client-002': {
    id: 'client-002',
    name: 'Events Ltd',
    rating: 4.7,
    completedBookings: 156,
  },
  'client-003': {
    id: 'client-003',
    name: 'Private Residence',
    rating: 5.0,
    completedBookings: 8,
  },
};
