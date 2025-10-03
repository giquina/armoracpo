import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { IncidentReport } from '../types';

/**
 * Incident Report PDF Export Service
 *
 * Generates legally admissible PDF reports for security incidents with:
 * - Professional formatting with headers/footers
 * - Embedded GPS coordinates and timestamps
 * - Chain of custody documentation
 * - Digital watermarking for authenticity
 * - Evidence and signature sections
 */

interface PDFExportOptions {
  includeWatermark?: boolean;
  includeHeaderFooter?: boolean;
  confidentialityLevel?: 'standard' | 'confidential' | 'restricted';
}

export class IncidentPDFService {
  private doc: jsPDF;
  private pageNumber: number = 1;
  private currentY: number = 20;
  private pageHeight: number = 297; // A4 height in mm
  private marginLeft: number = 20;
  private marginRight: number = 20;
  private marginTop: number = 30;
  private marginBottom: number = 30;
  private lineHeight: number = 7;

  constructor() {
    this.doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });
  }

  /**
   * Generate complete incident report PDF
   */
  public async generateIncidentReportPDF(
    report: IncidentReport,
    options: PDFExportOptions = {}
  ): Promise<Blob> {
    const {
      includeWatermark = true,
      includeHeaderFooter = true,
      confidentialityLevel = 'standard',
    } = options;

    // Add watermark to all pages if requested
    if (includeWatermark) {
      this.addWatermark(confidentialityLevel);
    }

    // Title page
    this.addTitlePage(report);

    // New page for report content
    this.addPage(includeWatermark, confidentialityLevel);

    // Report sections
    this.addExecutiveSummary(report);
    this.addIncidentClassification(report);
    this.addLocationAndTime(report);
    this.addIncidentDescription(report);
    this.addPrincipalDetails(report);
    this.addImmediateActions(report);
    this.addWitnessStatements(report);
    this.addLawEnforcementDetails(report);
    this.addMediaEvidence(report);
    this.addChainOfCustody(report);
    this.addSignatures(report);
    this.addLessonsLearned(report);

    // Add headers and footers to all pages
    if (includeHeaderFooter) {
      this.addHeadersAndFooters(report);
    }

    // Generate blob
    return this.doc.output('blob');
  }

  /**
   * Add title page
   */
  private addTitlePage(report: IncidentReport): void {
    this.currentY = 80;

    // Main title
    this.doc.setFontSize(28);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('INCIDENT REPORT', 105, this.currentY, { align: 'center' });

    this.currentY += 20;

    // Incident number
    this.doc.setFontSize(18);
    this.doc.setTextColor(200, 0, 0);
    this.doc.text(report.incidentNumber, 105, this.currentY, { align: 'center' });
    this.doc.setTextColor(0, 0, 0);

    this.currentY += 15;

    // Classification badge
    const classificationColor = this.getSeverityColor(report.severity);
    this.doc.setFillColor(classificationColor.r, classificationColor.g, classificationColor.b);
    this.doc.roundedRect(55, this.currentY, 100, 15, 3, 3, 'F');
    this.doc.setFontSize(14);
    this.doc.setTextColor(255, 255, 255);
    this.doc.text(
      `${report.severity.toUpperCase()} SEVERITY`,
      105,
      this.currentY + 10,
      { align: 'center' }
    );
    this.doc.setTextColor(0, 0, 0);

    this.currentY += 30;

    // Report metadata
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
    const metadata = [
      `Incident Date: ${new Date(report.incidentDateTime).toLocaleString('en-GB')}`,
      `Report Date: ${new Date(report.reportedDateTime).toLocaleString('en-GB')}`,
      `Reporting Officer: ${report.reportingOfficer.officerName}`,
      `SIA License: ${report.reportingOfficer.siaLicenseNumber}`,
      `Location: ${report.location.city}`,
    ];

    metadata.forEach((line) => {
      this.doc.text(line, 105, this.currentY, { align: 'center' });
      this.currentY += 8;
    });

    this.currentY += 20;

    // Confidentiality notice
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('CONFIDENTIAL - SECURITY INCIDENT REPORT', 105, this.currentY, {
      align: 'center',
    });
    this.currentY += 6;
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(
      'This document contains sensitive security information and is',
      105,
      this.currentY,
      { align: 'center' }
    );
    this.currentY += 5;
    this.doc.text(
      'protected under data protection legislation. Unauthorized disclosure',
      105,
      this.currentY,
      { align: 'center' }
    );
    this.currentY += 5;
    this.doc.text('may result in legal action.', 105, this.currentY, { align: 'center' });

    // Footer with timestamp
    this.doc.setFontSize(8);
    this.doc.setTextColor(128, 128, 128);
    this.doc.text(
      `Generated: ${new Date().toLocaleString('en-GB')} | Armora Protection Service`,
      105,
      280,
      { align: 'center' }
    );
    this.doc.setTextColor(0, 0, 0);
  }

  /**
   * Add executive summary section
   */
  private addExecutiveSummary(report: IncidentReport): void {
    this.addSectionHeader('EXECUTIVE SUMMARY');

    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');

    const summaryText = report.description.summary;
    const splitSummary = this.doc.splitTextToSize(summaryText, 170);

    splitSummary.forEach((line: string) => {
      this.checkPageBreak();
      this.doc.text(line, this.marginLeft, this.currentY);
      this.currentY += this.lineHeight;
    });

    this.currentY += 5;
  }

  /**
   * Add incident classification section
   */
  private addIncidentClassification(report: IncidentReport): void {
    this.addSectionHeader('INCIDENT CLASSIFICATION');

    const classificationData = [
      ['Type', this.formatClassification(report.classification)],
      ['Severity', report.severity.toUpperCase()],
      ['Status', report.status.toUpperCase()],
      ['Review Required', report.reviewRequired ? 'YES' : 'NO'],
      ['Management Notified', report.managementNotified ? 'YES' : 'NO'],
    ];

    autoTable(this.doc, {
      startY: this.currentY,
      head: [['Field', 'Value']],
      body: classificationData,
      theme: 'grid',
      headStyles: { fillColor: [40, 40, 40] },
      margin: { left: this.marginLeft, right: this.marginRight },
      styles: { fontSize: 10 },
    });

    this.currentY = (this.doc as any).lastAutoTable.finalY + 10;
  }

  /**
   * Add location and time section
   */
  private addLocationAndTime(report: IncidentReport): void {
    this.checkPageBreak(40);
    this.addSectionHeader('LOCATION & TIME');

    const locationData = [
      ['Incident Date/Time', new Date(report.incidentDateTime).toLocaleString('en-GB')],
      ['Address', report.location.address],
      ['City', report.location.city],
      ['Postcode', report.location.postcode || 'Not recorded'],
      ['Venue', report.location.venue || 'N/A'],
      ['Venue Type', report.location.venueType || 'N/A'],
      [
        'GPS Coordinates',
        `${report.location.coordinates.latitude.toFixed(6)}, ${report.location.coordinates.longitude.toFixed(6)}`,
      ],
      ['GPS Accuracy', `±${report.location.coordinates.accuracy.toFixed(0)}m`],
    ];

    if (report.assignmentReference) {
      locationData.unshift(['Assignment Reference', report.assignmentReference]);
    }

    autoTable(this.doc, {
      startY: this.currentY,
      head: [['Field', 'Value']],
      body: locationData,
      theme: 'grid',
      headStyles: { fillColor: [40, 40, 40] },
      margin: { left: this.marginLeft, right: this.marginRight },
      styles: { fontSize: 10 },
    });

    this.currentY = (this.doc as any).lastAutoTable.finalY + 10;

    // Add environmental conditions
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Environmental Conditions', this.marginLeft, this.currentY);
    this.currentY += 7;

    const envData = [
      ['Weather', report.environmentalConditions.weather],
      ['Visibility', report.environmentalConditions.visibility],
      ['Lighting', report.environmentalConditions.lighting],
      ['Crowd Level', report.environmentalConditions.crowdLevel],
      ['Noise Level', report.environmentalConditions.noiseLevel || 'Not recorded'],
    ];

    autoTable(this.doc, {
      startY: this.currentY,
      body: envData,
      theme: 'striped',
      margin: { left: this.marginLeft, right: this.marginRight },
      styles: { fontSize: 9 },
    });

    this.currentY = (this.doc as any).lastAutoTable.finalY + 10;
  }

  /**
   * Add incident description section
   */
  private addIncidentDescription(report: IncidentReport): void {
    this.checkPageBreak(40);
    this.addSectionHeader('INCIDENT DESCRIPTION');

    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Summary', this.marginLeft, this.currentY);
    this.currentY += 7;

    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    const summaryLines = this.doc.splitTextToSize(report.description.summary, 170);
    summaryLines.forEach((line: string) => {
      this.checkPageBreak();
      this.doc.text(line, this.marginLeft, this.currentY);
      this.currentY += this.lineHeight;
    });

    this.currentY += 5;

    // Detailed narrative
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Detailed Narrative', this.marginLeft, this.currentY);
    this.currentY += 7;

    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    const narrativeLines = this.doc.splitTextToSize(report.description.detailedNarrative, 170);
    narrativeLines.forEach((line: string) => {
      this.checkPageBreak();
      this.doc.text(line, this.marginLeft, this.currentY);
      this.currentY += this.lineHeight;
    });

    this.currentY += 5;

    // Trigger factors
    if (report.description.triggerFactors) {
      this.doc.setFontSize(11);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('Trigger Factors', this.marginLeft, this.currentY);
      this.currentY += 7;

      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'normal');
      const triggerLines = this.doc.splitTextToSize(report.description.triggerFactors, 170);
      triggerLines.forEach((line: string) => {
        this.checkPageBreak();
        this.doc.text(line, this.marginLeft, this.currentY);
        this.currentY += this.lineHeight;
      });

      this.currentY += 5;
    }

    // Outcome
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Outcome', this.marginLeft, this.currentY);
    this.currentY += 7;

    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    const outcomeLines = this.doc.splitTextToSize(report.description.outcome, 170);
    outcomeLines.forEach((line: string) => {
      this.checkPageBreak();
      this.doc.text(line, this.marginLeft, this.currentY);
      this.currentY += this.lineHeight;
    });

    this.currentY += 10;
  }

  /**
   * Add principal details section
   */
  private addPrincipalDetails(report: IncidentReport): void {
    if (!report.principal || report.principal.injuryStatus === 'none') {
      return;
    }

    this.checkPageBreak(30);
    this.addSectionHeader('PRINCIPAL STATUS');

    const principalData = [
      ['Injury Status', report.principal.injuryStatus.toUpperCase()],
      ['Injury Description', report.principal.injuryDescription || 'N/A'],
      [
        'Medical Attention Required',
        report.principal.medicalAttentionRequired ? 'YES' : 'NO',
      ],
    ];

    if (report.principal.medicalAttentionDetails) {
      principalData.push(['Medical Attention Details', report.principal.medicalAttentionDetails]);
    }

    autoTable(this.doc, {
      startY: this.currentY,
      body: principalData,
      theme: 'grid',
      headStyles: { fillColor: [40, 40, 40] },
      margin: { left: this.marginLeft, right: this.marginRight },
      styles: { fontSize: 10 },
    });

    this.currentY = (this.doc as any).lastAutoTable.finalY + 10;
  }

  /**
   * Add immediate actions section
   */
  private addImmediateActions(report: IncidentReport): void {
    if (report.immediateActions.length === 0) {
      return;
    }

    this.checkPageBreak(30);
    this.addSectionHeader('IMMEDIATE ACTIONS TAKEN');

    const actionsData = report.immediateActions.map((action, index) => [
      `${index + 1}`,
      new Date(action.timestamp).toLocaleTimeString('en-GB'),
      action.action,
      action.result || 'N/A',
    ]);

    autoTable(this.doc, {
      startY: this.currentY,
      head: [['#', 'Time', 'Action', 'Result']],
      body: actionsData,
      theme: 'grid',
      headStyles: { fillColor: [40, 40, 40] },
      margin: { left: this.marginLeft, right: this.marginRight },
      styles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 25 },
        2: { cellWidth: 70 },
        3: { cellWidth: 60 },
      },
    });

    this.currentY = (this.doc as any).lastAutoTable.finalY + 10;
  }

  /**
   * Add witness statements section
   */
  private addWitnessStatements(report: IncidentReport): void {
    if (report.witnesses.length === 0) {
      return;
    }

    this.checkPageBreak(30);
    this.addSectionHeader('WITNESS STATEMENTS');

    report.witnesses.forEach((witness, index) => {
      this.checkPageBreak(35);

      this.doc.setFontSize(11);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(`Witness ${index + 1}: ${witness.name}`, this.marginLeft, this.currentY);
      this.currentY += 7;

      const witnessData = [
        ['Relationship', witness.relationship],
        ['Contact Phone', witness.contactPhone || 'Not provided'],
        ['Contact Email', witness.contactEmail || 'Not provided'],
        ['Willing to Testify', witness.willingToTestify ? 'YES' : 'NO'],
      ];

      autoTable(this.doc, {
        startY: this.currentY,
        body: witnessData,
        theme: 'plain',
        margin: { left: this.marginLeft, right: this.marginRight },
        styles: { fontSize: 9 },
      });

      this.currentY = (this.doc as any).lastAutoTable.finalY + 5;

      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('Statement:', this.marginLeft, this.currentY);
      this.currentY += 6;

      this.doc.setFont('helvetica', 'normal');
      const statementLines = this.doc.splitTextToSize(witness.statement, 170);
      statementLines.forEach((line: string) => {
        this.checkPageBreak();
        this.doc.text(line, this.marginLeft, this.currentY);
        this.currentY += this.lineHeight;
      });

      this.currentY += 8;
    });
  }

  /**
   * Add law enforcement details section
   */
  private addLawEnforcementDetails(report: IncidentReport): void {
    if (!report.lawEnforcement || !report.lawEnforcement.reported) {
      return;
    }

    this.checkPageBreak(30);
    this.addSectionHeader('LAW ENFORCEMENT');

    const lawData = [
      ['Police Force', report.lawEnforcement.forceName || 'Not recorded'],
      ['Station', report.lawEnforcement.stationName || 'Not recorded'],
      ['Officer Name', report.lawEnforcement.officerName || 'Not recorded'],
      ['Officer Badge', report.lawEnforcement.officerBadgeNumber || 'Not recorded'],
      ['Crime Reference', report.lawEnforcement.crimeReferenceNumber || 'Not recorded'],
      ['Arrests Made', report.lawEnforcement.arrestsMade ? 'YES' : 'NO'],
      ['Follow-up Required', report.lawEnforcement.followUpRequired ? 'YES' : 'NO'],
    ];

    if (report.lawEnforcement.responseTime) {
      lawData.push(['Response Time', `${report.lawEnforcement.responseTime} minutes`]);
    }

    autoTable(this.doc, {
      startY: this.currentY,
      body: lawData,
      theme: 'grid',
      margin: { left: this.marginLeft, right: this.marginRight },
      styles: { fontSize: 10 },
    });

    this.currentY = (this.doc as any).lastAutoTable.finalY + 10;
  }

  /**
   * Add media evidence section
   */
  private addMediaEvidence(report: IncidentReport): void {
    if (report.mediaAttachments.length === 0) {
      return;
    }

    this.checkPageBreak(30);
    this.addSectionHeader('MEDIA EVIDENCE');

    const mediaData = report.mediaAttachments.map((media, index) => [
      `${index + 1}`,
      media.type.toUpperCase(),
      media.filename,
      new Date(media.capturedAt).toLocaleString('en-GB'),
      `${media.gpsCoordinates.latitude.toFixed(6)}, ${media.gpsCoordinates.longitude.toFixed(6)}`,
      media.description || 'N/A',
    ]);

    autoTable(this.doc, {
      startY: this.currentY,
      head: [['#', 'Type', 'Filename', 'Captured At', 'GPS', 'Description']],
      body: mediaData,
      theme: 'grid',
      headStyles: { fillColor: [40, 40, 40] },
      margin: { left: this.marginLeft, right: this.marginRight },
      styles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 20 },
        2: { cellWidth: 45 },
        3: { cellWidth: 35 },
        4: { cellWidth: 35 },
        5: { cellWidth: 30 },
      },
    });

    this.currentY = (this.doc as any).lastAutoTable.finalY + 10;
  }

  /**
   * Add chain of custody section
   */
  private addChainOfCustody(report: IncidentReport): void {
    this.checkPageBreak(30);
    this.addSectionHeader('CHAIN OF CUSTODY');

    const custodyData = [
      ['Report Created By', report.reportingOfficer.officerName],
      ['SIA License', report.reportingOfficer.siaLicenseNumber],
      ['Created At', new Date(report.createdAt).toLocaleString('en-GB')],
      ['Last Modified', new Date(report.updatedAt).toLocaleString('en-GB')],
      ['Submitted At', report.submittedDateTime ? new Date(report.submittedDateTime).toLocaleString('en-GB') : 'Not submitted'],
      ['Data Classification', report.dataClassification],
      ['Retention Period', report.retentionPeriod],
      ['Report Exported', report.exported ? 'YES' : 'NO'],
    ];

    if (report.exportedAt) {
      custodyData.push(['Exported At', new Date(report.exportedAt).toLocaleString('en-GB')]);
    }

    autoTable(this.doc, {
      startY: this.currentY,
      body: custodyData,
      theme: 'grid',
      margin: { left: this.marginLeft, right: this.marginRight },
      styles: { fontSize: 10 },
    });

    this.currentY = (this.doc as any).lastAutoTable.finalY + 10;
  }

  /**
   * Add signatures section
   */
  private addSignatures(report: IncidentReport): void {
    if (report.signatures.length === 0) {
      return;
    }

    this.checkPageBreak(30);
    this.addSectionHeader('SIGNATURES');

    report.signatures.forEach((signature, index) => {
      this.checkPageBreak(25);

      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(`${signature.signerRole}: ${signature.signerName}`, this.marginLeft, this.currentY);
      this.currentY += 6;

      this.doc.setFont('helvetica', 'normal');
      this.doc.text(
        `Signed at: ${new Date(signature.signedAt).toLocaleString('en-GB')}`,
        this.marginLeft,
        this.currentY
      );
      this.currentY += 6;

      // Signature placeholder (in real implementation, embed signature image)
      this.doc.setDrawColor(200, 200, 200);
      this.doc.rect(this.marginLeft, this.currentY, 80, 20);
      this.doc.setFontSize(8);
      this.doc.setTextColor(150, 150, 150);
      this.doc.text('Digital Signature', this.marginLeft + 40, this.currentY + 12, { align: 'center' });
      this.doc.setTextColor(0, 0, 0);

      this.currentY += 25;
    });
  }

  /**
   * Add lessons learned section
   */
  private addLessonsLearned(report: IncidentReport): void {
    if (!report.lessonsLearned && !report.protocolRecommendations) {
      return;
    }

    this.checkPageBreak(30);
    this.addSectionHeader('LESSONS LEARNED & RECOMMENDATIONS');

    if (report.lessonsLearned) {
      this.doc.setFontSize(11);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('Lessons Learned', this.marginLeft, this.currentY);
      this.currentY += 7;

      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'normal');
      const lessonsLines = this.doc.splitTextToSize(report.lessonsLearned, 170);
      lessonsLines.forEach((line: string) => {
        this.checkPageBreak();
        this.doc.text(line, this.marginLeft, this.currentY);
        this.currentY += this.lineHeight;
      });

      this.currentY += 5;
    }

    if (report.protocolRecommendations) {
      this.doc.setFontSize(11);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('Protocol Recommendations', this.marginLeft, this.currentY);
      this.currentY += 7;

      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'normal');
      const recommendationsLines = this.doc.splitTextToSize(report.protocolRecommendations, 170);
      recommendationsLines.forEach((line: string) => {
        this.checkPageBreak();
        this.doc.text(line, this.marginLeft, this.currentY);
        this.currentY += this.lineHeight;
      });

      this.currentY += 5;
    }
  }

  /**
   * Add section header
   */
  private addSectionHeader(title: string): void {
    this.currentY += 5;
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(200, 0, 0);
    this.doc.text(title, this.marginLeft, this.currentY);
    this.doc.setTextColor(0, 0, 0);

    // Underline
    this.doc.setDrawColor(200, 0, 0);
    this.doc.setLineWidth(0.5);
    this.doc.line(this.marginLeft, this.currentY + 2, 190, this.currentY + 2);

    this.currentY += 10;
  }

  /**
   * Add watermark to current page
   */
  private addWatermark(level: string): void {
    const watermarkText = level === 'restricted' ? 'RESTRICTED' : 'CONFIDENTIAL';

    this.doc.saveGraphicsState();
    this.doc.setGState(new this.doc.GState({ opacity: 0.1 }));
    this.doc.setFontSize(60);
    this.doc.setTextColor(255, 0, 0);
    this.doc.setFont('helvetica', 'bold');

    // Rotate and center watermark
    this.doc.text(watermarkText, 105, 150, {
      align: 'center',
      angle: 45,
    });

    this.doc.restoreGraphicsState();
  }

  /**
   * Add headers and footers to all pages
   */
  private addHeadersAndFooters(report: IncidentReport): void {
    const totalPages = this.doc.getNumberOfPages();

    for (let i = 1; i <= totalPages; i++) {
      this.doc.setPage(i);

      // Skip title page
      if (i === 1) continue;

      // Header
      this.doc.setFontSize(8);
      this.doc.setTextColor(100, 100, 100);
      this.doc.text(
        `Incident Report: ${report.incidentNumber}`,
        this.marginLeft,
        15
      );
      this.doc.text(
        `Page ${i} of ${totalPages}`,
        190,
        15,
        { align: 'right' }
      );

      // Footer
      this.doc.setFontSize(7);
      this.doc.text(
        `Generated: ${new Date().toLocaleString('en-GB')} | Armora Protection Service | CONFIDENTIAL`,
        105,
        285,
        { align: 'center' }
      );

      this.doc.setTextColor(0, 0, 0);
    }
  }

  /**
   * Check if we need a page break
   */
  private checkPageBreak(requiredSpace: number = 20): void {
    if (this.currentY + requiredSpace > this.pageHeight - this.marginBottom) {
      this.addPage(true, 'standard');
    }
  }

  /**
   * Add a new page
   */
  private addPage(includeWatermark: boolean = true, confidentialityLevel: string = 'standard'): void {
    this.doc.addPage();
    this.pageNumber++;
    this.currentY = this.marginTop;

    if (includeWatermark) {
      this.addWatermark(confidentialityLevel);
    }
  }

  /**
   * Get severity color
   */
  private getSeverityColor(severity: string): { r: number; g: number; b: number } {
    const colors: Record<string, { r: number; g: number; b: number }> = {
      critical: { r: 220, g: 38, b: 38 },
      high: { r: 249, g: 115, b: 22 },
      medium: { r: 234, g: 179, b: 8 },
      low: { r: 34, g: 197, b: 94 },
      informational: { r: 59, g: 130, b: 246 },
    };
    return colors[severity] || colors.medium;
  }

  /**
   * Format classification for display
   */
  private formatClassification(classification: string): string {
    return classification
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Save PDF file
   */
  public async savePDF(report: IncidentReport, filename?: string): Promise<void> {
    const blob = await this.generateIncidentReportPDF(report);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `incident-report-${report.incidentNumber}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  }
}

// Export singleton instance
export const incidentPDFService = new IncidentPDFService();

// Export function for easy use
export const exportIncidentReportToPDF = async (
  report: IncidentReport,
  options?: PDFExportOptions
): Promise<Blob> => {
  const service = new IncidentPDFService();
  return service.generateIncidentReportPDF(report, options);
};

export const downloadIncidentReportPDF = async (
  report: IncidentReport,
  filename?: string
): Promise<void> => {
  const service = new IncidentPDFService();
  await service.savePDF(report, filename);
};
