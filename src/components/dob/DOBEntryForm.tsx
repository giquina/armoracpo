import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { dobService } from '../../services/dobService';
import { DOBEventType } from '../../types';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import './DOBEntryForm.css';

interface DOBEntryFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  cpoId: string;
  assignmentId?: string;
  assignmentReference?: string;
}

export const DOBEntryForm: React.FC<DOBEntryFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
  cpoId,
  assignmentId,
  assignmentReference,
}) => {
  const [eventType, setEventType] = useState<DOBEventType>('manual_note');
  const [description, setDescription] = useState('');
  const [timestamp, setTimestamp] = useState('');
  const [captureGPS, setCaptureGPS] = useState(true);
  const [gpsLocation, setGpsLocation] = useState<{
    latitude: number;
    longitude: number;
    accuracy: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Initialize timestamp to current time
  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      // Format for datetime-local input: YYYY-MM-DDTHH:MM
      const formatted = now.toISOString().slice(0, 16);
      setTimestamp(formatted);
    }
  }, [isOpen]);

  // Capture GPS location when form opens
  useEffect(() => {
    if (isOpen && captureGPS) {
      captureCurrentLocation();
    }
  }, [isOpen, captureGPS]);

  const captureCurrentLocation = async () => {
    try {
      const location = await dobService.getCurrentLocation();
      if (location) {
        setGpsLocation(location);
      }
    } catch (err) {
      console.error('[DOBEntryForm] GPS capture error:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!eventType || !description || !timestamp) {
      setError('Please fill in all required fields');
      return;
    }

    // Validate timestamp is not in the future
    const selectedTime = new Date(timestamp);
    const now = new Date();
    if (selectedTime > now) {
      setError('Timestamp cannot be in the future');
      return;
    }

    setLoading(true);

    try {
      await dobService.createDOBEntry(
        {
          assignmentId,
          assignmentReference,
          cpoId,
          entryType: 'manual',
          eventType,
          timestamp: selectedTime.toISOString(),
          gpsCoordinates: captureGPS ? gpsLocation || undefined : undefined,
          description,
          metadata: {
            manualEntry: true,
            createdViaForm: true,
          },
          isImmutable: true, // Manual entries are immediately immutable
        },
        cpoId
      );

      setSuccess(true);
      setTimeout(() => {
        handleClose();
        onSuccess();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to create DOB entry');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEventType('manual_note');
    setDescription('');
    setTimestamp('');
    setGpsLocation(null);
    setCaptureGPS(true);
    setError(null);
    setSuccess(false);
    onClose();
  };

  const eventTypeOptions: { value: DOBEventType; label: string }[] = [
    { value: 'manual_note', label: 'Manual Note' },
    { value: 'communication', label: 'Communication' },
    { value: 'location_change', label: 'Location Change' },
    { value: 'route_deviation', label: 'Route Deviation' },
    { value: 'incident', label: 'Incident' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add DOB Entry">
      <form onSubmit={handleSubmit} className="dob-entry-form">
        {/* Event Type */}
        <div className="dob-form-field">
          <label htmlFor="eventType" className="dob-form-label">
            Event Type <span className="required">*</span>
          </label>
          <select
            id="eventType"
            value={eventType}
            onChange={(e) => setEventType(e.target.value as DOBEventType)}
            className="dob-form-select"
            required
          >
            {eventTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Timestamp */}
        <div className="dob-form-field">
          <label htmlFor="timestamp" className="dob-form-label">
            Date & Time <span className="required">*</span>
          </label>
          <input
            type="datetime-local"
            id="timestamp"
            value={timestamp}
            onChange={(e) => setTimestamp(e.target.value)}
            max={new Date().toISOString().slice(0, 16)}
            className="dob-form-input"
            required
          />
          <p className="dob-form-hint">Cannot be in the future</p>
        </div>

        {/* GPS Capture Toggle */}
        <div className="dob-form-field dob-form-checkbox">
          <label className="dob-checkbox-label">
            <input
              type="checkbox"
              checked={captureGPS}
              onChange={(e) => {
                setCaptureGPS(e.target.checked);
                if (e.target.checked) {
                  captureCurrentLocation();
                }
              }}
              className="dob-checkbox-input"
            />
            <span>Capture GPS coordinates</span>
          </label>
          {captureGPS && gpsLocation && (
            <p className="dob-gps-status">
              Location captured: {gpsLocation.latitude.toFixed(6)},{' '}
              {gpsLocation.longitude.toFixed(6)} (±{gpsLocation.accuracy.toFixed(0)}m)
            </p>
          )}
        </div>

        {/* Assignment Reference (if applicable) */}
        {assignmentReference && (
          <div className="dob-form-field">
            <label className="dob-form-label">Assignment</label>
            <div className="dob-assignment-badge">{assignmentReference}</div>
          </div>
        )}

        {/* Description */}
        <div className="dob-form-field">
          <label htmlFor="description" className="dob-form-label">
            Description <span className="required">*</span>
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="dob-form-textarea"
            placeholder="Provide a detailed description of the occurrence..."
            rows={6}
            required
            maxLength={1000}
          />
          <p className="dob-form-hint">
            {description.length}/1000 characters
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="dob-form-error"
          >
            {error}
          </motion.div>
        )}

        {/* Success Message */}
        {success && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="dob-form-success"
          >
            ✓ DOB entry created successfully
          </motion.div>
        )}

        {/* Immutability Warning */}
        <div className="dob-immutability-warning">
          <svg
            className="dob-warning-icon"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <p>
            Once submitted, this entry <strong>cannot be edited or deleted</strong>.
            Please ensure all information is accurate.
          </p>
        </div>

        {/* Form Actions */}
        <div className="dob-form-actions">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            disabled={loading || success}
          >
            Submit Entry
          </Button>
        </div>
      </form>
    </Modal>
  );
};
