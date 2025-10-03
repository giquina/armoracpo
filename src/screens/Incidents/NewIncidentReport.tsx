import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { IncidentReport } from '../../types';
import { IncidentReportForm } from '../../components/incidents/IncidentReportForm';
import { incidentService } from '../../services/incidentService';
import { supabase } from '../../lib/supabase';
import './NewIncidentReport.css';

const NewIncidentReport: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Check if report is linked to an assignment
  const assignmentId = searchParams.get('assignmentId');
  const assignmentReference = searchParams.get('assignmentReference');

  const handleSubmit = async (report: IncidentReport) => {
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

      await incidentService.createIncidentReport(report, cpoData.id);
      setSuccess(true);

      // Show success message and navigate
      setTimeout(() => {
        navigate('/incidents');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to create incident report');
      console.error('Error creating report:', err);
    }
  };

  const handleSaveDraft = async (report: Partial<IncidentReport>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: cpoData } = await supabase
        .from('protection_officers')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (!cpoData) throw new Error('CPO profile not found');

      await incidentService.saveDraft(report, cpoData.id);
    } catch (err: any) {
      console.error('Error saving draft:', err);
      throw err;
    }
  };

  if (success) {
    return (
      <div className="new-incident-report-screen">
        <div className="safe-top" />
        <div className="success-state">
          <div className="success-icon">✓</div>
          <h2>Report Submitted Successfully</h2>
          <p>Your incident report has been created and submitted for review.</p>
          <p className="redirect-notice">Redirecting to reports list...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="new-incident-report-screen">
      <div className="safe-top" />

      <div className="screen-header">
        <button className="btn-back" onClick={() => navigate('/incidents')}>
          ← Cancel
        </button>
        <h1>New Incident Report</h1>
        {assignmentReference && (
          <p className="assignment-context">
            Assignment: {assignmentReference}
          </p>
        )}
      </div>

      {error && (
        <div className="error-banner">
          <strong>Error:</strong> {error}
        </div>
      )}

      <IncidentReportForm
        assignmentId={assignmentId || undefined}
        assignmentReference={assignmentReference || undefined}
        onSubmit={handleSubmit}
        onSaveDraft={handleSaveDraft}
      />

      <div className="safe-bottom" />
    </div>
  );
};

export default NewIncidentReport;
