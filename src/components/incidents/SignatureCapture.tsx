import React, { useRef, useState, useEffect } from 'react';
import { IncidentSignature } from '../../types';
import './SignatureCapture.css';

interface SignatureCaptureProps {
  onCapture: (signature: IncidentSignature) => void;
  userId: string;
  userName: string;
  role: 'cpo' | 'witness' | 'principal' | 'manager';
  statement?: string;
  existingSignature?: IncidentSignature;
}

export const SignatureCapture: React.FC<SignatureCaptureProps> = ({
  onCapture,
  userId,
  userName,
  role,
  statement = 'I certify that this report is accurate to the best of my knowledge',
  existingSignature,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);
  const [signatureData, setSignatureData] = useState<string | null>(
    existingSignature?.signatureData || null
  );
  const [location, setLocation] = useState<GeolocationPosition | null>(null);

  useEffect(() => {
    // Get current location for signature verification
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => setLocation(position),
        (error) => console.error('Location error:', error),
        { enableHighAccuracy: true }
      );
    }

    // Set up canvas
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#0A1F44'; // Navy color
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }

      // If there's an existing signature, display it
      if (existingSignature) {
        const img = new Image();
        img.onload = () => {
          ctx?.drawImage(img, 0, 0);
        };
        img.src = existingSignature.signatureData;
      }
    }
  }, [existingSignature]);

  // Get device IP address (approximation)
  const getIPAddress = async (): Promise<string> => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.error('IP fetch error:', error);
      return 'Unknown';
    }
  };

  // Get device information
  const getDeviceInfo = (): string => {
    const ua = navigator.userAgent;
    if (/iPhone|iPad|iPod/.test(ua)) {
      return 'iOS Device';
    } else if (/Android/.test(ua)) {
      return 'Android Device';
    } else if (/Windows/.test(ua)) {
      return 'Windows Device';
    } else if (/Mac/.test(ua)) {
      return 'Mac';
    }
    return 'Unknown Device';
  };

  // Start drawing
  const startDrawing = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    setIsDrawing(true);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in event
      ? event.touches[0].clientX - rect.left
      : event.clientX - rect.left;
    const y = 'touches' in event
      ? event.touches[0].clientY - rect.top
      : event.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsEmpty(false);
  };

  // Draw
  const draw = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    event.preventDefault();

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in event
      ? event.touches[0].clientX - rect.left
      : event.clientX - rect.left;
    const y = 'touches' in event
      ? event.touches[0].clientY - rect.top
      : event.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  // Stop drawing
  const stopDrawing = () => {
    setIsDrawing(false);
  };

  // Clear signature
  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setIsEmpty(true);
    setSignatureData(null);
  };

  // Save signature
  const saveSignature = async () => {
    if (isEmpty) {
      alert('Please provide a signature before saving');
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Convert canvas to base64 data URL
    const dataUrl = canvas.toDataURL('image/png');
    setSignatureData(dataUrl);

    // Get IP address
    const ipAddress = await getIPAddress();

    // Create signature object
    const signature: IncidentSignature = {
      id: `sig-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      signatureData: dataUrl,
      signedBy: {
        userId,
        userName,
        role,
      },
      signedAt: new Date().toISOString(),
      ipAddress,
      location: location
        ? {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy,
          }
        : {
            latitude: 0,
            longitude: 0,
            accuracy: 0,
          },
      deviceInfo: getDeviceInfo(),
      statement,
    };

    onCapture(signature);
  };

  return (
    <div className="signature-capture">
      <div className="signature-header">
        <h4 className="signature-title">Digital Signature</h4>
        <p className="signature-subtitle">Sign below to certify this report</p>
      </div>

      <div className="signature-statement">
        <p className="statement-text">{statement}</p>
      </div>

      <div className="signature-pad-container">
        <canvas
          ref={canvasRef}
          width={600}
          height={200}
          className="signature-pad"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        {isEmpty && !signatureData && (
          <div className="signature-placeholder">
            <p>Sign here</p>
          </div>
        )}
      </div>

      <div className="signature-actions">
        <button
          type="button"
          className="btn-clear"
          onClick={clearSignature}
          disabled={isEmpty && !signatureData}
        >
          Clear
        </button>
        <button
          type="button"
          className="btn-save"
          onClick={saveSignature}
          disabled={isEmpty}
        >
          Save Signature
        </button>
      </div>

      {signatureData && (
        <div className="signature-confirmation">
          <div className="confirmation-icon">✓</div>
          <div className="confirmation-details">
            <p className="confirmation-text">
              <strong>Signed by:</strong> {userName} ({role.toUpperCase()})
            </p>
            <p className="confirmation-text">
              <strong>Date:</strong> {new Date().toLocaleString()}
            </p>
            {location && (
              <p className="confirmation-text">
                <strong>Location:</strong> {location.coords.latitude.toFixed(6)},{' '}
                {location.coords.longitude.toFixed(6)} (±{location.coords.accuracy.toFixed(0)}m)
              </p>
            )}
            <p className="confirmation-text">
              <strong>Device:</strong> {getDeviceInfo()}
            </p>
          </div>
        </div>
      )}

      <div className="signature-legal-notice">
        <p className="legal-text">
          <strong>Legal Notice:</strong> By signing electronically, you agree that your electronic signature is the legal equivalent of your manual signature. This signature is legally binding and will be used for verification purposes.
        </p>
      </div>
    </div>
  );
};
