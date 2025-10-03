import React, { useState, useEffect } from 'react';
import { FiSearch, FiFilter, FiList, FiGrid, FiMap } from 'react-icons/fi';
import './JobsHeader.css';

interface JobsHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterCount: number;
  onFilterClick: () => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  viewMode: 'list' | 'grid' | 'map';
  onViewModeChange: (mode: 'list' | 'grid' | 'map') => void;
  resultCount: number;
}

const JobsHeader: React.FC<JobsHeaderProps> = ({
  searchQuery,
  onSearchChange,
  filterCount,
  onFilterClick,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  resultCount
}) => {
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(debouncedQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [debouncedQuery, onSearchChange]);

  return (
    <div className="jobs-header">
      {/* Search Bar */}
      <div className="jobs-search-bar">
        <FiSearch className="jobs-search-icon" />
        <input
          type="text"
          placeholder="Search jobs, locations, keywords..."
          value={debouncedQuery}
          onChange={(e) => setDebouncedQuery(e.target.value)}
          className="jobs-search-input"
        />
        {debouncedQuery && (
          <button
            className="jobs-search-clear"
            onClick={() => setDebouncedQuery('')}
          >
            &times;
          </button>
        )}
      </div>

      {/* Controls Row */}
      <div className="jobs-controls">
        {/* Filter Button */}
        <button className="jobs-filter-btn" onClick={onFilterClick}>
          <FiFilter />
          <span>Filters</span>
          {filterCount > 0 && (
            <span className="jobs-filter-badge">{filterCount}</span>
          )}
        </button>

        {/* Sort Dropdown */}
        <select
          className="jobs-sort-select"
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
        >
          <option value="relevant">Most Relevant</option>
          <option value="payHigh">Highest Pay</option>
          <option value="payLow">Lowest Pay</option>
          <option value="dateNew">Newest First</option>
          <option value="distance">Nearest First</option>
        </select>

        {/* View Toggle */}
        <div className="jobs-view-toggle">
          <button
            className={`jobs-view-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => onViewModeChange('list')}
            title="List View"
          >
            <FiList />
          </button>
          <button
            className={`jobs-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => onViewModeChange('grid')}
            title="Grid View"
          >
            <FiGrid />
          </button>
          <button
            className={`jobs-view-btn ${viewMode === 'map' ? 'active' : ''}`}
            onClick={() => onViewModeChange('map')}
            title="Map View"
          >
            <FiMap />
          </button>
        </div>

        {/* Result Count */}
        <div className="jobs-result-count">
          {resultCount} {resultCount === 1 ? 'job' : 'jobs'}
        </div>
      </div>
    </div>
  );
};

export default JobsHeader;
