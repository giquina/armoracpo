import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IncidentReport,
  IncidentClassification,
  IncidentSeverity,
  IncidentWitness,
  IncidentImmediateAction,
  IncidentEnvironmentalConditions,
  IncidentLawEnforcementDetails,
} from '../../types';
import './IncidentReportForm.css';

interface IncidentReportFormProps {
  assignmentId?: string;
  assignmentReference?: string;
  onSubmit: (report: IncidentReport) => Promise<void>;
  onSaveDraft: (report: Partial<IncidentReport>) => Promise<void>;
  existingReport?: Partial<IncidentReport>;
}

export const IncidentReportForm: React.FC<IncidentReportFormProps> = ({
  assignmentId,
  assignmentReference,
  onSubmit,
  onSaveDraft,
  existingReport,
}) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoSaving, setAutoSaving] = useState(false);

  // Core incident data
  const [classification, setClassification] = useState<IncidentClassification>(
    existingReport?.classification || 'other'
  );
  const [severity, setSeverity] = useState<IncidentSeverity>(
    existingReport?.severity || 'medium'
  );
  const [incidentDateTime, setIncidentDateTime] = useState(
    existingReport?.incidentDateTime || new Date().toISOString().slice(0, 16)
  );

  // Location data
  const [address, setAddress] = useState(existingReport?.location?.address || '');
  const [city, setCity] = useState(existingReport?.location?.city || '');
  const [postcode, setPostcode] = useState(existingReport?.location?.postcode || '');
  const [venue, setVenue] = useState(existingReport?.location?.venue || '');
  const [venueType, setVenueType] = useState(existingReport?.location?.venueType || '');
  const [coordinates, setCoordinates] = useState(
    existingReport?.location?.coordinates || { latitude: 0, longitude: 0, accuracy: 0 }
  );

  // Description
  const [summary, setSummary] = useState(existingReport?.description?.summary || '');
  const [detailedNarrative, setDetailedNarrative] = useState(
    existingReport?.description?.detailedNarrative || ''
  );
  const [triggerFactors, setTriggerFactors] = useState(
    existingReport?.description?.triggerFactors || ''
  );
  const [outcome, setOutcome] = useState(existingReport?.description?.outcome || '');

  // Principal details
  const [principalInjuryStatus, setPrincipalInjuryStatus] = useState<
    'none' | 'minor' | 'moderate' | 'severe' | 'critical'
  >(existingReport?.principal?.injuryStatus || 'none');
  const [principalInjuryDescription, setPrincipalInjuryDescription] = useState(
    existingReport?.principal?.injuryDescription || ''
  );
  const [medicalAttentionRequired, setMedicalAttentionRequired] = useState(
    existingReport?.principal?.medicalAttentionRequired || false
  );
  const [medicalAttentionDetails, setMedicalAttentionDetails] = useState(
    existingReport?.principal?.medicalAttentionDetails || ''
  );

  // Environmental conditions
  const [environmentalConditions, setEnvironmentalConditions] =
    useState<IncidentEnvironmentalConditions>(
      existingReport?.environmentalConditions || {
        weather: 'clear',
        visibility: 'good',
        lighting: 'daylight',
        crowdLevel: 'light',
        noiseLevel: 'normal',
      }
    );

  // Immediate actions
  const [immediateActions, setImmediateActions] = useState<IncidentImmediateAction[]>(
    existingReport?.immediateActions || []
  );

  // Witnesses
  const [witnesses, setWitnesses] = useState<IncidentWitness[]>(
    existingReport?.witnesses || []
  );

  // Law enforcement
  const [lawEnforcementReported, setLawEnforcementReported] = useState(
    existingReport?.lawEnforcement?.reported || false
  );
  const [lawEnforcementDetails, setLawEnforcementDetails] =
    useState<Partial<IncidentLawEnforcementDetails>>(existingReport?.lawEnforcement || {});

  // Equipment
  const [equipmentUsed, setEquipmentUsed] = useState<string[]>(
    existingReport?.equipmentUsed || []
  );
  const [equipmentFailures, setEquipmentFailures] = useState<string[]>(
    existingReport?.equipmentFailures || []
  );

  // Lessons learned
  const [lessonsLearned, setLessonsLearned] = useState(
    existingReport?.lessonsLearned || ''
  );
  const [protocolRecommendations, setProtocolRecommendations] = useState(
    existingReport?.protocolRecommendations || ''
  );

  // Get current location
  useEffect(() => {
    if ('geolocation' in navigator && coordinates.latitude === 0) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoordinates({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, [coordinates.latitude]);

  const handleSaveDraft = useCallback(async () => {
    if (!summary) return; // Don't save empty drafts

    setAutoSaving(true);
    try {
      const draftReport: Partial<IncidentReport> = {
        classification,
        severity,
        status: 'draft',
        incidentDateTime,
        location: { address, city, postcode, coordinates, venue, venueType },
        description: { summary, detailedNarrative, triggerFactors, outcome },
        principal: {
          principalId: '',
          injuryStatus: principalInjuryStatus,
          injuryDescription: principalInjuryDescription,
          medicalAttentionRequired,
          medicalAttentionDetails,
        },
        environmentalConditions,
        immediateActions,
        witnesses,
        lawEnforcement: lawEnforcementReported
          ? { ...lawEnforcementDetails, reported: true, arrestsMade: false, evidenceCollected: [], followUpRequired: false }
          : undefined,
        equipmentUsed,
        equipmentFailures,
        lessonsLearned,
        protocolRecommendations,
      };

      await onSaveDraft(draftReport);
    } catch (err) {
      console.error('Auto-save failed:', err);
    } finally {
      setAutoSaving(false);
    }
  }, [
    summary,
    classification,
    severity,
    incidentDateTime,
    address,
    city,
    postcode,
    coordinates,
    venue,
    venueType,
    detailedNarrative,
    triggerFactors,
    outcome,
    principalInjuryStatus,
    principalInjuryDescription,
    medicalAttentionRequired,
    medicalAttentionDetails,
    environmentalConditions,
    immediateActions,
    witnesses,
    lawEnforcementReported,
    lawEnforcementDetails,
    equipmentUsed,
    equipmentFailures,
    lessonsLearned,
    protocolRecommendations,
    onSaveDraft,
  ]);

  // Auto-save draft every 30 seconds
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      handleSaveDraft();
    }, 30000);

    return () => clearInterval(autoSaveInterval);
  }, [handleSaveDraft]);

  const addImmediateAction = () => {
    const newAction: IncidentImmediateAction = {
      id: `action-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: '',
      result: '',
      performedBy: '', // Will be filled with CPO ID on submit
    };
    setImmediateActions([...immediateActions, newAction]);
  };

  const updateImmediateAction = (
    index: number,
    field: keyof IncidentImmediateAction,
    value: string
  ) => {
    const updated = [...immediateActions];
    updated[index] = { ...updated[index], [field]: value };
    setImmediateActions(updated);
  };

  const removeImmediateAction = (index: number) => {
    setImmediateActions(immediateActions.filter((_, i) => i !== index));
  };

  const addWitness = () => {
    const newWitness: IncidentWitness = {
      id: `witness-${Date.now()}`,
      name: '',
      relationship: 'bystander',
      statement: '',
      willingToTestify: false,
    };
    setWitnesses([...witnesses, newWitness]);
  };

  const updateWitness = (index: number, field: keyof IncidentWitness, value: any) => {
    const updated = [...witnesses];
    updated[index] = { ...updated[index], [field]: value };
    setWitnesses(updated);
  };

  const removeWitness = (index: number) => {
    setWitnesses(witnesses.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validation
      if (!summary) {
        throw new Error('Incident summary is required');
      }
      if (!detailedNarrative) {
        throw new Error('Detailed narrative is required');
      }
      if (!address) {
        throw new Error('Incident location is required');
      }

      const report: IncidentReport = {
        id: existingReport?.id || `incident-${Date.now()}`,
        incidentNumber: existingReport?.incidentNumber || `IR-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
        assignmentId,
        assignmentReference,
        classification,
        severity,
        status: 'submitted',
        incidentDateTime,
        reportedDateTime: existingReport?.reportedDateTime || new Date().toISOString(),
        submittedDateTime: new Date().toISOString(),
        location: {
          address,
          city,
          postcode,
          coordinates,
          venue,
          venueType,
        },
        reportingOfficer: {
          officerId: '', // Will be filled by service
          officerName: '', // Will be filled by service
          siaLicenseNumber: '', // Will be filled by service
          officerPhone: '',
          officerEmail: '',
        },
        principal: principalInjuryStatus !== 'none' ? {
          principalId: '',
          injuryStatus: principalInjuryStatus,
          injuryDescription: principalInjuryDescription,
          medicalAttentionRequired,
          medicalAttentionDetails,
        } : undefined,
        description: {
          summary,
          detailedNarrative,
          triggerFactors,
          outcome,
        },
        witnesses,
        environmentalConditions,
        immediateActions,
        communicationsLog: [],
        equipmentUsed,
        equipmentFailures,
        lawEnforcement: lawEnforcementReported
          ? {
              reported: true,
              arrestsMade: false,
              evidenceCollected: [],
              followUpRequired: false,
              ...lawEnforcementDetails,
            }
          : undefined,
        mediaAttachments: [],
        additionalEvidence: [],
        signatures: [],
        followUpActions: [],
        reviewRequired: severity === 'critical' || severity === 'high',
        managementNotified: severity === 'critical',
        managementNotifiedAt: severity === 'critical' ? new Date().toISOString() : undefined,
        lessonsLearned,
        protocolRecommendations,
        trainingRecommendations: '',
        createdAt: existingReport?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: '', // Will be filled by service
        lastModifiedBy: '',
        submittedBy: '',
        dataClassification: severity === 'critical' ? 'confidential' : 'internal',
        retentionPeriod: severity === 'critical' || severity === 'high' ? 'extended' : 'standard',
        gdprConsent: {
          principalConsent: false,
          witnessConsent: witnesses.map(() => false),
          consentObtainedAt: new Date().toISOString(),
        },
        exported: false,
      };

      await onSubmit(report);
      navigate('/incidents');
    } catch (err: any) {
      setError(err.message || 'Failed to submit incident report');
    } finally {
      setLoading(false);
    }
  };

  const classificationOptions: { value: IncidentClassification; label: string; icon: string }[] = [
    { value: 'security_breach', label: 'Security Breach', icon: '🚨' },
    { value: 'threat_verbal', label: 'Verbal Threat', icon: '💬' },
    { value: 'threat_physical', label: 'Physical Threat', icon: '⚔️' },
    { value: 'suspicious_activity', label: 'Suspicious Activity', icon: '👀' },
    { value: 'medical_emergency', label: 'Medical Emergency', icon: '🚑' },
    { value: 'accident', label: 'Accident', icon: '⚠️' },
    { value: 'equipment_failure', label: 'Equipment Failure', icon: '🔧' },
    { value: 'protocol_deviation', label: 'Protocol Deviation', icon: '📋' },
    { value: 'environmental', label: 'Environmental', icon: '🌪️' },
    { value: 'lost_property', label: 'Lost Property', icon: '🎒' },
    { value: 'privacy_breach', label: 'Privacy Breach', icon: '📸' },
    { value: 'communication_failure', label: 'Communication Failure', icon: '📡' },
    { value: 'other', label: 'Other', icon: '📝' },
  ];

  const totalSteps = 6;

  const renderStepIndicator = () => (
    <div className="incident-form-steps">
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
        <div
          key={step}
          className={`step-indicator ${currentStep === step ? 'active' : ''} ${
            currentStep > step ? 'completed' : ''
          }`}
          onClick={() => setCurrentStep(step)}
        >
          <div className="step-number">{currentStep > step ? '✓' : step}</div>
          <div className="step-label">
            {step === 1 && 'Classification'}
            {step === 2 && 'Location & Time'}
            {step === 3 && 'Description'}
            {step === 4 && 'Actions Taken'}
            {step === 5 && 'Witnesses & Evidence'}
            {step === 6 && 'Review & Submit'}
          </div>
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="form-step">
      <h2>Incident Classification</h2>
      <p className="step-description">
        Select the type of incident and assess its severity. This will determine the review
        process and notification requirements.
      </p>

      <div className="form-group">
        <label>Incident Type *</label>
        <div className="classification-grid">
          {classificationOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`classification-option ${
                classification === option.value ? 'selected' : ''
              }`}
              onClick={() => setClassification(option.value)}
            >
              <span className="classification-icon">{option.icon}</span>
              <span className="classification-label">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label>Severity Level *</label>
        <div className="severity-options">
          <button
            type="button"
            className={`severity-option critical ${severity === 'critical' ? 'selected' : ''}`}
            onClick={() => setSeverity('critical')}
          >
            <span className="severity-icon">🔴</span>
            <span className="severity-label">Critical</span>
            <span className="severity-desc">Immediate threat to life</span>
          </button>
          <button
            type="button"
            className={`severity-option high ${severity === 'high' ? 'selected' : ''}`}
            onClick={() => setSeverity('high')}
          >
            <span className="severity-icon">🟠</span>
            <span className="severity-label">High</span>
            <span className="severity-desc">Significant threat</span>
          </button>
          <button
            type="button"
            className={`severity-option medium ${severity === 'medium' ? 'selected' : ''}`}
            onClick={() => setSeverity('medium')}
          >
            <span className="severity-icon">🟡</span>
            <span className="severity-label">Medium</span>
            <span className="severity-desc">Moderate concern</span>
          </button>
          <button
            type="button"
            className={`severity-option low ${severity === 'low' ? 'selected' : ''}`}
            onClick={() => setSeverity('low')}
          >
            <span className="severity-icon">🟢</span>
            <span className="severity-label">Low</span>
            <span className="severity-desc">Minor incident</span>
          </button>
          <button
            type="button"
            className={`severity-option informational ${
              severity === 'informational' ? 'selected' : ''
            }`}
            onClick={() => setSeverity('informational')}
          >
            <span className="severity-icon">🔵</span>
            <span className="severity-label">Informational</span>
            <span className="severity-desc">Awareness only</span>
          </button>
        </div>
      </div>

      {(severity === 'critical' || severity === 'high') && (
        <div className="alert alert-warning">
          <strong>⚠️ High Priority Incident</strong>
          <p>
            This incident will be immediately escalated to management and may require law
            enforcement notification.
          </p>
        </div>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="form-step">
      <h2>Location & Time</h2>
      <p className="step-description">
        Provide accurate location and time information. GPS coordinates will be captured
        automatically.
      </p>

      <div className="form-group">
        <label>Incident Date & Time *</label>
        <input
          type="datetime-local"
          value={incidentDateTime}
          onChange={(e) => setIncidentDateTime(e.target.value)}
          max={new Date().toISOString().slice(0, 16)}
          required
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Address *</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Street address"
            required
          />
        </div>
        <div className="form-group">
          <label>City *</label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="City"
            required
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Postcode</label>
          <input
            type="text"
            value={postcode}
            onChange={(e) => setPostcode(e.target.value)}
            placeholder="SW1A 1AA"
          />
        </div>
        <div className="form-group">
          <label>Venue Name</label>
          <input
            type="text"
            value={venue}
            onChange={(e) => setVenue(e.target.value)}
            placeholder="e.g., Heathrow Terminal 5"
          />
        </div>
      </div>

      <div className="form-group">
        <label>Venue Type</label>
        <select value={venueType} onChange={(e) => setVenueType(e.target.value)}>
          <option value="">Select venue type</option>
          <option value="airport">Airport</option>
          <option value="hotel">Hotel</option>
          <option value="restaurant">Restaurant</option>
          <option value="residence">Private Residence</option>
          <option value="office">Office Building</option>
          <option value="public_space">Public Space</option>
          <option value="vehicle">In Vehicle</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div className="gps-info">
        <strong>📍 GPS Coordinates:</strong>
        {coordinates.latitude !== 0 ? (
          <span>
            {coordinates.latitude.toFixed(6)}, {coordinates.longitude.toFixed(6)} (±
            {coordinates.accuracy.toFixed(0)}m)
          </span>
        ) : (
          <span className="text-warning">Acquiring location...</span>
        )}
      </div>

      <div className="form-group">
        <h3>Environmental Conditions</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Weather</label>
            <select
              value={environmentalConditions.weather}
              onChange={(e) =>
                setEnvironmentalConditions({
                  ...environmentalConditions,
                  weather: e.target.value as any,
                })
              }
            >
              <option value="clear">Clear</option>
              <option value="rain">Rain</option>
              <option value="snow">Snow</option>
              <option value="fog">Fog</option>
              <option value="wind">Windy</option>
              <option value="storm">Storm</option>
            </select>
          </div>
          <div className="form-group">
            <label>Visibility</label>
            <select
              value={environmentalConditions.visibility}
              onChange={(e) =>
                setEnvironmentalConditions({
                  ...environmentalConditions,
                  visibility: e.target.value as any,
                })
              }
            >
              <option value="excellent">Excellent</option>
              <option value="good">Good</option>
              <option value="poor">Poor</option>
              <option value="very_poor">Very Poor</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Lighting</label>
            <select
              value={environmentalConditions.lighting}
              onChange={(e) =>
                setEnvironmentalConditions({
                  ...environmentalConditions,
                  lighting: e.target.value as any,
                })
              }
            >
              <option value="daylight">Daylight</option>
              <option value="dusk">Dusk</option>
              <option value="dark">Dark</option>
              <option value="artificial_good">Artificial (Good)</option>
              <option value="artificial_poor">Artificial (Poor)</option>
            </select>
          </div>
          <div className="form-group">
            <label>Crowd Level</label>
            <select
              value={environmentalConditions.crowdLevel}
              onChange={(e) =>
                setEnvironmentalConditions({
                  ...environmentalConditions,
                  crowdLevel: e.target.value as any,
                })
              }
            >
              <option value="empty">Empty</option>
              <option value="light">Light</option>
              <option value="moderate">Moderate</option>
              <option value="heavy">Heavy</option>
              <option value="extremely_crowded">Extremely Crowded</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="form-step">
      <h2>Incident Description</h2>
      <p className="step-description">
        Provide a comprehensive account of what occurred. Be factual, chronological, and specific.
      </p>

      <div className="form-group">
        <label>Brief Summary (1-2 sentences) *</label>
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Brief overview of the incident..."
          rows={2}
          maxLength={200}
          required
        />
        <small>{summary.length}/200 characters</small>
      </div>

      <div className="form-group">
        <label>Detailed Narrative *</label>
        <textarea
          value={detailedNarrative}
          onChange={(e) => setDetailedNarrative(e.target.value)}
          placeholder="Provide a detailed chronological account of the incident. Include: What happened? When? Where? Who was involved? How did it unfold?"
          rows={10}
          required
        />
        <small className="form-hint">
          Write in past tense. Use objective language. Include times for key events.
        </small>
      </div>

      <div className="form-group">
        <label>Trigger Factors</label>
        <textarea
          value={triggerFactors}
          onChange={(e) => setTriggerFactors(e.target.value)}
          placeholder="What led to this incident? Were there any warning signs?"
          rows={3}
        />
      </div>

      <div className="form-group">
        <label>Outcome *</label>
        <textarea
          value={outcome}
          onChange={(e) => setOutcome(e.target.value)}
          placeholder="How did the incident conclude? What was the final status?"
          rows={3}
          required
        />
      </div>

      <div className="form-group">
        <h3>Principal Status</h3>
        <label>Injury Status *</label>
        <div className="injury-status-options">
          {(['none', 'minor', 'moderate', 'severe', 'critical'] as const).map((status) => (
            <button
              key={status}
              type="button"
              className={`injury-option ${principalInjuryStatus === status ? 'selected' : ''}`}
              onClick={() => setPrincipalInjuryStatus(status)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {principalInjuryStatus !== 'none' && (
        <>
          <div className="form-group">
            <label>Injury Description *</label>
            <textarea
              value={principalInjuryDescription}
              onChange={(e) => setPrincipalInjuryDescription(e.target.value)}
              placeholder="Describe the nature and extent of injuries..."
              rows={3}
              required
            />
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={medicalAttentionRequired}
                onChange={(e) => setMedicalAttentionRequired(e.target.checked)}
              />
              Medical attention required
            </label>
          </div>

          {medicalAttentionRequired && (
            <div className="form-group">
              <label>Medical Attention Details *</label>
              <textarea
                value={medicalAttentionDetails}
                onChange={(e) => setMedicalAttentionDetails(e.target.value)}
                placeholder="Ambulance called? Hospital name? Treatment provided?"
                rows={3}
                required
              />
            </div>
          )}
        </>
      )}
    </div>
  );

  const renderStep4 = () => (
    <div className="form-step">
      <h2>Actions Taken</h2>
      <p className="step-description">
        Document all actions taken in response to the incident, in chronological order.
      </p>

      <div className="form-group">
        <div className="section-header">
          <h3>Immediate Actions</h3>
          <button type="button" className="btn btn-secondary btn-sm" onClick={addImmediateAction}>
            + Add Action
          </button>
        </div>

        {immediateActions.length === 0 && (
          <p className="text-muted">No actions recorded yet. Click "Add Action" to begin.</p>
        )}

        {immediateActions.map((action, index) => (
          <div key={action.id} className="action-item">
            <div className="action-header">
              <strong>Action {index + 1}</strong>
              <button
                type="button"
                className="btn-icon-danger"
                onClick={() => removeImmediateAction(index)}
              >
                ×
              </button>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Time</label>
                <input
                  type="time"
                  value={action.timestamp.slice(11, 16)}
                  onChange={(e) => {
                    const newTime = `${incidentDateTime.slice(0, 11)}${e.target.value}:00.000Z`;
                    updateImmediateAction(index, 'timestamp', newTime);
                  }}
                />
              </div>
              <div className="form-group" style={{ flex: 2 }}>
                <label>Action Taken *</label>
                <input
                  type="text"
                  value={action.action}
                  onChange={(e) => updateImmediateAction(index, 'action', e.target.value)}
                  placeholder="e.g., Secured principal in vehicle"
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Result</label>
              <input
                type="text"
                value={action.result}
                onChange={(e) => updateImmediateAction(index, 'result', e.target.value)}
                placeholder="e.g., Principal safe, threat neutralized"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="form-group">
        <label>Equipment Used</label>
        <input
          type="text"
          value={equipmentUsed.join(', ')}
          onChange={(e) => setEquipmentUsed(e.target.value.split(',').map((s) => s.trim()))}
          placeholder="e.g., First aid kit, Body camera, Radio"
        />
        <small className="form-hint">Separate multiple items with commas</small>
      </div>

      <div className="form-group">
        <label>Equipment Failures (if any)</label>
        <input
          type="text"
          value={equipmentFailures?.join(', ') || ''}
          onChange={(e) =>
            setEquipmentFailures(e.target.value.split(',').map((s) => s.trim()).filter(Boolean))
          }
          placeholder="e.g., Radio malfunction, GPS offline"
        />
      </div>

      <div className="form-group">
        <h3>Law Enforcement</h3>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={lawEnforcementReported}
            onChange={(e) => setLawEnforcementReported(e.target.checked)}
          />
          Law enforcement notified
        </label>
      </div>

      {lawEnforcementReported && (
        <div className="law-enforcement-details">
          <div className="form-row">
            <div className="form-group">
              <label>Police Force</label>
              <input
                type="text"
                value={lawEnforcementDetails.forceName || ''}
                onChange={(e) =>
                  setLawEnforcementDetails({ ...lawEnforcementDetails, forceName: e.target.value })
                }
                placeholder="e.g., Metropolitan Police"
              />
            </div>
            <div className="form-group">
              <label>Station</label>
              <input
                type="text"
                value={lawEnforcementDetails.stationName || ''}
                onChange={(e) =>
                  setLawEnforcementDetails({
                    ...lawEnforcementDetails,
                    stationName: e.target.value,
                  })
                }
                placeholder="Station name"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Officer Name</label>
              <input
                type="text"
                value={lawEnforcementDetails.officerName || ''}
                onChange={(e) =>
                  setLawEnforcementDetails({
                    ...lawEnforcementDetails,
                    officerName: e.target.value,
                  })
                }
                placeholder="PC Name"
              />
            </div>
            <div className="form-group">
              <label>Crime Reference Number</label>
              <input
                type="text"
                value={lawEnforcementDetails.crimeReferenceNumber || ''}
                onChange={(e) =>
                  setLawEnforcementDetails({
                    ...lawEnforcementDetails,
                    crimeReferenceNumber: e.target.value,
                  })
                }
                placeholder="CR/12345/25"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderStep5 = () => (
    <div className="form-step">
      <h2>Witnesses & Evidence</h2>
      <p className="step-description">
        Record witness statements and document all evidence collected.
      </p>

      <div className="form-group">
        <div className="section-header">
          <h3>Witnesses</h3>
          <button type="button" className="btn btn-secondary btn-sm" onClick={addWitness}>
            + Add Witness
          </button>
        </div>

        {witnesses.length === 0 && (
          <p className="text-muted">No witnesses recorded. Click "Add Witness" if applicable.</p>
        )}

        {witnesses.map((witness, index) => (
          <div key={witness.id} className="witness-item">
            <div className="witness-header">
              <strong>Witness {index + 1}</strong>
              <button
                type="button"
                className="btn-icon-danger"
                onClick={() => removeWitness(index)}
              >
                ×
              </button>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  value={witness.name}
                  onChange={(e) => updateWitness(index, 'name', e.target.value)}
                  placeholder="Witness name"
                  required
                />
              </div>
              <div className="form-group">
                <label>Relationship</label>
                <select
                  value={witness.relationship}
                  onChange={(e) => updateWitness(index, 'relationship', e.target.value)}
                >
                  <option value="principal">Principal</option>
                  <option value="bystander">Bystander</option>
                  <option value="colleague">Colleague</option>
                  <option value="security_staff">Security Staff</option>
                  <option value="law_enforcement">Law Enforcement</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Contact Phone</label>
                <input
                  type="tel"
                  value={witness.contactPhone || ''}
                  onChange={(e) => updateWitness(index, 'contactPhone', e.target.value)}
                  placeholder="+44 7XXX XXXXXX"
                />
              </div>
              <div className="form-group">
                <label>Contact Email</label>
                <input
                  type="email"
                  value={witness.contactEmail || ''}
                  onChange={(e) => updateWitness(index, 'contactEmail', e.target.value)}
                  placeholder="email@example.com"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Statement *</label>
              <textarea
                value={witness.statement}
                onChange={(e) => updateWitness(index, 'statement', e.target.value)}
                placeholder="What did the witness observe?"
                rows={4}
                required
              />
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={witness.willingToTestify}
                  onChange={(e) => updateWitness(index, 'willingToTestify', e.target.checked)}
                />
                Willing to testify if required
              </label>
            </div>
          </div>
        ))}
      </div>

      <div className="alert alert-info">
        <strong>📸 Media Evidence</strong>
        <p>Photo and video uploads will be available after saving this draft.</p>
      </div>
    </div>
  );

  const renderStep6 = () => (
    <div className="form-step">
      <h2>Review & Submit</h2>
      <p className="step-description">
        Review all information before submitting. Critical and high severity incidents will be
        immediately escalated to management.
      </p>

      <div className="report-summary">
        <div className="summary-section">
          <h3>Incident Classification</h3>
          <p>
            <strong>Type:</strong>{' '}
            {classificationOptions.find((o) => o.value === classification)?.label}
          </p>
          <p>
            <strong>Severity:</strong> {severity.toUpperCase()}
          </p>
          <p>
            <strong>Date/Time:</strong> {new Date(incidentDateTime).toLocaleString('en-GB')}
          </p>
        </div>

        <div className="summary-section">
          <h3>Location</h3>
          <p>{address}</p>
          <p>
            {city} {postcode}
          </p>
          {venue && <p>{venue}</p>}
        </div>

        <div className="summary-section">
          <h3>Summary</h3>
          <p>{summary}</p>
        </div>

        <div className="summary-section">
          <h3>Actions & Evidence</h3>
          <p>
            <strong>Immediate Actions:</strong> {immediateActions.length}
          </p>
          <p>
            <strong>Witnesses:</strong> {witnesses.length}
          </p>
          <p>
            <strong>Equipment Used:</strong> {equipmentUsed.length}
          </p>
          <p>
            <strong>Law Enforcement:</strong> {lawEnforcementReported ? 'Yes' : 'No'}
          </p>
        </div>
      </div>

      <div className="form-group">
        <label>Lessons Learned</label>
        <textarea
          value={lessonsLearned}
          onChange={(e) => setLessonsLearned(e.target.value)}
          placeholder="What can be learned from this incident?"
          rows={3}
        />
      </div>

      <div className="form-group">
        <label>Protocol Recommendations</label>
        <textarea
          value={protocolRecommendations}
          onChange={(e) => setProtocolRecommendations(e.target.value)}
          placeholder="Suggested improvements to security protocols"
          rows={3}
        />
      </div>

      {(severity === 'critical' || severity === 'high') && (
        <div className="alert alert-warning">
          <strong>⚠️ Escalation Notice</strong>
          <p>
            This {severity} severity incident will be immediately escalated to management upon
            submission and may require follow-up investigation.
          </p>
        </div>
      )}

      <div className="data-protection-notice">
        <p>
          <small>
            By submitting this report, you certify that the information is accurate to the best of
            your knowledge. This report will be stored securely and retained in accordance with GDPR
            and SIA compliance requirements ({severity === 'critical' || severity === 'high' ? 'extended retention period' : '7 years standard retention'}).
          </small>
        </p>
      </div>
    </div>
  );

  return (
    <div className="incident-report-form">
      <div className="form-header">
        <h1>Incident Report</h1>
        {assignmentReference && (
          <span className="assignment-reference">Assignment: {assignmentReference}</span>
        )}
        {autoSaving && <span className="auto-save-indicator">💾 Saving draft...</span>}
      </div>

      {renderStepIndicator()}

      {error && (
        <div className="alert alert-error">
          <strong>Error:</strong> {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
        {currentStep === 5 && renderStep5()}
        {currentStep === 6 && renderStep6()}

        <div className="form-navigation">
          <div className="nav-left">
            {currentStep > 1 && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setCurrentStep(currentStep - 1)}
              >
                ← Previous
              </button>
            )}
          </div>

          <div className="nav-right">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => {
                handleSaveDraft();
                navigate('/incidents');
              }}
            >
              Save Draft
            </button>

            {currentStep < totalSteps ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setCurrentStep(currentStep + 1)}
              >
                Next →
              </button>
            ) : (
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Report'}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default IncidentReportForm;
