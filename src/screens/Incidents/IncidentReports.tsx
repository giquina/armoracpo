import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IncidentReportSummary,
  IncidentReportFilters,
  IncidentClassification,
  IncidentSeverity,
  IncidentStatus,
  IncidentStatistics,
} from '../../types';
import { incidentService } from '../../services/incidentService';
import { downloadIncidentReportPDF } from '../../services/incidentPDFService';
import { supabase } from '../../lib/supabase';
import './IncidentReports.css';

const IncidentReports: React.FC = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState<IncidentReportSummary[]>([]);
  const [filteredReports, setFilteredReports] = useState<IncidentReportSummary[]>([]);
  const [statistics, setStatistics] = useState<IncidentStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<IncidentReportFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('No user found');
        return;
      }

      // Get CPO ID from protection_officers table
      const { data: cpoData } = await supabase
        .from('protection_officers')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (!cpoData) {
        console.error('CPO profile not found');
        return;
      }

      // Fetch incident reports using service
      const reportsData = await incidentService.getIncidentReports(cpoData.id, filters);

      setReports(reportsData);
      setFilteredReports(reportsData);

      // Calculate statistics from reports
      const stats: IncidentStatistics = {
        totalIncidents: reportsData.length,
        incidentsByClassification: reportsData.reduce((acc, report) => {
          acc[report.classification] = (acc[report.classification] || 0) + 1;
          return acc;
        }, {} as Record<IncidentClassification, number>),
        incidentsBySeverity: reportsData.reduce((acc, report) => {
          acc[report.severity] = (acc[report.severity] || 0) + 1;
          return acc;
        }, {} as Record<IncidentSeverity, number>),
        incidentsByStatus: reportsData.reduce((acc, report) => {
          acc[report.status] = (acc[report.status] || 0) + 1;
          return acc;
        }, {} as Record<IncidentStatus, number>),
        recentIncidents: reportsData.slice(0, 5),
        pendingFollowUps: reportsData.filter(r => r.requiresFollowUp).length,
        averageResolutionTime: 0, // TODO: Calculate from resolved incidents
        incidentTrends: [],
      };

      setStatistics(stats);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters and search
  useEffect(() => {
    let filtered = [...reports];

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (report) =>
          report.incidentNumber.toLowerCase().includes(query) ||
          report.summary.toLowerCase().includes(query) ||
          report.location.address.toLowerCase().includes(query) ||
          report.location.city.toLowerCase().includes(query) ||
          report.reportingOfficer.officerName.toLowerCase().includes(query)
      );
    }

    // Apply filters
    if (filters.classifications && filters.classifications.length > 0) {
      filtered = filtered.filter((report) =>
        filters.classifications!.includes(report.classification)
      );
    }

    if (filters.severities && filters.severities.length > 0) {
      filtered = filtered.filter((report) => filters.severities!.includes(report.severity));
    }

    if (filters.statuses && filters.statuses.length > 0) {
      filtered = filtered.filter((report) => filters.statuses!.includes(report.status));
    }

    if (filters.requiresFollowUp !== undefined) {
      filtered = filtered.filter((report) => report.requiresFollowUp === filters.requiresFollowUp);
    }

    if (filters.hasMediaAttachments !== undefined) {
      filtered = filtered.filter(
        (report) => report.hasMediaAttachments === filters.hasMediaAttachments
      );
    }

    if (filters.dateRange) {
      filtered = filtered.filter((report) => {
        const incidentDate = new Date(report.incidentDateTime);
        const start = new Date(filters.dateRange!.start);
        const end = new Date(filters.dateRange!.end);
        return incidentDate >= start && incidentDate <= end;
      });
    }

    setFilteredReports(filtered);
  }, [searchQuery, filters, reports]);

  const getSeverityColor = (severity: IncidentSeverity): string => {
    switch (severity) {
      case 'critical':
        return '#991b1b';
      case 'high':
        return '#ef4444';
      case 'medium':
        return '#f59e0b';
      case 'low':
        return '#10b981';
      case 'informational':
        return '#3b82f6';
    }
  };

  const getStatusColor = (status: IncidentStatus): string => {
    switch (status) {
      case 'draft':
        return '#6b7280';
      case 'submitted':
        return '#3b82f6';
      case 'under_review':
        return '#8b5cf6';
      case 'investigated':
        return '#f59e0b';
      case 'resolved':
        return '#10b981';
      case 'escalated':
        return '#ef4444';
      case 'closed':
        return '#374151';
    }
  };

  const getClassificationIcon = (classification: IncidentClassification): string => {
    switch (classification) {
      case 'security_breach':
        return '🚨';
      case 'threat_verbal':
        return '🗣️';
      case 'threat_physical':
        return '⚠️';
      case 'suspicious_activity':
        return '👁️';
      case 'medical_emergency':
        return '🏥';
      case 'accident':
        return '🚗';
      case 'equipment_failure':
        return '🔧';
      case 'protocol_deviation':
        return '📋';
      case 'environmental':
        return '🌧️';
      case 'lost_property':
        return '👜';
      case 'privacy_breach':
        return '📸';
      case 'communication_failure':
        return '📞';
      case 'other':
        return '📄';
    }
  };

  const formatClassification = (classification: IncidentClassification): string => {
    return classification
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="incident-reports-screen">
      <div className="safe-top" />

      {/* Header */}
      <div className="reports-header">
        <div className="header-content">
          <h1 className="header-title">Incident Reports</h1>
          <p className="header-subtitle">Document and track security incidents</p>
        </div>
        <button className="btn-create" onClick={() => navigate('/incidents/new')}>
          + New Report
        </button>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="statistics-cards">
          <div className="stat-card">
            <div className="stat-value">{statistics.totalIncidents}</div>
            <div className="stat-label">Total Reports</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{statistics.pendingFollowUps}</div>
            <div className="stat-label">Pending Follow-ups</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{statistics.averageResolutionTime}h</div>
            <div className="stat-label">Avg Resolution Time</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              {statistics.incidentsBySeverity.high + statistics.incidentsBySeverity.critical}
            </div>
            <div className="stat-label">High Priority</div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="search-filters-section">
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by incident number, location, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <button
          className="btn-filter"
          onClick={() => setShowFilters(!showFilters)}
        >
          <span className="filter-icon">⚙️</span>
          Filters
          {(filters.classifications?.length || 0) +
            (filters.severities?.length || 0) +
            (filters.statuses?.length || 0) >
            0 && (
            <span className="filter-count">
              {(filters.classifications?.length || 0) +
                (filters.severities?.length || 0) +
                (filters.statuses?.length || 0)}
            </span>
          )}
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="filters-panel">
          <div className="filter-group">
            <h4 className="filter-title">Severity</h4>
            <div className="filter-options">
              {(['critical', 'high', 'medium', 'low'] as IncidentSeverity[]).map((severity) => (
                <label key={severity} className="filter-checkbox">
                  <input
                    type="checkbox"
                    checked={filters.severities?.includes(severity) || false}
                    onChange={(e) => {
                      const current = filters.severities || [];
                      setFilters({
                        ...filters,
                        severities: e.target.checked
                          ? [...current, severity]
                          : current.filter((s) => s !== severity),
                      });
                    }}
                  />
                  <span
                    className="severity-badge"
                    style={{ backgroundColor: getSeverityColor(severity) }}
                  >
                    {severity.toUpperCase()}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <h4 className="filter-title">Status</h4>
            <div className="filter-options">
              {(['submitted', 'under_review', 'resolved'] as IncidentStatus[]).map((status) => (
                <label key={status} className="filter-checkbox">
                  <input
                    type="checkbox"
                    checked={filters.statuses?.includes(status) || false}
                    onChange={(e) => {
                      const current = filters.statuses || [];
                      setFilters({
                        ...filters,
                        statuses: e.target.checked
                          ? [...current, status]
                          : current.filter((s) => s !== status),
                      });
                    }}
                  />
                  <span className="filter-label">{formatClassification(status as any)}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="filter-actions">
            <button
              className="btn-clear-filters"
              onClick={() => {
                setFilters({});
                setSearchQuery('');
              }}
            >
              Clear All
            </button>
          </div>
        </div>
      )}

      {/* Reports List */}
      <div className="reports-list">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading incident reports...</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3 className="empty-title">No Reports Found</h3>
            <p className="empty-text">
              {searchQuery || Object.keys(filters).length > 0
                ? 'Try adjusting your search or filters'
                : 'Create your first incident report to get started'}
            </p>
            <button className="btn-create-empty" onClick={() => navigate('/incidents/new')}>
              Create First Report
            </button>
          </div>
        ) : (
          <div className="reports-grid">
            {filteredReports.map((report) => (
              <div
                key={report.id}
                className="report-card"
                onClick={() => navigate(`/incidents/${report.id}`)}
              >
                <div className="report-header">
                  <div className="report-classification">
                    <span className="classification-icon">
                      {getClassificationIcon(report.classification)}
                    </span>
                    <span className="classification-text">
                      {formatClassification(report.classification)}
                    </span>
                  </div>
                  <span
                    className="severity-badge"
                    style={{ backgroundColor: getSeverityColor(report.severity) }}
                  >
                    {report.severity.toUpperCase()}
                  </span>
                </div>

                <div className="report-content">
                  <h3 className="report-number">{report.incidentNumber}</h3>
                  <p className="report-summary">{report.summary}</p>

                  <div className="report-meta">
                    <div className="meta-item">
                      <span className="meta-icon">📍</span>
                      <span className="meta-text">{report.location.city}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-icon">👤</span>
                      <span className="meta-text">{report.reportingOfficer.officerName}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-icon">📅</span>
                      <span className="meta-text">{formatDate(report.incidentDateTime)}</span>
                    </div>
                  </div>
                </div>

                <div className="report-footer">
                  <span
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(report.status) }}
                  >
                    {formatClassification(report.status as any)}
                  </span>

                  <div className="report-indicators">
                    {report.hasMediaAttachments && (
                      <span className="indicator" title={`${report.mediaCount} attachments`}>
                        📎 {report.mediaCount}
                      </span>
                    )}
                    {report.requiresFollowUp && (
                      <span className="indicator indicator-warning" title="Requires follow-up">
                        ⚠️
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="safe-bottom" />
    </div>
  );
};

export default IncidentReports;
