import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { Icon, LatLngExpression } from 'leaflet';
import { ProtectionAssignment } from '../../lib/supabase';
import { FaMapMarkerAlt, FaPoundSign, FaClock } from 'react-icons/fa';
import 'leaflet/dist/leaflet.css';
import '../../styles/global.css';
import { IconWrapper } from '../../utils/IconWrapper';

interface JobsMapProps {
  jobs: ProtectionAssignment[];
  currentLocation?: { lat: number; lng: number };
  onJobSelect: (assignmentId: string) => void;
}

const JobsMap: React.FC<JobsMapProps> = ({
  jobs,
  currentLocation = { lat: 51.5074, lng: -0.1278 }, // Default to London
  onJobSelect,
}) => {

  // Create custom icons based on threat level
  const createThreatIcon = (threatLevel: string) => {
    const colors = {
      low: '#10B981',
      medium: '#F59E0B',
      high: '#EF4444',
      critical: '#DC2626',
    };

    const color = colors[threatLevel as keyof typeof colors] || '#6B7280';

    return new Icon({
      iconUrl: `data:image/svg+xml;base64,${btoa(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
          <path fill="${color}" stroke="white" stroke-width="2" d="M12 2L2 22h20L12 2z"/>
          <circle cx="12" cy="16" r="2" fill="white"/>
        </svg>
      `)}`,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    });
  };

  // Current location icon
  const currentLocationIcon = new Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
        <circle cx="12" cy="12" r="8" fill="#0A1F44" stroke="white" stroke-width="3"/>
        <circle cx="12" cy="12" r="3" fill="white"/>
      </svg>
    `)}`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });

  const center: LatLngExpression = [currentLocation.lat, currentLocation.lng];

  return (
    <div
      style={{
        height: '400px',
        borderRadius: 'var(--armora-radius-lg)',
        overflow: 'hidden',
        border: '1px solid var(--armora-border-light)',
        boxShadow: 'var(--armora-shadow-md)',
      }}
    >
      <MapContainer
        center={center}
        zoom={11}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Current Location Marker */}
        <Marker position={center} icon={currentLocationIcon}>
          <Popup>
            <div style={{ padding: 'var(--armora-space-xs)' }}>
              <p className="text-sm font-semibold" style={{ margin: 0 }}>
                Your Location
              </p>
            </div>
          </Popup>
        </Marker>

        {/* 10km radius circle */}
        <Circle
          center={center}
          radius={10000}
          pathOptions={{
            color: 'rgba(10, 31, 68, 0.3)',
            fillColor: 'rgba(10, 31, 68, 0.05)',
            fillOpacity: 0.5,
          }}
        />

        {/* Job Markers */}
        {jobs.map((job) => {
          const position: LatLngExpression = [job.pickup_latitude, job.pickup_longitude];
          const icon = createThreatIcon(job.threat_level);

          return (
            <Marker
              key={job.id}
              position={position}
              icon={icon}
              eventHandlers={{
                click: () => {
                  onJobSelect(job.id);
                },
              }}
            >
              <Popup>
                <div
                  style={{
                    padding: 'var(--armora-space-sm)',
                    minWidth: '200px',
                  }}
                >
                  <p
                    className="text-xs font-semibold uppercase text-secondary mb-xs"
                    style={{ margin: 0, marginBottom: 'var(--armora-space-xs)', letterSpacing: '0.5px' }}
                  >
                    {job.assignment_type.replace('_', ' ')}
                  </p>

                  <div className="flex items-start gap-xs mb-sm">
                    <IconWrapper icon={FaMapMarkerAlt} color="var(--armora-danger)" size={12} style={{ marginTop: '2px' }}/>
                    <p className="text-sm font-medium" style={{ margin: 0 }}>
                      {job.pickup_location}
                    </p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--armora-space-sm)', marginBottom: 'var(--armora-space-sm)' }}>
                    <div>
                      <p className="text-xs text-secondary" style={{ margin: 0, marginBottom: '2px' }}>
                        Rate
                      </p>
                      <div className="flex items-center gap-xs">
                        <IconWrapper icon={FaPoundSign} color="var(--armora-success)" size={10}/>
                        <span className="text-sm font-bold" style={{ color: 'var(--armora-success)' }}>
                          {job.base_rate}/hr
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-secondary" style={{ margin: 0, marginBottom: '2px' }}>
                        Duration
                      </p>
                      <div className="flex items-center gap-xs">
                        <IconWrapper icon={FaClock} color="var(--armora-text-secondary)" size={10}/>
                        <span className="text-sm font-semibold">
                          {job.estimated_duration_hours}h
                        </span>
                      </div>
                    </div>
                  </div>

                  <span className={`badge badge-threat-${job.threat_level}`} style={{ fontSize: '10px', padding: '2px 6px' }}>
                    {job.threat_level.toUpperCase()}
                  </span>

                  <button
                    className="btn btn-primary"
                    style={{
                      width: '100%',
                      marginTop: 'var(--armora-space-sm)',
                      padding: 'var(--armora-space-sm)',
                      fontSize: 'var(--armora-text-xs)',
                    }}
                    onClick={() => onJobSelect(job.id)}
                  >
                    View Details
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default JobsMap;
