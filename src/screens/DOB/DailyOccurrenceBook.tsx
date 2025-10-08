import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { dobService } from '../../services/dobService';
import { authService } from '../../services/authService';
import { DOBEntry, DOBEventType } from '../../types';
import { DOBEntryForm } from '../../components/dob/DOBEntryForm';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import './DailyOccurrenceBook.css';
import DevPanel from '../../components/dev/DevPanel';

const DailyOccurrenceBook: React.FC = () => {
  const [cpoId, setCpoId] = useState<string | null>(null);
  const [entries, setEntries] = useState<DOBEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<DOBEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEntryForm, setShowEntryForm] = useState(false);

  // Filters
  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month' | 'all'>('week');
  const [entryTypeFilter, setEntryTypeFilter] = useState<'all' | 'auto' | 'manual'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const loadEntries = useCallback(async (id: string) => {
    try {
      const allEntries = await dobService.getDOBEntries(id);
      setEntries(allEntries);
    } catch (err: any) {
      throw new Error(err.message || 'Failed to load DOB entries');
    }
  }, []);

  const loadCPOAndEntries = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const currentUser = await authService.getCurrentUser();
      if (!currentUser) {
        setError('Unable to load user profile');
        return;
      }

      setCpoId(currentUser.cpo.id);
      await loadEntries(currentUser.cpo.id);
    } catch (err: any) {
      console.error('[DOB] Error loading data:', err);
      setError(err.message || 'Failed to load DOB entries');
    } finally {
      setLoading(false);
    }
  }, [loadEntries]);

  const applyFilters = useCallback(() => {
    let filtered = [...entries];

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();

      switch (dateFilter) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setDate(now.getDate() - 30);
          break;
      }

      filtered = filtered.filter(entry =>
        new Date(entry.timestamp) >= filterDate
      );
    }

    // Entry type filter
    if (entryTypeFilter !== 'all') {
      filtered = filtered.filter(entry => entry.entryType === entryTypeFilter);
    }

    // Search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(entry =>
        entry.description.toLowerCase().includes(query) ||
        entry.assignmentReference?.toLowerCase().includes(query)
      );
    }

    setFilteredEntries(filtered);
  }, [entries, dateFilter, entryTypeFilter, searchQuery]);

  useEffect(() => {
    loadCPOAndEntries();
  }, [loadCPOAndEntries]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleEntrySuccess = async () => {
    if (cpoId) {
      await loadEntries(cpoId);
    }
  };

  const groupEntriesByDate = (entries: DOBEntry[]) => {
    const grouped: Record<string, DOBEntry[]> = {};

    entries.forEach(entry => {
      const date = new Date(entry.timestamp).toLocaleDateString('en-GB', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(entry);
    });

    return grouped;
  };

  const getEventTypeIcon = (eventType: DOBEventType): string => {
    const icons: Record<DOBEventType, string> = {
      assignment_start: '▶️',
      assignment_end: '⏹️',
      location_change: '📍',
      principal_pickup: '👤',
      principal_dropoff: '🏁',
      route_deviation: '🔄',
      communication: '💬',
      manual_note: '📝',
      incident: '⚠️',
      other: '📋',
    };
    return icons[eventType] || '📋';
  };

  const getEventTypeLabel = (eventType: DOBEventType): string => {
    const labels: Record<DOBEventType, string> = {
      assignment_start: 'Assignment Start',
      assignment_end: 'Assignment End',
      location_change: 'Location Change',
      principal_pickup: 'Principal Pickup',
      principal_dropoff: 'Principal Dropoff',
      route_deviation: 'Route Deviation',
      communication: 'Communication',
      manual_note: 'Manual Note',
      incident: 'Incident',
      other: 'Other',
    };
    return labels[eventType] || eventType;
  };

  const formatTime = (timestamp: string): string => {
    return new Date(timestamp).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="dob-screen safe-top safe-bottom">
        <div className="dob-loading">
          <div className="spinner spinner-gold" />
          <p>Loading Daily Occurrence Book...</p>
        <DevPanel />

        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dob-screen safe-top safe-bottom">
        <div className="dob-error">
          <p>{error}</p>
          <Button onClick={loadCPOAndEntries}>Retry</Button>
        </div>
      </div>
    );
  }

  const groupedEntries = groupEntriesByDate(filteredEntries);
  const dateGroups = Object.keys(groupedEntries);

  return (
    <div className="dob-screen safe-top safe-bottom">
      {/* Header */}
      <div className="dob-header">
        <div className="dob-header-content">
          <h1 className="dob-title">Daily Occurrence Book</h1>
          <p className="dob-subtitle">
            Digital logbook - {entries.length} total entries
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowEntryForm(true)}
          icon={<span>+</span>}
        >
          Add Entry
        </Button>
      </div>

      {/* Filters */}
      <div className="dob-filters">
        {/* Date Filter */}
        <div className="dob-filter-group">
          <label className="dob-filter-label">Date Range</label>
          <div className="dob-filter-buttons">
            {(['today', 'week', 'month', 'all'] as const).map(period => (
              <button
                key={period}
                className={`dob-filter-btn ${dateFilter === period ? 'active' : ''}`}
                onClick={() => setDateFilter(period)}
              >
                {period === 'today' ? 'Today' : period === 'week' ? 'Week' : period === 'month' ? 'Month' : 'All'}
              </button>
            ))}
          </div>
        </div>

        {/* Entry Type Filter */}
        <div className="dob-filter-group">
          <label className="dob-filter-label">Entry Type</label>
          <select
            value={entryTypeFilter}
            onChange={(e) => setEntryTypeFilter(e.target.value as any)}
            className="dob-filter-select"
          >
            <option value="all">All Types</option>
            <option value="auto">Auto-Generated</option>
            <option value="manual">Manual Entries</option>
          </select>
        </div>

        {/* Search */}
        <div className="dob-filter-group dob-search-group">
          <label className="dob-filter-label">Search</label>
          <input
            type="search"
            placeholder="Search descriptions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="dob-search-input"
          />
        </div>
      </div>

      {/* Entries List */}
      <div className="dob-entries-container">
        {dateGroups.length === 0 ? (
          <EmptyState
            icon="📝"
            title="No entries found"
            description="No DOB entries match your current filters. Try adjusting the filters or add a new entry."
            action="Add First Entry"
            onAction={() => setShowEntryForm(true)}
          />
        ) : (
          dateGroups.map(dateGroup => (
            <div key={dateGroup} className="dob-date-group">
              <div className="dob-date-header">
                <h2 className="dob-date-title">{dateGroup}</h2>
                <span className="dob-date-count">
                  {groupedEntries[dateGroup].length} entries
                </span>
              </div>

              <div className="dob-entries-list">
                {groupedEntries[dateGroup].map(entry => (
                  <motion.div
                    key={entry.id}
                    className="dob-entry-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="dob-entry-header">
                      <div className="dob-entry-icon">
                        {getEventTypeIcon(entry.eventType)}
                      </div>
                      <div className="dob-entry-meta">
                        <div className="dob-entry-type-row">
                          <span className="dob-event-type">
                            {getEventTypeLabel(entry.eventType)}
                          </span>
                          {entry.isImmutable && (
                            <span className="dob-immutable-badge">🔒 Immutable</span>
                          )}
                        </div>
                        <span className="dob-entry-time">{formatTime(entry.timestamp)}</span>
                      </div>
                      <div className="dob-entry-badges">
                        <span className={`dob-type-badge ${entry.entryType}`}>
                          {entry.entryType === 'auto' ? 'Auto' : 'Manual'}
                        </span>
                      </div>
                    </div>

                    {entry.assignmentReference && (
                      <div className="dob-assignment-ref">
                        Assignment: {entry.assignmentReference}
                      </div>
                    )}

                    <div className="dob-entry-description">
                      {entry.description}
                    </div>

                    {entry.gpsCoordinates && (
                      <div className="dob-gps-info">
                        📍 GPS: {entry.gpsCoordinates.latitude.toFixed(6)},{' '}
                        {entry.gpsCoordinates.longitude.toFixed(6)}{' '}
                        (±{entry.gpsCoordinates.accuracy.toFixed(0)}m)
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Entry Form Modal */}
      {showEntryForm && cpoId && (
        <DOBEntryForm
          isOpen={showEntryForm}
          onClose={() => setShowEntryForm(false)}
          onSuccess={handleEntrySuccess}
          cpoId={cpoId}
        />
      )}
    </div>
  );
};

export default DailyOccurrenceBook;
