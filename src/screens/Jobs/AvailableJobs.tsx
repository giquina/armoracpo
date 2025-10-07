import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaSearch, FaList, FaMap, FaSortAmountDown } from 'react-icons/fa';
import { IconWrapper } from '../../utils/IconWrapper';
import { ProtectionAssignment } from '../../lib/supabase';
import { assignmentService } from '../../services/assignmentService';
import { authService } from '../../services/authService';
import JobCard from '../../components/jobs/JobCard';
import FilterPanel, { JobFilters } from '../../components/jobs/FilterPanel';
import JobsMap from '../../components/jobs/JobsMap';
import JobDetailModal from '../../components/jobs/JobDetailModal';
import '../../styles/global.css';
import DevPanel from '../../components/dev/DevPanel';

type ViewMode = 'list' | 'map';
type SortOption = 'distance' | 'rate' | 'date' | 'urgency';

const AvailableJobs: React.FC = () => {
  const [assignments, setAssignments] = useState<ProtectionAssignment[]>([]);
  const [filteredAssignments, setFilteredAssignments] = useState<ProtectionAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [cpoId, setCpoId] = useState<string>('');

  const [filters, setFilters] = useState<JobFilters>({
    dateRange: null,
    locationRadius: 50,
    rateRange: { min: 0, max: 200 },
    assignmentTypes: [],
    threatLevels: [],
  });

  useEffect(() => {
    loadCurrentUser();
    loadAvailableAssignments();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [assignments, filters, searchQuery, sortBy]);

  const loadCurrentUser = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        setCpoId(currentUser.cpo.id);
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const loadAvailableAssignments = async () => {
    try {
      setLoading(true);
      const jobs = await assignmentService.getAvailableAssignments();
      setAssignments(jobs);
    } catch (error) {
      console.error('Error loading assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...assignments];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter((job) =>
        job.pickup_location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.assignment_type.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Assignment type filter
    if (filters.assignmentTypes.length > 0) {
      filtered = filtered.filter((job) => filters.assignmentTypes.includes(job.assignment_type));
    }

    // Threat level filter
    if (filters.threatLevels.length > 0) {
      filtered = filtered.filter((job) => filters.threatLevels.includes(job.threat_level));
    }

    // Rate range filter
    filtered = filtered.filter(
      (job) => job.base_rate >= filters.rateRange.min && job.base_rate <= filters.rateRange.max
    );

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rate':
          return b.base_rate - a.base_rate;
        case 'date':
          return new Date(a.scheduled_start_time).getTime() - new Date(b.scheduled_start_time).getTime();
        case 'urgency':
          return new Date(a.scheduled_start_time).getTime() - new Date(b.scheduled_start_time).getTime();
        case 'distance':
        default:
          return 0; // Would calculate actual distance in production
      }
    });

    setFilteredAssignments(filtered);
  };

  const handleAcceptJob = async (assignmentId: string) => {
    if (!cpoId) {
      alert('Unable to accept assignment. Please try logging in again.');
      return;
    }

    try {
      await assignmentService.acceptAssignment(assignmentId, cpoId);
      alert('Assignment accepted successfully! View it in your active assignments.');
      loadAvailableAssignments();
    } catch (error: any) {
      console.error('Error accepting assignment:', error);
      alert(error.message || 'Failed to accept assignment. Please try again.');
    }
  };

  const handleViewDetails = (assignmentId: string) => {
    setSelectedJobId(assignmentId);
  };

  const selectedJob = assignments.find((job) => job.id === selectedJobId) || null;

  if (loading) {
    return (
      <div
        className="safe-top safe-bottom"
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          backgroundColor: 'var(--armora-bg-secondary)',
        }}
      >
        <div className="spinner spinner-gold" />
      <DevPanel />

      </div>
    );
  }

  return (
    <div
      className="safe-top safe-bottom"
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--armora-bg-secondary)',
        paddingBottom: '100px',
      }}
    >
      {/* Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, var(--armora-navy) 0%, var(--armora-navy-light) 100%)',
          color: 'white',
          padding: 'var(--armora-space-lg)',
          borderRadius: '0 0 var(--armora-radius-2xl) var(--armora-radius-2xl)',
        }}
      >
        <h1 className="font-display" style={{ fontSize: 'var(--armora-text-2xl)', marginBottom: 'var(--armora-space-sm)' }}>
          Available Assignments
        </h1>
        <p style={{ fontSize: 'var(--armora-text-sm)', opacity: 0.9 }}>
          {filteredAssignments.length} assignment{filteredAssignments.length !== 1 ? 's' : ''} available
        </p>
      </div>

      <div className="container" style={{ paddingTop: 'var(--armora-space-lg)' }}>
        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ marginBottom: 'var(--armora-space-md)' }}
        >
          <div style={{ position: 'relative' }}>
            <IconWrapper
              icon={FaSearch}
              style={{
                position: 'absolute',
                left: 'var(--armora-space-md)',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--armora-text-secondary)',
              }}
              size={16}
            />
            <input
              type="text"
              placeholder="Search by location or type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                paddingLeft: 'calc(var(--armora-space-md) * 3)',
              }}
            />
          </div>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            display: 'flex',
            gap: 'var(--armora-space-sm)',
            marginBottom: 'var(--armora-space-md)',
          }}
        >
          {/* View Toggle */}
          <div
            style={{
              display: 'flex',
              backgroundColor: 'var(--armora-bg-primary)',
              borderRadius: 'var(--armora-radius-md)',
              padding: 'var(--armora-space-xs)',
              border: '1px solid var(--armora-border-light)',
            }}
          >
            <button
              className={viewMode === 'list' ? 'btn-primary' : 'btn-secondary'}
              style={{
                padding: 'var(--armora-space-sm)',
                minHeight: 'auto',
                borderRadius: 'var(--armora-radius-sm)',
              }}
              onClick={() => setViewMode('list')}
            >
              <IconWrapper icon={FaList} size={16} />
            </button>
            <button
              className={viewMode === 'map' ? 'btn-primary' : 'btn-secondary'}
              style={{
                padding: 'var(--armora-space-sm)',
                minHeight: 'auto',
                borderRadius: 'var(--armora-radius-sm)',
                marginLeft: 'var(--armora-space-xs)',
              }}
              onClick={() => setViewMode('map')}
            >
              <IconWrapper icon={FaMap} size={16} />
            </button>
          </div>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--armora-space-sm)',
            }}
          >
            <option value="distance">Nearest First</option>
            <option value="rate">Highest Rate</option>
            <option value="date">Soonest</option>
            <option value="urgency">Most Urgent</option>
          </select>
        </motion.div>

        {/* Filter Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <FilterPanel
            filters={filters}
            onFiltersChange={setFilters}
            isOpen={isFilterOpen}
            onToggle={() => setIsFilterOpen(!isFilterOpen)}
          />
        </motion.div>

        {/* Map View */}
        {viewMode === 'map' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            style={{ marginBottom: 'var(--armora-space-md)' }}
          >
            <JobsMap jobs={filteredAssignments} onJobSelect={handleViewDetails} />
          </motion.div>
        )}

        {/* Jobs List */}
        {viewMode === 'list' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {filteredAssignments.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: 'var(--armora-space-xl)' }}>
                <div style={{ fontSize: '64px', marginBottom: 'var(--armora-space-md)' }}>
                  {searchQuery || filters.assignmentTypes.length > 0 ? '🔍' : '📭'}
                </div>
                <h3 className="mb-sm">No Assignments Found</h3>
                <p className="text-sm text-secondary">
                  {searchQuery || filters.assignmentTypes.length > 0
                    ? 'Try adjusting your filters or search criteria'
                    : 'Check back soon for new opportunities'}
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--armora-space-md)' }}>
                {filteredAssignments.map((job, index) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <JobCard
                      assignment={job}
                      onViewDetails={handleViewDetails}
                      onAccept={handleAcceptJob}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Job Detail Modal */}
      <JobDetailModal
        assignment={selectedJob}
        isOpen={selectedJobId !== null}
        onClose={() => setSelectedJobId(null)}
        onAccept={handleAcceptJob}
      />
    </div>
  );
};

export default AvailableJobs;
