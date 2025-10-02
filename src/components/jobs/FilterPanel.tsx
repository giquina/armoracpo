import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaFilter, FaTimes, FaMapMarkerAlt, FaPoundSign, FaCalendar } from 'react-icons/fa';
import '../../styles/global.css';

export interface JobFilters {
  dateRange: { start: string; end: string } | null;
  locationRadius: number;
  rateRange: { min: number; max: number };
  assignmentTypes: string[];
  threatLevels: string[];
}

interface FilterPanelProps {
  filters: JobFilters;
  onFiltersChange: (filters: JobFilters) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ filters, onFiltersChange, isOpen, onToggle }) => {
  const [localFilters, setLocalFilters] = useState<JobFilters>(filters);

  const assignmentTypeOptions = [
    { value: 'close_protection', label: 'Close Protection' },
    { value: 'event_security', label: 'Event Security' },
    { value: 'residential_security', label: 'Residential Security' },
    { value: 'executive_protection', label: 'Executive Protection' },
    { value: 'transport_security', label: 'Transport Security' },
  ];

  const threatLevelOptions = [
    { value: 'low', label: 'Low', color: 'var(--armora-success)' },
    { value: 'medium', label: 'Medium', color: 'var(--armora-warning)' },
    { value: 'high', label: 'High', color: 'var(--armora-danger)' },
    { value: 'critical', label: 'Critical', color: 'var(--armora-danger)' },
  ];

  const handleApply = () => {
    onFiltersChange(localFilters);
    onToggle();
  };

  const handleReset = () => {
    const defaultFilters: JobFilters = {
      dateRange: null,
      locationRadius: 50,
      rateRange: { min: 0, max: 200 },
      assignmentTypes: [],
      threatLevels: [],
    };
    setLocalFilters(defaultFilters);
    onFiltersChange(defaultFilters);
  };

  const toggleAssignmentType = (type: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      assignmentTypes: prev.assignmentTypes.includes(type)
        ? prev.assignmentTypes.filter((t) => t !== type)
        : [...prev.assignmentTypes, type],
    }));
  };

  const toggleThreatLevel = (level: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      threatLevels: prev.threatLevels.includes(level)
        ? prev.threatLevels.filter((l) => l !== level)
        : [...prev.threatLevels, level],
    }));
  };

  return (
    <div>
      {/* Toggle Button */}
      <button
        className="btn btn-secondary"
        onClick={onToggle}
        style={{
          width: '100%',
          marginBottom: 'var(--armora-space-md)',
          justifyContent: 'space-between',
        }}
      >
        <div className="flex items-center gap-sm">
          <FaFilter size={14} />
          <span>Filters</span>
          {(filters.assignmentTypes.length > 0 || filters.threatLevels.length > 0) && (
            <span
              className="badge badge-gold"
              style={{
                fontSize: '10px',
                padding: '2px 6px',
              }}
            >
              {filters.assignmentTypes.length + filters.threatLevels.length}
            </span>
          )}
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {isOpen ? <FaTimes size={14} /> : <FaFilter size={14} />}
        </motion.div>
      </button>

      {/* Filter Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ overflow: 'hidden' }}
          >
            <div
              className="card"
              style={{
                marginBottom: 'var(--armora-space-md)',
              }}
            >
              {/* Location Radius */}
              <div style={{ marginBottom: 'var(--armora-space-lg)' }}>
                <div className="flex items-center gap-sm mb-sm">
                  <FaMapMarkerAlt color="var(--armora-danger)" size={14} />
                  <label className="font-semibold" style={{ margin: 0 }}>
                    Location Radius
                  </label>
                </div>
                <input
                  type="range"
                  min="5"
                  max="100"
                  step="5"
                  value={localFilters.locationRadius}
                  onChange={(e) =>
                    setLocalFilters((prev) => ({
                      ...prev,
                      locationRadius: parseInt(e.target.value),
                    }))
                  }
                  style={{
                    width: '100%',
                    marginBottom: 'var(--armora-space-sm)',
                  }}
                />
                <p className="text-sm text-secondary" style={{ margin: 0 }}>
                  Within {localFilters.locationRadius} km
                </p>
              </div>

              {/* Rate Range */}
              <div style={{ marginBottom: 'var(--armora-space-lg)' }}>
                <div className="flex items-center gap-sm mb-sm">
                  <FaPoundSign color="var(--armora-success)" size={14} />
                  <label className="font-semibold" style={{ margin: 0 }}>
                    Hourly Rate Range
                  </label>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--armora-space-sm)' }}>
                  <div>
                    <label className="text-xs text-secondary" style={{ display: 'block', marginBottom: '4px' }}>
                      Min
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="200"
                      value={localFilters.rateRange.min}
                      onChange={(e) =>
                        setLocalFilters((prev) => ({
                          ...prev,
                          rateRange: { ...prev.rateRange, min: parseInt(e.target.value) },
                        }))
                      }
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-secondary" style={{ display: 'block', marginBottom: '4px' }}>
                      Max
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="200"
                      value={localFilters.rateRange.max}
                      onChange={(e) =>
                        setLocalFilters((prev) => ({
                          ...prev,
                          rateRange: { ...prev.rateRange, max: parseInt(e.target.value) },
                        }))
                      }
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>
              </div>

              {/* Assignment Types */}
              <div style={{ marginBottom: 'var(--armora-space-lg)' }}>
                <div className="flex items-center gap-sm mb-sm">
                  <FaCalendar color="var(--armora-navy)" size={14} />
                  <label className="font-semibold" style={{ margin: 0 }}>
                    Assignment Type
                  </label>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--armora-space-sm)' }}>
                  {assignmentTypeOptions.map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center gap-sm"
                      style={{
                        padding: 'var(--armora-space-sm)',
                        backgroundColor: localFilters.assignmentTypes.includes(option.value)
                          ? 'rgba(212, 175, 55, 0.1)'
                          : 'var(--armora-bg-secondary)',
                        borderRadius: 'var(--armora-radius-md)',
                        cursor: 'pointer',
                        border: localFilters.assignmentTypes.includes(option.value)
                          ? '1px solid rgba(212, 175, 55, 0.3)'
                          : '1px solid transparent',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={localFilters.assignmentTypes.includes(option.value)}
                        onChange={() => toggleAssignmentType(option.value)}
                        style={{ cursor: 'pointer' }}
                      />
                      <span className="text-sm">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Threat Levels */}
              <div style={{ marginBottom: 'var(--armora-space-lg)' }}>
                <label className="font-semibold" style={{ display: 'block', marginBottom: 'var(--armora-space-sm)' }}>
                  Threat Level
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--armora-space-sm)' }}>
                  {threatLevelOptions.map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center gap-sm"
                      style={{
                        padding: 'var(--armora-space-sm)',
                        backgroundColor: localFilters.threatLevels.includes(option.value)
                          ? `${option.color}15`
                          : 'var(--armora-bg-secondary)',
                        borderRadius: 'var(--armora-radius-md)',
                        cursor: 'pointer',
                        border: localFilters.threatLevels.includes(option.value)
                          ? `1px solid ${option.color}30`
                          : '1px solid transparent',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={localFilters.threatLevels.includes(option.value)}
                        onChange={() => toggleThreatLevel(option.value)}
                        style={{ cursor: 'pointer' }}
                      />
                      <span className="text-sm">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--armora-space-sm)' }}>
                <button className="btn btn-secondary" onClick={handleReset}>
                  Reset
                </button>
                <button className="btn btn-primary" onClick={handleApply}>
                  Apply Filters
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FilterPanel;
