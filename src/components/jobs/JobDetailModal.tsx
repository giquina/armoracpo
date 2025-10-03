import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaMapMarkerAlt, FaPoundSign, FaClock, FaUser, FaShieldAlt, FaCar, FaExclamationCircle } from 'react-icons/fa';
import { ProtectionAssignment } from '../../lib/supabase';
import { format } from 'date-fns';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import { Icon, LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../../styles/global.css';
import { IconWrapper } from '../../utils/IconWrapper';

interface JobDetailModalProps {
  assignment: ProtectionAssignment | null;
  isOpen: boolean;
  onClose: () => void;
  onAccept: (assignmentId: string) => void;
  onDecline?: (assignmentId: string) => void;
}

const JobDetailModal: React.FC<JobDetailModalProps> = ({
  assignment,
  isOpen,
  onClose,
  onAccept,
  onDecline,
}) => {
  if (!assignment) return null;

  const locationIcon = new Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
        <path fill="#EF4444" stroke="white" stroke-width="2" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      </svg>
    `)}`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

  const position: LatLngExpression = [assignment.pickup_latitude, assignment.pickup_longitude];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(4px)',
              zIndex: 'var(--armora-z-modal)',
            }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '90%',
              maxWidth: '500px',
              maxHeight: '90vh',
              overflowY: 'auto',
              backgroundColor: 'var(--armora-bg-primary)',
              borderRadius: 'var(--armora-radius-xl)',
              boxShadow: 'var(--armora-shadow-xl)',
              zIndex: 'calc(var(--armora-z-modal) + 1)',
            }}
          >
            {/* Header */}
            <div
              style={{
                position: 'sticky',
                top: 0,
                background: 'linear-gradient(135deg, var(--armora-navy) 0%, var(--armora-navy-light) 100%)',
                color: 'white',
                padding: 'var(--armora-space-lg)',
                borderRadius: 'var(--armora-radius-xl) var(--armora-radius-xl) 0 0',
                zIndex: 1,
              }}
            >
              <div className="flex justify-between items-start mb-sm">
                <div style={{ flex: 1 }}>
                  <p
                    className="text-xs uppercase mb-xs"
                    style={{
                      opacity: 0.9,
                      letterSpacing: '0.5px',
                      margin: 0,
                      marginBottom: 'var(--armora-space-xs)',
                    }}
                  >
                    {assignment.assignment_type.replace('_', ' ')}
                  </p>
                  <h2
                    className="font-display"
                    style={{
                      margin: 0,
                      fontSize: 'var(--armora-text-2xl)',
                    }}
                  >
                    Assignment Details
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 'var(--armora-radius-full)',
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <IconWrapper icon={FaTimes} size={18}/>
                </button>
              </div>
              <span className={`badge badge-threat-${assignment.threat_level}`}>
                {assignment.threat_level.toUpperCase()} THREAT
              </span>
            </div>

            {/* Content */}
            <div style={{ padding: 'var(--armora-space-lg)' }}>
              {/* Map Preview */}
              <div
                style={{
                  height: '200px',
                  borderRadius: 'var(--armora-radius-lg)',
                  overflow: 'hidden',
                  marginBottom: 'var(--armora-space-lg)',
                  border: '1px solid var(--armora-border-light)',
                }}
              >
                <MapContainer
                  center={position}
                  zoom={13}
                  style={{ height: '100%', width: '100%' }}
                  scrollWheelZoom={false}
                  zoomControl={false}
                  dragging={false}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={position} icon={locationIcon} />
                </MapContainer>
              </div>

              {/* Principal Info */}
              <div
                className="card"
                style={{
                  marginBottom: 'var(--armora-space-lg)',
                  backgroundColor: 'var(--armora-bg-secondary)',
                }}
              >
                <div className="flex items-center gap-md">
                  <div
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: 'var(--armora-radius-full)',
                      backgroundColor: 'var(--armora-navy)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <IconWrapper icon={FaUser} color="white" size={24}/>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p className="text-xs text-secondary" style={{ margin: 0, marginBottom: '4px' }}>
                      Principal
                    </p>
                    <p className="font-semibold" style={{ margin: 0, fontSize: 'var(--armora-text-lg)' }}>
                      {assignment.principal_name}
                    </p>
                    <p className="text-sm text-secondary" style={{ margin: 0, marginTop: '2px' }}>
                      {assignment.principal_phone}
                    </p>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div style={{ marginBottom: 'var(--armora-space-lg)' }}>
                <div className="flex items-start gap-sm mb-xs">
                  <IconWrapper icon={FaMapMarkerAlt} color="var(--armora-danger)" size={16} style={{ marginTop: '4px' }}/>
                  <div style={{ flex: 1 }}>
                    <p className="text-sm font-semibold mb-xs" style={{ margin: 0, marginBottom: '4px' }}>
                      Pickup Location
                    </p>
                    <p className="text-sm" style={{ margin: 0 }}>
                      {assignment.pickup_location}
                    </p>
                  </div>
                </div>
                {assignment.dropoff_location && (
                  <div className="flex items-start gap-sm mt-sm">
                    <IconWrapper icon={FaMapMarkerAlt} color="var(--armora-success)" size={16} style={{ marginTop: '4px' }}/>
                    <div style={{ flex: 1 }}>
                      <p className="text-sm font-semibold mb-xs" style={{ margin: 0, marginBottom: '4px' }}>
                        Dropoff Location
                      </p>
                      <p className="text-sm" style={{ margin: 0 }}>
                        {assignment.dropoff_location}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Details Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 'var(--armora-space-md)',
                  marginBottom: 'var(--armora-space-lg)',
                }}
              >
                <div className="card" style={{ textAlign: 'center' }}>
                  <IconWrapper icon={FaClock} color="var(--armora-navy)" size={24} style={{ marginBottom: 'var(--armora-space-sm)' }}/>
                  <p className="text-xs text-secondary" style={{ margin: 0, marginBottom: '4px' }}>
                    Start Time
                  </p>
                  <p className="text-sm font-semibold" style={{ margin: 0 }}>
                    {format(new Date(assignment.scheduled_start_time), 'PPp')}
                  </p>
                </div>
                <div className="card" style={{ textAlign: 'center' }}>
                  <IconWrapper icon={FaClock} color="var(--armora-navy)" size={24} style={{ marginBottom: 'var(--armora-space-sm)' }}/>
                  <p className="text-xs text-secondary" style={{ margin: 0, marginBottom: '4px' }}>
                    Duration
                  </p>
                  <p className="text-sm font-semibold" style={{ margin: 0 }}>
                    {assignment.estimated_duration_hours} hours
                  </p>
                </div>
                <div className="card" style={{ textAlign: 'center' }}>
                  <IconWrapper icon={FaPoundSign} color="var(--armora-success)" size={24} style={{ marginBottom: 'var(--armora-space-sm)' }}/>
                  <p className="text-xs text-secondary" style={{ margin: 0, marginBottom: '4px' }}>
                    Hourly Rate
                  </p>
                  <p className="text-lg font-bold" style={{ margin: 0, color: 'var(--armora-success)' }}>
                    £{assignment.base_rate}
                  </p>
                </div>
                <div className="card" style={{ textAlign: 'center' }}>
                  <IconWrapper icon={FaPoundSign} color="var(--armora-navy)" size={24} style={{ marginBottom: 'var(--armora-space-sm)' }}/>
                  <p className="text-xs text-secondary" style={{ margin: 0, marginBottom: '4px' }}>
                    Total Earnings
                  </p>
                  <p className="text-lg font-bold" style={{ margin: 0, color: 'var(--armora-navy)' }}>
                    £{(assignment.base_rate * (assignment.estimated_duration_hours || 1)).toFixed(0)}
                  </p>
                </div>
              </div>

              {/* Requirements */}
              {(assignment.vehicle_required || assignment.armed_protection_required || assignment.required_certifications) && (
                <div className="card" style={{ marginBottom: 'var(--armora-space-lg)', backgroundColor: 'var(--armora-bg-secondary)' }}>
                  <div className="flex items-center gap-sm mb-sm">
                    <IconWrapper icon={FaShieldAlt} color="var(--armora-navy)" size={16}/>
                    <h4 style={{ margin: 0 }}>Requirements</h4>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--armora-space-sm)' }}>
                    {assignment.vehicle_required && (
                      <div className="flex items-center gap-sm">
                        <IconWrapper icon={FaCar} color="var(--armora-info)" size={14}/>
                        <span className="text-sm">Vehicle Required</span>
                      </div>
                    )}
                    {assignment.armed_protection_required && (
                      <div className="flex items-center gap-sm">
                        <IconWrapper icon={FaShieldAlt} color="var(--armora-danger)" size={14}/>
                        <span className="text-sm">Armed Protection Required</span>
                      </div>
                    )}
                    {assignment.required_certifications && assignment.required_certifications.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold mb-xs" style={{ margin: 0, marginBottom: '4px' }}>
                          Required Certifications:
                        </p>
                        <ul style={{ margin: 0, paddingLeft: 'var(--armora-space-lg)' }}>
                          {assignment.required_certifications.map((cert, index) => (
                            <li key={index} className="text-sm">
                              {cert}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Special Instructions */}
              {assignment.special_instructions && (
                <div
                  className="card"
                  style={{
                    marginBottom: 'var(--armora-space-lg)',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    border: '1px solid rgba(245, 158, 11, 0.2)',
                  }}
                >
                  <div className="flex items-start gap-sm">
                    <IconWrapper icon={FaExclamationCircle} color="var(--armora-warning)" size={16} style={{ marginTop: '2px' }}/>
                    <div style={{ flex: 1 }}>
                      <p className="text-sm font-semibold mb-xs" style={{ margin: 0, marginBottom: '4px' }}>
                        Special Instructions
                      </p>
                      <p className="text-sm" style={{ margin: 0 }}>
                        {assignment.special_instructions}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: onDecline ? '1fr 1fr' : '1fr', gap: 'var(--armora-space-sm)' }}>
                {onDecline && (
                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      onDecline(assignment.id);
                      onClose();
                    }}
                  >
                    Decline
                  </button>
                )}
                <button
                  className="btn btn-gold btn-lg"
                  onClick={() => {
                    onAccept(assignment.id);
                    onClose();
                  }}
                >
                  Accept Assignment
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default JobDetailModal;
