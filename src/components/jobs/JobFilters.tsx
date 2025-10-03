import React from 'react';
import { FiX, FiMapPin } from 'react-icons/fi';
import { motion } from 'framer-motion';
import './JobFilters.css';

interface JobFiltersProps {
  filters: {
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
  };
  onFiltersChange: (filters: any) => void;
  onClose: () => void;
}

const JobFilters: React.FC<JobFiltersProps> = ({
  filters,
  onFiltersChange,
  onClose
}) => {
  const durations = ['One-off', 'Short-term', 'Long-term', 'Ongoing'];
  const jobTypes = ['Residential', 'Event', 'Executive', 'Transport', 'Close Protection', 'Other'];
  const riskLevels = ['Low', 'Medium', 'High'];
  const clientTypes = ['Individual', 'Corporate', 'Celebrity', 'Government'];
  const requirements = ['SIA CP License', 'SIA Door Supervisor', 'Driving', 'Armed', 'First Aid', 'Languages', 'SC Clearance'];

  const toggleArrayItem = (array: string[], item: string) => {
    return array.includes(item)
      ? array.filter(i => i !== item)
      : [...array, item];
  };

  const clearAllFilters = () => {
    onFiltersChange({
      ...filters,
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
  };

  const activeFilterCount =
    filters.duration.length +
    filters.jobTypes.length +
    filters.riskLevel.length +
    filters.clientType.length +
    filters.requirements.length +
    (filters.payMin > 0 || filters.payMax < 1000 ? 1 : 0);

  return (
    <motion.div
      className="job-filters"
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -300, opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="job-filters-header">
        <h3>Filters</h3>
        <button className="job-filters-close" onClick={onClose}>
          <FiX />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="job-filters-content">
        {/* Location */}
        <div className="filter-section">
          <label className="filter-label">Location</label>
          <div className="filter-location-input">
            <FiMapPin className="filter-location-icon" />
            <input
              type="text"
              placeholder="Enter postcode or city"
              value={filters.location}
              onChange={(e) =>
                onFiltersChange({ ...filters, location: e.target.value })
              }
              className="filter-input"
            />
          </div>
        </div>

        {/* Radius */}
        <div className="filter-section">
          <label className="filter-label">
            Radius: {filters.radius} miles
          </label>
          <input
            type="range"
            min="5"
            max="200"
            step="5"
            value={filters.radius}
            onChange={(e) =>
              onFiltersChange({ ...filters, radius: parseInt(e.target.value) })
            }
            className="filter-range"
          />
          <div className="filter-range-labels">
            <span>5 mi</span>
            <span>200 mi</span>
          </div>
        </div>

        {/* Pay Range */}
        <div className="filter-section">
          <label className="filter-label">Pay Rate (per day)</label>
          <div className="filter-pay-inputs">
            <div className="filter-pay-input-wrapper">
              <span className="filter-pay-prefix">£</span>
              <input
                type="number"
                placeholder="Min"
                value={filters.payMin || ''}
                onChange={(e) =>
                  onFiltersChange({ ...filters, payMin: parseInt(e.target.value) || 0 })
                }
                className="filter-input filter-pay-input"
              />
            </div>
            <span className="filter-pay-separator">-</span>
            <div className="filter-pay-input-wrapper">
              <span className="filter-pay-prefix">£</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.payMax === 1000 ? '' : filters.payMax}
                onChange={(e) =>
                  onFiltersChange({ ...filters, payMax: parseInt(e.target.value) || 1000 })
                }
                className="filter-input filter-pay-input"
              />
            </div>
          </div>
        </div>

        {/* Date Range */}
        <div className="filter-section">
          <label className="filter-label">Date Range</label>
          <div className="filter-date-inputs">
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) =>
                onFiltersChange({ ...filters, dateFrom: e.target.value })
              }
              className="filter-input"
            />
            <span className="filter-date-separator">to</span>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) =>
                onFiltersChange({ ...filters, dateTo: e.target.value })
              }
              className="filter-input"
            />
          </div>
        </div>

        {/* Duration */}
        <div className="filter-section">
          <label className="filter-label">Duration</label>
          <div className="filter-chips">
            {durations.map(duration => (
              <button
                key={duration}
                className={`filter-chip ${
                  filters.duration.includes(duration) ? 'active' : ''
                }`}
                onClick={() =>
                  onFiltersChange({
                    ...filters,
                    duration: toggleArrayItem(filters.duration, duration)
                  })
                }
              >
                {duration}
              </button>
            ))}
          </div>
        </div>

        {/* Job Types */}
        <div className="filter-section">
          <label className="filter-label">Job Type</label>
          <div className="filter-chips">
            {jobTypes.map(type => (
              <button
                key={type}
                className={`filter-chip ${
                  filters.jobTypes.includes(type) ? 'active' : ''
                }`}
                onClick={() =>
                  onFiltersChange({
                    ...filters,
                    jobTypes: toggleArrayItem(filters.jobTypes, type)
                  })
                }
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Risk Level */}
        <div className="filter-section">
          <label className="filter-label">Risk Level</label>
          <div className="filter-chips">
            {riskLevels.map(level => (
              <button
                key={level}
                className={`filter-chip ${
                  filters.riskLevel.includes(level) ? 'active' : ''
                }`}
                onClick={() =>
                  onFiltersChange({
                    ...filters,
                    riskLevel: toggleArrayItem(filters.riskLevel, level)
                  })
                }
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Client Type */}
        <div className="filter-section">
          <label className="filter-label">Client Type</label>
          <div className="filter-chips">
            {clientTypes.map(type => (
              <button
                key={type}
                className={`filter-chip ${
                  filters.clientType.includes(type) ? 'active' : ''
                }`}
                onClick={() =>
                  onFiltersChange({
                    ...filters,
                    clientType: toggleArrayItem(filters.clientType, type)
                  })
                }
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Requirements */}
        <div className="filter-section">
          <label className="filter-label">Requirements</label>
          <div className="filter-chips">
            {requirements.map(req => (
              <button
                key={req}
                className={`filter-chip ${
                  filters.requirements.includes(req) ? 'active' : ''
                }`}
                onClick={() =>
                  onFiltersChange({
                    ...filters,
                    requirements: toggleArrayItem(filters.requirements, req)
                  })
                }
              >
                {req}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="job-filters-footer">
        <button className="filter-clear-btn" onClick={clearAllFilters}>
          Clear All
          {activeFilterCount > 0 && ` (${activeFilterCount})`}
        </button>
        <button className="filter-apply-btn" onClick={onClose}>
          Apply Filters
        </button>
      </div>
    </motion.div>
  );
};

export default JobFilters;
