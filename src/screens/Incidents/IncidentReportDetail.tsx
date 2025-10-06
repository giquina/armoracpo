import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { IncidentReport } from '../../types';
import { incidentService } from '../../services/incidentService';
import { downloadIncidentReportPDF } from '../../services/incidentPDFService';
import { supabase } from '../../lib/supabase';
import './IncidentReportDetail.css';

const IncidentReportDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<IncidentReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadReport();

      // Subscribe to real-time updates
      const unsubscribe = incidentService.subscribeToIncidentReportUpdates(id, (updatedReport) => {
        setReport(updatedReport);
      });

      return () => unsubscribe();
    }
  }, [id]);

  const loadReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: cpoData } = await supabase
        .from('protection_officers')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (!cpoData) throw new Error('CPO profile not found');

      const reportData = await incidentService.getIncidentReport(id!, cpoData.id);
      setReport(reportData);
    } catch (err: any) {
      setError(err.message || 'Failed to load incident report');
      console.error('Error loading report:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    if (!report) return;

    setExporting(true);
    try {
      await downloadIncidentReportPDF(report);

      // Mark report as exported
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: cpoData } = await supabase
          .from('protection_officers')
          .select('id')
          .eq('auth_user_id', user.id)
          .single();

        if (cpoData) {
          await incidentService.markAsExported(report.id, cpoData.id);
        }
      }
    } catch (err: any) {
      console.error('Export error:', err);
      alert('Failed to export PDF');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="incident-detail-screen">
        <div className="safe-top" />
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading incident report...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="incident-detail-screen">
        <div className="safe-top" />
        <div className="error-state">
          <h2>Error Loading Report</h2>
          <p>{error || 'Report not found'}</p>
          <button className="btn-primary" onClick={() => navigate('/incidents')}>
            Back to Reports
          </button>
        </div>
      </div>
    );
  }

  const getSeverityColor = (severity: string): string => {
    const colors: Record<string, string> = {
      critical: '#991b1b',
      high: '#ef4444',
      medium: '#f59e0b',
      low: '#10b981',
      informational: '#3b82f6',
    };
    return colors[severity] || colors.medium;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatClassification = (classification: string): string => {
    return classification
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="incident-detail-screen">
      <div className="safe-top" />

      {/* Header */}
      <div className="detail-header">
        <button className="btn-back" onClick={() => navigate('/incidents')}>
          ← Back
        </button>
        <div className="header-content">
          <h1>{report.incidentNumber}</h1>
          <span className="severity-badge" style={{ backgroundColor: getSeverityColor(report.severity) }}>
            {report.severity.toUpperCase()}
          </span>
        </div>
        <div className="header-actions">
          <button
            className="btn-export"
            onClick={handleExportPDF}
            disabled={exporting}
          >
            {exporting ? 'Exporting...' : '📄 Export PDF'}
          </button>
          {report.status === 'draft' && (
            <button className="btn-edit" onClick={() => navigate(`/incidents/edit/${report.id}`)}>
              ✏️ Edit
            </button>
          )}
        </div>
      </div>

      <div className="detail-content">
        {/* Classification Section */}
        <section className="detail-section">
          <h2>Classification</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="label">Type</span>
              <span className="value">{formatClassification(report.classification)}</span>
            </div>
            <div className="info-item">
              <span className="label">Severity</span>
              <span className="value" style={{ color: getSeverityColor(report.severity) }}>
                {report.severity.toUpperCase()}
              </span>
            </div>
            <div className="info-item">
              <span className="label">Status</span>
              <span className="value">{formatClassification(report.status)}</span>
            </div>
            <div className="info-item">
              <span className="label">Review Required</span>
              <span className="value">{report.reviewRequired ? 'Yes' : 'No'}</span>
            </div>
          </div>
        </section>

        {/* Location & Time Section */}
        <section className="detail-section">
          <h2>Location & Time</h2>
          <div className="info-grid">
            <div className="info-item full-width">
              <span className="label">Incident Date/Time</span>
              <span className="value">{formatDate(report.incidentDateTime)}</span>
            </div>
            <div className="info-item full-width">
              <span className="label">Address</span>
              <span className="value">{report.location.address}</span>
            </div>
            <div className="info-item">
              <span className="label">City</span>
              <span className="value">{report.location.city}</span>
            </div>
            <div className="info-item">
              <span className="label">Postcode</span>
              <span className="value">{report.location.postcode || 'Not recorded'}</span>
            </div>
            {report.location.venue && (
              <div className="info-item full-width">
                <span className="label">Venue</span>
                <span className="value">{report.location.venue}</span>
              </div>
            )}
            <div className="info-item full-width">
              <span className="label">GPS Coordinates</span>
              <span className="value">
                {report.location.coordinates.latitude.toFixed(6)}, {report.location.coordinates.longitude.toFixed(6)}
                (±{report.location.coordinates.accuracy.toFixed(0)}m)
              </span>
            </div>
          </div>
        </section>

        {/* Reporting Officer Section */}
        <section className="detail-section">
          <h2>Reporting Officer</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="label">Name</span>
              <span className="value">{report.reportingOfficer.officerName}</span>
            </div>
            <div className="info-item">
              <span className="label">SIA License</span>
              <span className="value">{report.reportingOfficer.siaLicenseNumber}</span>
            </div>
            <div className="info-item">
              <span className="label">Phone</span>
              <span className="value">{report.reportingOfficer.officerPhone}</span>
            </div>
            <div className="info-item">
              <span className="label">Email</span>
              <span className="value">{report.reportingOfficer.officerEmail}</span>
            </div>
          </div>
        </section>

        {/* Description Section */}
        <section className="detail-section">
          <h2>Incident Description</h2>
          <div className="description-content">
            <div className="subsection">
              <h3>Summary</h3>
              <p>{report.description.summary}</p>
            </div>
            <div className="subsection">
              <h3>Detailed Narrative</h3>
              <p className="narrative">{report.description.detailedNarrative}</p>
            </div>
            {report.description.triggerFactors && (
              <div className="subsection">
                <h3>Trigger Factors</h3>
                <p>{report.description.triggerFactors}</p>
              </div>
            )}
            <div className="subsection">
              <h3>Outcome</h3>
              <p>{report.description.outcome}</p>
            </div>
          </div>
        </section>

        {/* Principal Details */}
        {report.principal && report.principal.injuryStatus !== 'none' && (
          <section className="detail-section">
            <h2>Principal Status</h2>
            <div className="info-grid">
              <div className="info-item">
                <span className="label">Injury Status</span>
                <span className="value">{report.principal.injuryStatus.toUpperCase()}</span>
              </div>
              <div className="info-item">
                <span className="label">Medical Attention Required</span>
                <span className="value">{report.principal.medicalAttentionRequired ? 'Yes' : 'No'}</span>
              </div>
              {report.principal.injuryDescription && (
                <div className="info-item full-width">
                  <span className="label">Injury Description</span>
                  <span className="value">{report.principal.injuryDescription}</span>
                </div>
              )}
              {report.principal.medicalAttentionDetails && (
                <div className="info-item full-width">
                  <span className="label">Medical Attention Details</span>
                  <span className="value">{report.principal.medicalAttentionDetails}</span>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Immediate Actions */}
        {report.immediateActions.length > 0 && (
          <section className="detail-section">
            <h2>Immediate Actions Taken</h2>
            <div className="actions-list">
              {report.immediateActions.map((action, index) => (
                <div key={action.id} className="action-card">
                  <div className="action-header">
                    <span className="action-number">#{index + 1}</span>
                    <span className="action-time">{new Date(action.timestamp).toLocaleTimeString('en-GB')}</span>
                  </div>
                  <div className="action-body">
                    <div className="action-field">
                      <strong>Action:</strong> {action.action}
                    </div>
                    {action.result && (
                      <div className="action-field">
                        <strong>Result:</strong> {action.result}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Witnesses */}
        {report.witnesses.length > 0 && (
          <section className="detail-section">
            <h2>Witness Statements</h2>
            <div className="witnesses-list">
              {report.witnesses.map((witness, index) => (
                <div key={witness.id} className="witness-card">
                  <h3>Witness {index + 1}: {witness.name}</h3>
                  <div className="witness-info">
                    <div><strong>Relationship:</strong> {formatClassification(witness.relationship)}</div>
                    {witness.contactPhone && <div><strong>Phone:</strong> {witness.contactPhone}</div>}
                    {witness.contactEmail && <div><strong>Email:</strong> {witness.contactEmail}</div>}
                    <div><strong>Willing to Testify:</strong> {witness.willingToTestify ? 'Yes' : 'No'}</div>
                  </div>
                  <div className="witness-statement">
                    <strong>Statement:</strong>
                    <p>{witness.statement}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Law Enforcement */}
        {report.lawEnforcement && report.lawEnforcement.reported && (
          <section className="detail-section">
            <h2>Law Enforcement Involvement</h2>
            <div className="info-grid">
              <div className="info-item">
                <span className="label">Police Force</span>
                <span className="value">{report.lawEnforcement.forceName || 'Not recorded'}</span>
              </div>
              <div className="info-item">
                <span className="label">Station</span>
                <span className="value">{report.lawEnforcement.stationName || 'Not recorded'}</span>
              </div>
              <div className="info-item">
                <span className="label">Officer Name</span>
                <span className="value">{report.lawEnforcement.officerName || 'Not recorded'}</span>
              </div>
              <div className="info-item">
                <span className="label">Crime Reference</span>
                <span className="value">{report.lawEnforcement.crimeReferenceNumber || 'Not recorded'}</span>
              </div>
              <div className="info-item">
                <span className="label">Arrests Made</span>
                <span className="value">{report.lawEnforcement.arrestsMade ? 'Yes' : 'No'}</span>
              </div>
              <div className="info-item">
                <span className="label">Follow-up Required</span>
                <span className="value">{report.lawEnforcement.followUpRequired ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </section>
        )}

        {/* Media Attachments */}
        {report.mediaAttachments.length > 0 && (
          <section className="detail-section">
            <h2>Media Evidence ({report.mediaAttachments.length})</h2>
            <div className="media-grid">
              {report.mediaAttachments.map((media) => (
                <div key={media.id} className="media-card">
                  <div className="media-type">{media.type.toUpperCase()}</div>
                  <div className="media-filename">{media.filename}</div>
                  <div className="media-meta">
                    <small>Captured: {formatDatemedia.metadata.capturedAt()}</small>
                    <small>GPS: {media.gpsCoordinates.latitude.toFixed(4)}, {media.gpsCoordinates.longitude.toFixed(4)}</small>
                  </div>
                  {media.description && <p className="media-description">{media.description}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Environmental Conditions */}
        <section className="detail-section">
          <h2>Environmental Conditions</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="label">Weather</span>
              <span className="value">{formatClassification(report.environmentalConditions.weather)}</span>
            </div>
            <div className="info-item">
              <span className="label">Visibility</span>
              <span className="value">{formatClassification(report.environmentalConditions.visibility)}</span>
            </div>
            <div className="info-item">
              <span className="label">Lighting</span>
              <span className="value">{formatClassification(report.environmentalConditions.lighting)}</span>
            </div>
            <div className="info-item">
              <span className="label">Crowd Level</span>
              <span className="value">{formatClassification(report.environmentalConditions.crowdLevel)}</span>
            </div>
          </div>
        </section>

        {/* Equipment */}
        {(report.equipmentUsed.length > 0 || report.equipmentFailures?.length) && (
          <section className="detail-section">
            <h2>Equipment</h2>
            {report.equipmentUsed.length > 0 && (
              <div className="subsection">
                <h3>Equipment Used</h3>
                <ul className="equipment-list">
                  {report.equipmentUsed.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
            {report.equipmentFailures && report.equipmentFailures.length > 0 && (
              <div className="subsection">
                <h3>Equipment Failures</h3>
                <ul className="equipment-list failures">
                  {report.equipmentFailures.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}

        {/* Lessons Learned */}
        {(report.lessonsLearned || report.protocolRecommendations) && (
          <section className="detail-section">
            <h2>Lessons Learned & Recommendations</h2>
            {report.lessonsLearned && (
              <div className="subsection">
                <h3>Lessons Learned</h3>
                <p>{report.lessonsLearned}</p>
              </div>
            )}
            {report.protocolRecommendations && (
              <div className="subsection">
                <h3>Protocol Recommendations</h3>
                <p>{report.protocolRecommendations}</p>
              </div>
            )}
          </section>
        )}

        {/* Audit Trail */}
        <section className="detail-section audit">
          <h2>Audit Trail</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="label">Created</span>
              <span className="value">{formatDate(report.createdAt)}</span>
            </div>
            <div className="info-item">
              <span className="label">Last Updated</span>
              <span className="value">{formatDate(report.updatedAt)}</span>
            </div>
            {report.submittedDateTime && (
              <div className="info-item">
                <span className="label">Submitted</span>
                <span className="value">{formatDate(report.submittedDateTime)}</span>
              </div>
            )}
            <div className="info-item">
              <span className="label">Data Classification</span>
              <span className="value">{report.dataClassification.toUpperCase()}</span>
            </div>
            <div className="info-item">
              <span className="label">Retention Period</span>
              <span className="value">{formatClassification(report.retentionPeriod)}</span>
            </div>
            <div className="info-item">
              <span className="label">Exported</span>
              <span className="value">{report.exported ? `Yes (${formatDate(report.exportedAt!)})` : 'No'}</span>
            </div>
          </div>
        </section>
      </div>

      <div className="safe-bottom" />
    </div>
  );
};

export default IncidentReportDetail;
