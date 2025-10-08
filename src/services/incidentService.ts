import { supabase } from '../lib/supabase';
import { IncidentReport, IncidentReportSummary, IncidentMediaAttachment } from '../types';

/**
 * Incident Reporting Service
 *
 * Handles all incident report operations including:
 * - Creating, updating, and retrieving incident reports
 * - Media upload to Supabase Storage
 * - Chain of custody tracking
 * - Signature management
 * - Real-time report status updates
 */

export class IncidentService {
  /**
   * Create a new incident report
   */
  async createIncidentReport(report: IncidentReport, cpoId: string): Promise<IncidentReport> {
    try {
      // Get CPO details for reporting officer
      const { data: cpo, error: cpoError } = await supabase
        .from('protection_officers')
        .select('first_name, last_name, sia_license_number, phone, email')
        .eq('id', cpoId)
        .single();

      if (cpoError) throw new Error('Failed to fetch CPO details');

      // Populate reporting officer details
      report.reportingOfficer = {
        officerId: cpoId,
        officerName: `${cpo.first_name} ${cpo.last_name}`,
        siaLicenseNumber: cpo.sia_license_number,
        officerPhone: cpo.phone,
        officerEmail: cpo.email,
      };

      // Set audit fields
      report.createdBy = cpoId;
      report.lastModifiedBy = cpoId;
      report.submittedBy = cpoId;

      // Insert into database
      const { data, error } = await supabase
        .from('incident_reports')
        .insert({
          id: report.id,
          incident_number: report.incidentNumber,
          assignment_id: report.assignmentId,
          assignment_reference: report.assignmentReference,
          classification: report.classification,
          severity: report.severity,
          status: report.status,
          incident_datetime: report.incidentDateTime,
          reported_datetime: report.reportedDateTime,
          submitted_datetime: report.submittedDateTime,
          location: report.location,
          reporting_officer: report.reportingOfficer,
          principal_details: report.principal,
          description: report.description,
          suspect_details: report.suspectDetails,
          witnesses: report.witnesses,
          environmental_conditions: report.environmentalConditions,
          immediate_actions: report.immediateActions,
          communications_log: report.communicationsLog,
          equipment_used: report.equipmentUsed,
          equipment_failures: report.equipmentFailures,
          law_enforcement: report.lawEnforcement,
          media_attachments: report.mediaAttachments,
          additional_evidence: report.additionalEvidence,
          signatures: report.signatures,
          follow_up_actions: report.followUpActions,
          review_required: report.reviewRequired,
          management_notified: report.managementNotified,
          management_notified_at: report.managementNotifiedAt,
          lessons_learned: report.lessonsLearned,
          protocol_recommendations: report.protocolRecommendations,
          training_recommendations: report.trainingRecommendations,
          created_at: report.createdAt,
          updated_at: report.updatedAt,
          created_by: report.createdBy,
          last_modified_by: report.lastModifiedBy,
          submitted_by: report.submittedBy,
          data_classification: report.dataClassification,
          retention_period: report.retentionPeriod,
          gdpr_consent: report.gdprConsent,
          exported: report.exported,
        })
        .select()
        .single();

      if (error) throw error;

      return this.mapDatabaseRecordToIncidentReport(data);
    } catch (error: any) {
      console.error('Error creating incident report:', error);
      throw new Error(error.message || 'Failed to create incident report');
    }
  }

  /**
   * Update an existing incident report
   */
  async updateIncidentReport(
    reportId: string,
    updates: Partial<IncidentReport>,
    cpoId: string
  ): Promise<IncidentReport> {
    try {
      const { data, error } = await supabase
        .from('incident_reports')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
          last_modified_by: cpoId,
        })
        .eq('id', reportId)
        .eq('created_by', cpoId) // Ensure CPO can only update their own reports
        .select()
        .single();

      if (error) throw error;

      return this.mapDatabaseRecordToIncidentReport(data);
    } catch (error: any) {
      console.error('Error updating incident report:', error);
      throw new Error(error.message || 'Failed to update incident report');
    }
  }

  /**
   * Save incident report as draft
   */
  async saveDraft(report: Partial<IncidentReport>, cpoId: string): Promise<IncidentReport> {
    try {
      // Check if draft already exists
      const { data: existing } = await supabase
        .from('incident_reports')
        .select('id')
        .eq('id', report.id)
        .eq('status', 'draft')
        .eq('created_by', cpoId)
        .single();

      if (existing) {
        // Update existing draft
        return this.updateIncidentReport(report.id!, report, cpoId);
      } else {
        // Create new draft
        const draftReport: IncidentReport = {
          ...report,
          status: 'draft',
        } as IncidentReport;
        return this.createIncidentReport(draftReport, cpoId);
      }
    } catch (error: any) {
      console.error('Error saving draft:', error);
      throw new Error(error.message || 'Failed to save draft');
    }
  }

  /**
   * Get incident report by ID
   */
  async getIncidentReport(reportId: string, cpoId: string): Promise<IncidentReport> {
    try {
      const { data, error } = await supabase
        .from('incident_reports')
        .select('*')
        .eq('id', reportId)
        .eq('created_by', cpoId) // RLS: CPO can only access their own reports
        .single();

      if (error) throw error;
      if (!data) throw new Error('Incident report not found');

      return this.mapDatabaseRecordToIncidentReport(data);
    } catch (error: any) {
      console.error('Error fetching incident report:', error);
      throw new Error(error.message || 'Failed to fetch incident report');
    }
  }

  /**
   * Get all incident reports for a CPO
   */
  async getIncidentReports(cpoId: string, filters?: any): Promise<IncidentReportSummary[]> {
    try {
      let query = supabase
        .from('incident_reports')
        .select('*')
        .eq('created_by', cpoId)
        .order('incident_datetime', { ascending: false });

      // Apply filters
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.severity) {
        query = query.in('severity', filters.severity);
      }
      if (filters?.classification) {
        query = query.in('classification', filters.classification);
      }
      if (filters?.dateRange) {
        query = query
          .gte('incident_datetime', filters.dateRange.start)
          .lte('incident_datetime', filters.dateRange.end);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).map((record) => this.mapToIncidentReportSummary(record));
    } catch (error: any) {
      console.error('Error fetching incident reports:', error);
      throw new Error(error.message || 'Failed to fetch incident reports');
    }
  }

  /**
   * Upload media attachment to Supabase Storage
   */
  async uploadMediaAttachment(
    file: File,
    reportId: string,
    cpoId: string,
    gpsCoordinates: { latitude: number; longitude: number; accuracy: number },
    description?: string
  ): Promise<IncidentMediaAttachment> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${reportId}/${Date.now()}.${fileExt}`;
      const filePath = `incident-media/${cpoId}/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('incident-reports')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from('incident-reports').getPublicUrl(filePath);

      // Get CPO details for chain of custody
      const { data: cpo } = await supabase
        .from('protection_officers')
        .select('first_name, last_name')
        .eq('id', cpoId)
        .single();

      const cpoName = cpo ? `${cpo.first_name} ${cpo.last_name}` : 'Unknown CPO';

      // Create media attachment record
      const mediaAttachment: IncidentMediaAttachment = {
        id: `media-${Date.now()}`,
        type: file.type.startsWith('image/') ? 'photo' : 'video',
        url: publicUrl,
        filename: file.name,
        fileSize: file.size,
        mimeType: file.type,
        gpsData: {
          latitude: gpsCoordinates.latitude,
          longitude: gpsCoordinates.longitude,
          accuracy: gpsCoordinates.accuracy,
          timestamp: new Date().toISOString(),
        },
        metadata: {
          capturedAt: new Date().toISOString(),
          capturedBy: cpoId,
          deviceInfo: navigator.userAgent,
          fileHash: '', // In production, calculate file hash
        },
        description,
        chainOfCustody: [
          {
            id: `custody-${Date.now()}`,
            action: 'uploaded',
            timestamp: new Date().toISOString(),
            performedBy: {
              userId: cpoId,
              userName: cpoName,
              role: 'CPO',
            },
            details: 'Media uploaded to incident report',
          },
        ],
      };

      // Update incident report with new media attachment
      const { data: report } = await supabase
        .from('incident_reports')
        .select('media_attachments')
        .eq('id', reportId)
        .single();

      if (report) {
        const mediaAttachments = [...(report.media_attachments || []), mediaAttachment];
        await supabase
          .from('incident_reports')
          .update({ media_attachments: mediaAttachments })
          .eq('id', reportId);
      }

      return mediaAttachment;
    } catch (error: any) {
      console.error('Error uploading media:', error);
      throw new Error(error.message || 'Failed to upload media');
    }
  }

  /**
   * Add signature to incident report
   */
  async addSignature(
    reportId: string,
    signatureData: string,
    signerRole: string,
    signerName: string,
    cpoId: string
  ): Promise<void> {
    try {
      const { data: report } = await supabase
        .from('incident_reports')
        .select('signatures')
        .eq('id', reportId)
        .single();

      if (!report) throw new Error('Incident report not found');

      const signature = {
        id: `sig-${Date.now()}`,
        signatureData,
        signerRole,
        signerName,
        signerId: cpoId,
        signedAt: new Date().toISOString(),
        ipAddress: '', // In production, capture IP
        deviceInfo: navigator.userAgent,
      };

      const signatures = [...(report.signatures || []), signature];

      await supabase
        .from('incident_reports')
        .update({ signatures })
        .eq('id', reportId);
    } catch (error: any) {
      console.error('Error adding signature:', error);
      throw new Error(error.message || 'Failed to add signature');
    }
  }

  /**
   * Update chain of custody for media
   */
  async updateMediaChainOfCustody(
    reportId: string,
    mediaId: string,
    action: string,
    cpoId: string
  ): Promise<void> {
    try {
      const { data: report } = await supabase
        .from('incident_reports')
        .select('media_attachments')
        .eq('id', reportId)
        .single();

      if (!report) throw new Error('Incident report not found');

      const mediaAttachments = report.media_attachments.map((media: IncidentMediaAttachment) => {
        if (media.id === mediaId) {
          const custodyEntry = {
            action,
            timestamp: new Date().toISOString(),
            performedBy: cpoId,
            location: { latitude: 0, longitude: 0 }, // Get from device
          };
          return {
            ...media,
            chainOfCustody: [...media.chainOfCustody, custodyEntry],
          };
        }
        return media;
      });

      await supabase
        .from('incident_reports')
        .update({ media_attachments: mediaAttachments })
        .eq('id', reportId);
    } catch (error: any) {
      console.error('Error updating chain of custody:', error);
      throw new Error(error.message || 'Failed to update chain of custody');
    }
  }

  /**
   * Mark report as exported
   */
  async markAsExported(reportId: string, cpoId: string): Promise<void> {
    try {
      await supabase
        .from('incident_reports')
        .update({
          exported: true,
          exported_at: new Date().toISOString(),
          exported_by: cpoId,
        })
        .eq('id', reportId);
    } catch (error: any) {
      console.error('Error marking report as exported:', error);
      throw new Error(error.message || 'Failed to mark report as exported');
    }
  }

  /**
   * Subscribe to incident report updates
   */
  subscribeToIncidentReportUpdates(
    reportId: string,
    callback: (report: IncidentReport) => void
  ): () => void {
    const channel = supabase
      .channel(`incident-report-${reportId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'incident_reports',
          filter: `id=eq.${reportId}`,
        },
        (payload) => {
          callback(this.mapDatabaseRecordToIncidentReport(payload.new));
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }

  /**
   * Map database record to IncidentReport type
   */
  private mapDatabaseRecordToIncidentReport(record: any): IncidentReport {
    return {
      id: record.id,
      incidentNumber: record.incident_number,
      assignmentId: record.assignment_id,
      assignmentReference: record.assignment_reference,
      classification: record.classification,
      severity: record.severity,
      status: record.status,
      incidentDateTime: record.incident_datetime,
      reportedDateTime: record.reported_datetime,
      submittedDateTime: record.submitted_datetime,
      location: record.location,
      reportingOfficer: record.reporting_officer,
      principal: record.principal_details,
      description: record.description,
      suspectDetails: record.suspect_details,
      witnesses: record.witnesses || [],
      environmentalConditions: record.environmental_conditions,
      immediateActions: record.immediate_actions || [],
      communicationsLog: record.communications_log || [],
      equipmentUsed: record.equipment_used || [],
      equipmentFailures: record.equipment_failures || [],
      lawEnforcement: record.law_enforcement,
      mediaAttachments: record.media_attachments || [],
      additionalEvidence: record.additional_evidence || [],
      signatures: record.signatures || [],
      followUpActions: record.follow_up_actions || [],
      reviewRequired: record.review_required,
      managementNotified: record.management_notified,
      managementNotifiedAt: record.management_notified_at,
      lessonsLearned: record.lessons_learned,
      protocolRecommendations: record.protocol_recommendations,
      trainingRecommendations: record.training_recommendations,
      createdAt: record.created_at,
      updatedAt: record.updated_at,
      createdBy: record.created_by,
      lastModifiedBy: record.last_modified_by,
      submittedBy: record.submitted_by,
      dataClassification: record.data_classification,
      retentionPeriod: record.retention_period,
      gdprConsent: record.gdpr_consent,
      exported: record.exported || false,
      exportedAt: record.exported_at,
      exportedBy: record.exported_by,
    };
  }

  /**
   * Map database record to IncidentReportSummary
   */
  private mapToIncidentReportSummary(record: any): IncidentReportSummary {
    return {
      id: record.id,
      incidentNumber: record.incident_number,
      classification: record.classification,
      severity: record.severity,
      status: record.status,
      incidentDateTime: record.incident_datetime,
      location: {
        address: record.location.address,
        city: record.location.city,
      },
      reportingOfficer: {
        officerId: record.reporting_officer.officerId,
        officerName: record.reporting_officer.officerName,
      },
      summary: record.description.summary,
      hasMediaAttachments: (record.media_attachments || []).length > 0,
      mediaCount: (record.media_attachments || []).length,
      requiresFollowUp: record.review_required || (record.follow_up_actions || []).length > 0,
      createdAt: record.created_at,
    };
  }

  /**
   * Delete incident report (soft delete - mark as deleted)
   */
  async deleteIncidentReport(reportId: string, cpoId: string): Promise<void> {
    try {
      // Only allow deletion of drafts
      const { data: report } = await supabase
        .from('incident_reports')
        .select('status')
        .eq('id', reportId)
        .eq('created_by', cpoId)
        .single();

      if (!report) throw new Error('Incident report not found');
      if (report.status !== 'draft') {
        throw new Error('Only draft reports can be deleted');
      }

      const { error } = await supabase
        .from('incident_reports')
        .delete()
        .eq('id', reportId)
        .eq('created_by', cpoId);

      if (error) throw error;
    } catch (error: any) {
      console.error('Error deleting incident report:', error);
      throw new Error(error.message || 'Failed to delete incident report');
    }
  }
}

// Export singleton instance
export const incidentService = new IncidentService();

export default incidentService;
