import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { IncidentReportSummary, IncidentSeverity } from '../../types';
import { incidentService } from '../../services/incidentService';
import './RecentIncidentsWidget.css';

interface RecentIncidentsWidgetProps {
  cpoId: string;
}

const RecentIncidentsWidget: React.FC<RecentIncidentsWidgetProps> = ({ cpoId }) => {
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState<IncidentReportSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRecentIncidents = useCallback(async () => {
    try {
      const reports = await incidentService.getIncidentReports(cpoId, {});
      setIncidents(reports.slice(0, 3)); // Show only 3 most recent
    } catch (error) {
      console.error('Error loading incidents:', error);
    } finally {
      setLoading(false);
    }
  }, [cpoId]);

  useEffect(() => {
    loadRecentIncidents();
  }, [loadRecentIncidents]);

  const getSeverityColor = (severity: IncidentSeverity): string => {
    const colors: Record<IncidentSeverity, string> = {
      critical: '#991b1b',
      high: '#ef4444',
      medium: '#f59e0b',
      low: '#10b981',
      informational: '#3b82f6',
    };
    return colors[severity];
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };

  if (loading) {
    return (
      <div className="recent-incidents-widget card">
        <div className="widget-header">
          <h3>Recent Incident Reports</h3>
        </div>
        <div className="loading-state">
          <div className="spinner spinner-sm"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="recent-incidents-widget card">
      <div className="widget-header">
        <h3>Recent Incident Reports</h3>
        <button
          className="btn-view-all"
          onClick={() => navigate('/incidents')}
        >
          View All
        </button>
      </div>

      {incidents.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">✓</div>
          <p className="empty-text">No incidents reported</p>
          <button
            className="btn-create-incident"
            onClick={() => navigate('/incidents/new')}
          >
            Create Report
          </button>
        </div>
      ) : (
        <>
          <div className="incidents-list">
            {incidents.map((incident) => (
              <div
                key={incident.id}
                className="incident-item"
                onClick={() => navigate(`/incidents/${incident.id}`)}
              >
                <div className="incident-left">
                  <div
                    className="severity-indicator"
                    style={{ backgroundColor: getSeverityColor(incident.severity) }}
                  />
                  <div className="incident-info">
                    <div className="incident-number">{incident.incidentNumber}</div>
                    <div className="incident-summary">{incident.summary}</div>
                    <div className="incident-meta">
                      {incident.location.city} • {formatDate(incident.incidentDateTime)}
                    </div>
                  </div>
                </div>
                <div className="incident-right">
                  {incident.requiresFollowUp && (
                    <span className="follow-up-badge" title="Requires follow-up">
                      ⚠️
                    </span>
                  )}
                  {incident.hasMediaAttachments && (
                    <span className="media-badge" title={`${incident.mediaCount} attachments`}>
                      📎
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="widget-footer">
            <button
              className="btn-create-incident-footer"
              onClick={() => navigate('/incidents/new')}
            >
              + New Incident Report
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default RecentIncidentsWidget;
