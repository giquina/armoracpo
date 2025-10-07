import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiBriefcase, FiCheckCircle, FiClock, FiBookmark } from 'react-icons/fi';
import JobsHeader from '../../components/jobs/JobsHeader';
import JobFilters from '../../components/jobs/JobFilters';
import BrowseJobCard from '../../components/jobs/BrowseJobCard';
import JobDetailsModal from '../../components/jobs/JobDetailsModal';
import './Jobs.css';
import DevPanel from '../../components/dev/DevPanel';

// Mock job data
const MOCK_JOBS = [
  {
    id: '1',
    title: 'Executive Close Protection - Central London',
    clientType: 'Corporate',
    clientRating: 4.8,
    location: 'Mayfair, London',
    distance: 2.3,
    dateRange: '15 Oct - 20 Oct 2025',
    duration: 'Short-term',
    payRate: '£350/day',
    payAmount: 350,
    requirements: ['SIA CP License', 'Driving', 'First Aid'],
    description: 'Seeking experienced CP officer for high-profile corporate executive visiting London. Must have extensive city protection experience and excellent driving skills.',
    applicantCount: 12,
    postedTime: '2 hours ago',
    deadline: '2025-10-12T23:59:59',
    riskLevel: 'Medium',
    jobType: 'Executive',
    fullDescription: 'We are seeking a highly experienced Close Protection Officer to provide security services for a high-profile corporate executive during their week-long visit to London. The assignment will involve residential security, secure transportation, and event protection across various Central London locations.',
    clientName: 'Global Finance Corp',
    clientStats: {
      totalJobs: 45,
      hireRate: 92,
      avgRating: 4.8,
      responseTime: '2 hours'
    },
    coordinates: [51.5074, -0.1278],
    similarJobs: ['2', '3']
  },
  {
    id: '2',
    title: 'Residential Security - Kensington Estate',
    clientType: 'Individual',
    clientRating: 5.0,
    location: 'Kensington, London',
    distance: 4.1,
    dateRange: '1 Nov 2025 - Ongoing',
    duration: 'Long-term',
    payRate: '£280/day',
    payAmount: 280,
    requirements: ['SIA Door Supervisor', 'CCTV', 'Patrol'],
    description: 'Long-term residential security position for luxury estate. Day and night shifts available. Must be discreet and professional.',
    applicantCount: 8,
    postedTime: '1 day ago',
    deadline: '2025-10-25T23:59:59',
    riskLevel: 'Low',
    jobType: 'Residential',
    fullDescription: 'Prestigious long-term residential security role protecting a luxury private estate in Kensington. Responsibilities include perimeter patrols, CCTV monitoring, access control, and guest management.',
    clientName: 'Private Residence',
    clientStats: {
      totalJobs: 8,
      hireRate: 100,
      avgRating: 5.0,
      responseTime: '1 hour'
    },
    coordinates: [51.4988, -0.1749],
    similarJobs: ['5', '7']
  },
  {
    id: '3',
    title: 'Celebrity Event Security - O2 Arena',
    clientType: 'Celebrity',
    clientRating: 4.6,
    location: 'Greenwich, London',
    distance: 8.7,
    dateRange: '28 Oct 2025',
    duration: 'One-off',
    payRate: '£400/day',
    payAmount: 400,
    requirements: ['SIA CP License', 'Crowd Control', 'Event Security'],
    description: 'Security detail for high-profile celebrity at sold-out arena event. Experience with crowd management and paparazzi handling essential.',
    applicantCount: 24,
    postedTime: '3 hours ago',
    deadline: '2025-10-20T23:59:59',
    riskLevel: 'High',
    jobType: 'Event',
    fullDescription: 'Premium event security assignment providing close protection for an A-list celebrity during their performance at the O2 Arena. Role includes backstage security, stage access control, and secure transportation.',
    clientName: 'Entertainment Management Ltd',
    clientStats: {
      totalJobs: 156,
      hireRate: 78,
      avgRating: 4.6,
      responseTime: '3 hours'
    },
    coordinates: [51.5033, 0.0031],
    similarJobs: ['4', '6']
  },
  {
    id: '4',
    title: 'Government Diplomat Protection',
    clientType: 'Government',
    clientRating: 4.9,
    location: 'Westminster, London',
    distance: 1.5,
    dateRange: '10 Nov - 15 Nov 2025',
    duration: 'Short-term',
    payRate: '£450/day',
    payAmount: 450,
    requirements: ['SC Clearance', 'SIA CP License', 'Armed', 'Languages'],
    description: 'High-level protection assignment for visiting diplomat. Security clearance and advanced training required. Multilingual candidates preferred.',
    applicantCount: 6,
    postedTime: '5 hours ago',
    deadline: '2025-10-28T23:59:59',
    riskLevel: 'High',
    jobType: 'Close Protection',
    fullDescription: 'Exceptional opportunity to provide close protection services for a visiting government diplomat during high-level political meetings in Westminster. SC clearance mandatory.',
    clientName: 'HM Government',
    clientStats: {
      totalJobs: 89,
      hireRate: 95,
      avgRating: 4.9,
      responseTime: '24 hours'
    },
    coordinates: [51.4975, -0.1357],
    similarJobs: ['1', '9']
  },
  {
    id: '5',
    title: 'Luxury Retail Security - Bond Street',
    clientType: 'Corporate',
    clientRating: 4.5,
    location: 'Mayfair, London',
    distance: 2.8,
    dateRange: '20 Oct - 31 Dec 2025',
    duration: 'Short-term',
    payRate: '£220/day',
    payAmount: 220,
    requirements: ['SIA Door Supervisor', 'Retail Security', 'Customer Service'],
    description: 'Premium retail security for flagship luxury store. Must maintain high professional standards and excellent customer interaction skills.',
    applicantCount: 15,
    postedTime: '6 hours ago',
    deadline: '2025-10-18T23:59:59',
    riskLevel: 'Low',
    jobType: 'Other',
    fullDescription: 'High-end retail security position at prestigious Bond Street flagship store. Role combines security presence with exceptional customer service standards.',
    clientName: 'Luxury Brands Group',
    clientStats: {
      totalJobs: 67,
      hireRate: 85,
      avgRating: 4.5,
      responseTime: '4 hours'
    },
    coordinates: [51.5142, -0.1494],
    similarJobs: ['2', '10']
  },
  {
    id: '6',
    title: 'Music Festival Security - Hyde Park',
    clientType: 'Corporate',
    clientRating: 4.7,
    location: 'Hyde Park, London',
    distance: 3.2,
    dateRange: '5 Nov - 7 Nov 2025',
    duration: 'One-off',
    payRate: '£300/day',
    payAmount: 300,
    requirements: ['SIA Door Supervisor', 'Event Security', 'First Aid'],
    description: '3-day music festival security team. Multiple positions available. Experience with large-scale outdoor events required.',
    applicantCount: 42,
    postedTime: '1 day ago',
    deadline: '2025-10-30T23:59:59',
    riskLevel: 'Medium',
    jobType: 'Event',
    fullDescription: 'Major music festival security operation requiring experienced security professionals for crowd management, access control, and emergency response across a 50,000-capacity venue.',
    clientName: 'Live Nation Events',
    clientStats: {
      totalJobs: 234,
      hireRate: 88,
      avgRating: 4.7,
      responseTime: '2 hours'
    },
    coordinates: [51.5073, -0.1657],
    similarJobs: ['3', '8']
  },
  {
    id: '7',
    title: 'Private Villa Security - Surrey',
    clientType: 'Individual',
    clientRating: 4.9,
    location: 'Surrey',
    distance: 18.5,
    dateRange: '1 Dec 2025 - Ongoing',
    duration: 'Long-term',
    payRate: '£320/day',
    payAmount: 320,
    requirements: ['SIA Door Supervisor', 'Driving', 'Residential Security'],
    description: 'Permanent security position for private villa with grounds. Accommodation available. Ideal for experienced residential security professional.',
    applicantCount: 5,
    postedTime: '12 hours ago',
    deadline: '2025-11-15T23:59:59',
    riskLevel: 'Low',
    jobType: 'Residential',
    fullDescription: 'Exceptional long-term residential security role with accommodation provided on a luxury Surrey estate. Comprehensive security responsibilities including grounds patrol and property management.',
    clientName: 'Private Estate',
    clientStats: {
      totalJobs: 3,
      hireRate: 100,
      avgRating: 4.9,
      responseTime: '30 mins'
    },
    coordinates: [51.2787, -0.5217],
    similarJobs: ['2', '5']
  },
  {
    id: '8',
    title: 'Corporate Gala Security - Canary Wharf',
    clientType: 'Corporate',
    clientRating: 4.8,
    location: 'Canary Wharf, London',
    distance: 6.4,
    dateRange: '18 Oct 2025',
    duration: 'One-off',
    payRate: '£280/day',
    payAmount: 280,
    requirements: ['SIA Door Supervisor', 'Event Security', 'Corporate'],
    description: 'Black-tie corporate event security. VIP guest management and access control. Smart appearance essential.',
    applicantCount: 18,
    postedTime: '8 hours ago',
    deadline: '2025-10-16T23:59:59',
    riskLevel: 'Low',
    jobType: 'Event',
    fullDescription: 'Prestigious corporate gala event requiring impeccably presented security professionals for VIP guest management and discrete security presence.',
    clientName: 'Financial Services Group',
    clientStats: {
      totalJobs: 112,
      hireRate: 90,
      avgRating: 4.8,
      responseTime: '1 hour'
    },
    coordinates: [51.5054, -0.0235],
    similarJobs: ['3', '6']
  },
  {
    id: '9',
    title: 'Executive Transport Security',
    clientType: 'Corporate',
    clientRating: 4.6,
    location: 'City of London',
    distance: 4.9,
    dateRange: '25 Oct - 10 Nov 2025',
    duration: 'Short-term',
    payRate: '£380/day',
    payAmount: 380,
    requirements: ['SIA CP License', 'Advanced Driving', 'Route Planning'],
    description: 'Secure transportation for C-suite executives. Advanced driving qualification and route planning expertise required.',
    applicantCount: 9,
    postedTime: '4 hours ago',
    deadline: '2025-10-22T23:59:59',
    riskLevel: 'Medium',
    jobType: 'Transport',
    fullDescription: 'Executive transportation security role providing secure chauffeur and protection services for senior corporate executives during a major business conference.',
    clientName: 'Executive Protection Services',
    clientStats: {
      totalJobs: 78,
      hireRate: 87,
      avgRating: 4.6,
      responseTime: '2 hours'
    },
    coordinates: [51.5155, -0.0922],
    similarJobs: ['1', '4']
  },
  {
    id: '10',
    title: 'Hotel Security Manager - Savoy',
    clientType: 'Corporate',
    clientRating: 5.0,
    location: 'Covent Garden, London',
    distance: 2.1,
    dateRange: '1 Nov 2025 - Ongoing',
    duration: 'Long-term',
    payRate: '£340/day',
    payAmount: 340,
    requirements: ['SIA Door Supervisor', 'Team Leadership', 'Hospitality'],
    description: '5-star hotel security manager position. Team leadership experience essential. Coordinate security operations and staff.',
    applicantCount: 11,
    postedTime: '1 day ago',
    deadline: '2025-10-28T23:59:59',
    riskLevel: 'Low',
    jobType: 'Other',
    fullDescription: 'Premium hotel security management role overseeing security operations, staff coordination, and VIP guest protection at London\'s most prestigious hotel.',
    clientName: 'The Savoy Hotel',
    clientStats: {
      totalJobs: 34,
      hireRate: 94,
      avgRating: 5.0,
      responseTime: '1 hour'
    },
    coordinates: [51.5107, -0.1204],
    similarJobs: ['2', '5']
  }
];

type TabType = 'browse' | 'applications' | 'active' | 'completed' | 'saved';

interface JobFiltersType {
  search: string;
  location: string;
  radius: number;
  payMin: number;
  payMax: number;
  dateFrom: string;
  dateTo: string;
  duration: string[];
  jobTypes: string[];
  riskLevel: string[];
  clientType: string[];
  requirements: string[];
}

const Jobs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('browse');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [sortBy, setSortBy] = useState('relevant');
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'map'>('list');
  const [savedJobs, setSavedJobs] = useState<string[]>(() => {
    const saved = localStorage.getItem('savedJobs');
    return saved ? JSON.parse(saved) : [];
  });

  const [filters, setFilters] = useState<JobFiltersType>({
    search: '',
    location: '',
    radius: 50,
    payMin: 0,
    payMax: 1000,
    dateFrom: '',
    dateTo: '',
    duration: [],
    jobTypes: [],
    riskLevel: [],
    clientType: [],
    requirements: []
  });

  // Filter and search logic
  const filteredJobs = MOCK_JOBS.filter(job => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch =
        job.title.toLowerCase().includes(searchLower) ||
        job.description.toLowerCase().includes(searchLower) ||
        job.location.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Pay range filter
    if (job.payAmount < filters.payMin || job.payAmount > filters.payMax) {
      return false;
    }

    // Duration filter
    if (filters.duration.length > 0 && !filters.duration.includes(job.duration)) {
      return false;
    }

    // Job type filter
    if (filters.jobTypes.length > 0 && !filters.jobTypes.includes(job.jobType)) {
      return false;
    }

    // Risk level filter
    if (filters.riskLevel.length > 0 && !filters.riskLevel.includes(job.riskLevel)) {
      return false;
    }

    // Client type filter
    if (filters.clientType.length > 0 && !filters.clientType.includes(job.clientType)) {
      return false;
    }

    // Requirements filter
    if (filters.requirements.length > 0) {
      const hasRequirement = filters.requirements.some(req =>
        job.requirements.some(jobReq => jobReq.toLowerCase().includes(req.toLowerCase()))
      );
      if (!hasRequirement) return false;
    }

    return true;
  });

  // Sort logic
  const sortedJobs = [...filteredJobs].sort((a, b) => {
    switch (sortBy) {
      case 'payHigh':
        return b.payAmount - a.payAmount;
      case 'payLow':
        return a.payAmount - b.payAmount;
      case 'dateNew':
        return a.postedTime.localeCompare(b.postedTime);
      case 'distance':
        return a.distance - b.distance;
      default:
        return 0;
    }
  });

  const handleSaveJob = (jobId: string) => {
    const newSaved = savedJobs.includes(jobId)
      ? savedJobs.filter(id => id !== jobId)
      : [...savedJobs, jobId];
    setSavedJobs(newSaved);
    localStorage.setItem('savedJobs', JSON.stringify(newSaved));
  };

  const activeFilterCount =
    (filters.duration.length > 0 ? 1 : 0) +
    (filters.jobTypes.length > 0 ? 1 : 0) +
    (filters.riskLevel.length > 0 ? 1 : 0) +
    (filters.clientType.length > 0 ? 1 : 0) +
    (filters.requirements.length > 0 ? 1 : 0) +
    (filters.payMin > 0 || filters.payMax < 1000 ? 1 : 0);

  const tabs = [
    { id: 'browse' as TabType, label: 'Browse Jobs', icon: FiSearch },
    { id: 'applications' as TabType, label: 'My Applications', icon: FiBriefcase },
    { id: 'active' as TabType, label: 'Active', icon: FiClock },
    { id: 'completed' as TabType, label: 'Completed', icon: FiCheckCircle },
    { id: 'saved' as TabType, label: 'Saved', icon: FiBookmark }
  ];

  return (
    <div className="jobs-screen">
      {/* Tab Navigation */}
      <div className="jobs-tabs">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`jobs-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon className="jobs-tab-icon" />
              <span className="jobs-tab-label">{tab.label}</span>
            </button>
          );
        })}
      <DevPanel />

      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className="jobs-tab-content"
        >
          {activeTab === 'browse' && (
            <>
              <JobsHeader
                searchQuery={filters.search}
                onSearchChange={(search) => setFilters({ ...filters, search })}
                filterCount={activeFilterCount}
                onFilterClick={() => setShowFilters(!showFilters)}
                sortBy={sortBy}
                onSortChange={setSortBy}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                resultCount={sortedJobs.length}
              />

              <div className="jobs-content">
                {showFilters && (
                  <JobFilters
                    filters={filters}
                    onFiltersChange={setFilters}
                    onClose={() => setShowFilters(false)}
                  />
                )}

                <div className={`jobs-list ${viewMode}`}>
                  {sortedJobs.length === 0 ? (
                    <div className="jobs-empty">
                      <FiSearch className="jobs-empty-icon" />
                      <h3>No jobs found</h3>
                      <p>Try adjusting your filters or search criteria</p>
                    </div>
                  ) : (
                    sortedJobs.map(job => (
                      <BrowseJobCard
                        key={job.id}
                        job={job}
                        isSaved={savedJobs.includes(job.id)}
                        onSave={handleSaveJob}
                        onClick={() => setSelectedJob(job)}
                      />
                    ))
                  )}
                </div>
              </div>
            </>
          )}

          {activeTab === 'applications' && (
            <div className="jobs-applications">
              <div className="empty-state">
                <FiBriefcase className="empty-state-icon" />
                <h3>No Applications Yet</h3>
                <p>Jobs you apply for will appear here</p>
              </div>
            </div>
          )}

          {activeTab === 'active' && (
            <div className="jobs-active">
              <div className="empty-state">
                <FiClock className="empty-state-icon" />
                <h3>No Active Assignments</h3>
                <p>Your active assignments will appear here</p>
              </div>
            </div>
          )}

          {activeTab === 'completed' && (
            <div className="jobs-completed">
              <div className="empty-state">
                <FiCheckCircle className="empty-state-icon" />
                <h3>No Completed Jobs</h3>
                <p>Your completed assignments will appear here</p>
              </div>
            </div>
          )}

          {activeTab === 'saved' && (
            <div className="jobs-saved">
              {savedJobs.length === 0 ? (
                <div className="empty-state">
                  <FiBookmark className="empty-state-icon" />
                  <h3>No Saved Jobs</h3>
                  <p>Bookmark jobs to view them later</p>
                </div>
              ) : (
                <div className={`jobs-list ${viewMode}`}>
                  {MOCK_JOBS.filter(job => savedJobs.includes(job.id)).map(job => (
                    <BrowseJobCard
                      key={job.id}
                      job={job}
                      isSaved={true}
                      onSave={handleSaveJob}
                      onClick={() => setSelectedJob(job)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Job Details Modal */}
      {selectedJob && (
        <JobDetailsModal
          job={selectedJob}
          isSaved={savedJobs.includes(selectedJob.id)}
          onSave={handleSaveJob}
          onClose={() => setSelectedJob(null)}
          allJobs={MOCK_JOBS}
        />
      )}
    </div>
  );
};

export default Jobs;
