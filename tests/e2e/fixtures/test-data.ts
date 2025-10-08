export const TEST_USERS = {
  cpo: {
    email: 'test.cpo@armoracpo.com',
    password: 'TestPassword123!',
    fullName: 'Test CPO User',
    siaNumber: 'SIA123456789',
  },
  admin: {
    email: 'test.admin@armoracpo.com',
    password: 'AdminPassword123!',
    fullName: 'Test Admin User',
  },
  newUser: {
    email: `test.${Date.now()}@armoracpo.com`,
    password: 'NewPassword123!',
    fullName: 'New Test User',
    siaNumber: 'SIA987654321',
  },
};

export const TEST_JOBS = {
  corporateEvent: {
    title: 'Corporate Event Security',
    location: 'London, UK',
    date: '2025-02-15',
    time: '18:00',
    duration: '6 hours',
    rate: '£15/hour',
    description: 'Security for corporate networking event',
  },
  retailStore: {
    title: 'Retail Store Security',
    location: 'Manchester, UK',
    date: '2025-02-20',
    time: '09:00',
    duration: '8 hours',
    rate: '£14/hour',
    description: 'Loss prevention at retail location',
  },
};

export const TEST_MESSAGES = {
  greeting: 'Hello, this is a test message from E2E tests',
  question: 'What time should I arrive for the assignment?',
  confirmation: 'Confirmed, I will be there on time',
};

export const TEST_INCIDENTS = {
  minorIncident: {
    type: 'Minor Incident',
    title: 'Suspicious Activity',
    description: 'Individual loitering near entrance, asked to move along',
    location: 'Main Entrance',
    severity: 'Low',
  },
  mediumIncident: {
    type: 'Security Breach',
    title: 'Unauthorized Access Attempt',
    description: 'Person attempted to enter restricted area, escorted out',
    location: 'Server Room',
    severity: 'Medium',
  },
};
