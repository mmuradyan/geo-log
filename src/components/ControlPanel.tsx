import React from 'react';

interface ControlPanelProps {
  isTracking: boolean;
  countdown: number;
  error: string | null;
  onStartTracking: () => void;
  onStopTracking: () => void;
  onClearLocations: () => void;
  locationCount: number;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  isTracking,
  countdown,
  error,
  onStartTracking,
  onStopTracking,
  onClearLocations,
  locationCount
}) => {
  return (
    <div style={{ 
      padding: '15px', 
      backgroundColor: '#f8f9fa', 
      borderBottom: '1px solid #dee2e6',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '10px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <h1 style={{ margin: 0, fontSize: '24px', color: '#333' }}>Geo Log</h1>
        
        {isTracking && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px',
            padding: '8px 12px',
            backgroundColor: '#e8f5e8',
            borderRadius: '6px',
            border: '1px solid #c3e6c3'
          }}>
            <span style={{ 
              width: '8px', 
              height: '8px', 
              backgroundColor: '#28a745', 
              borderRadius: '50%',
              animation: 'pulse 1s infinite'
            }}></span>
            <span style={{ fontWeight: 'bold', color: '#155724' }}>
              Next update in: {countdown}s
            </span>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <span style={{ fontSize: '14px', color: '#666' }}>
          {locationCount} points recorded
        </span>
        
        {!isTracking ? (
          <button
            onClick={onStartTracking}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Start Tracking
          </button>
        ) : (
          <button
            onClick={onStopTracking}
            style={{
              padding: '10px 20px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Stop Tracking
          </button>
        )}
        
        <button
          onClick={onClearLocations}
          disabled={locationCount === 0}
          style={{
            padding: '10px 15px',
            backgroundColor: locationCount === 0 ? '#6c757d' : '#ffc107',
            color: locationCount === 0 ? 'white' : '#212529',
            border: 'none',
            borderRadius: '5px',
            cursor: locationCount === 0 ? 'not-allowed' : 'pointer',
            fontWeight: 'bold'
          }}
        >
          Clear Data
        </button>
      </div>

      {error && (
        <div style={{ 
          width: '100%',
          padding: '10px',
          backgroundColor: '#f8d7da',
          border: '1px solid #f5c6cb',
          borderRadius: '5px',
          color: '#721c24',
          fontSize: '14px'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};