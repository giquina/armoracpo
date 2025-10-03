import React, { useState, useRef, useEffect } from 'react';
import { incidentService } from '../../services/incidentService';
import { supabase } from '../../lib/supabase';
import './IncidentSignaturePad.css';

interface IncidentSignaturePadProps {
  reportId: string;
  onSignatureAdded: () => void;
  onClose: () => void;
}

export const IncidentSignaturePad: React.FC<IncidentSignaturePadProps> = ({
  reportId,
  onSignatureAdded,
  onClose,
}) => {
  const [signerName, setSignerName] = useState('');
  const [signerRole, setSignerRole] = useState<'cpo' | 'witness' | 'principal' | 'manager'>('cpo');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Set drawing style
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleSave = async () => {
    if (!hasSignature) {
      setError('Please provide a signature');
      return;
    }

    if (!signerName.trim()) {
      setError('Please enter your name');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const canvas = canvasRef.current;
      if (!canvas) throw new Error('Canvas not found');

      const signatureData = canvas.toDataURL('image/png');

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: cpoData } = await supabase
        .from('protection_officers')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (!cpoData) throw new Error('CPO profile not found');

      await incidentService.addSignature(
        reportId,
        signatureData,
        signerRole,
        signerName.trim(),
        cpoData.id
      );

      onSignatureAdded();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save signature');
      console.error('Signature error:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="signature-modal">
      <div className="modal-overlay" onClick={onClose}></div>
      <div className="modal-content">
        <div className="modal-header">
          <h2>Add Signature</h2>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {error && (
            <div className="error-message">{error}</div>
          )}

          <div className="form-group">
            <label>Your Name *</label>
            <input
              type="text"
              value={signerName}
              onChange={(e) => setSignerName(e.target.value)}
              placeholder="Enter your full name"
            />
          </div>

          <div className="form-group">
            <label>Role *</label>
            <select value={signerRole} onChange={(e) => setSignerRole(e.target.value as any)}>
              <option value="cpo">Close Protection Officer</option>
              <option value="witness">Witness</option>
              <option value="principal">Principal</option>
              <option value="manager">Manager</option>
            </select>
          </div>

          <div className="signature-pad-container">
            <label>Signature *</label>
            <canvas
              ref={canvasRef}
              className="signature-canvas"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
            <button className="btn-clear" onClick={clearSignature}>
              Clear
            </button>
          </div>

          <div className="signature-disclaimer">
            <small>
              By signing this document, I certify that the information provided is accurate
              to the best of my knowledge and that this signature is my own.
            </small>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button
            className="btn-save"
            onClick={handleSave}
            disabled={!hasSignature || !signerName.trim() || saving}
          >
            {saving ? 'Saving...' : 'Save Signature'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncidentSignaturePad;
