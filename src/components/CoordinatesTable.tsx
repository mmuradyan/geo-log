import React, { useState } from 'react';
import { LocationPoint } from '../types';
import { groupLocationsByInterval, getLocationGroupStats } from '../utils/locationUtils';

interface CoordinatesTableProps {
  locations: LocationPoint[];
  currentLocation: LocationPoint | null;
  selectedLocation: LocationPoint | null;
  onLocationSelect: (location: LocationPoint | null) => void;
}

export const CoordinatesTable: React.FC<CoordinatesTableProps> = ({ 
  locations, 
  currentLocation,
  selectedLocation,
  onLocationSelect
}) => {
  const [viewMode, setViewMode] = useState<'grouped' | 'individual'>('grouped');
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set());

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatCoordinate = (coord: number) => {
    return coord.toFixed(6);
  };

  const toggleGroup = (groupIndex: number) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupIndex)) {
      newExpanded.delete(groupIndex);
    } else {
      newExpanded.add(groupIndex);
    }
    setExpandedGroups(newExpanded);
  };

  const locationGroups = groupLocationsByInterval(locations, 10);

  const handleLocationClick = (location: LocationPoint) => {
    if (selectedLocation?.id === location.id) {
      onLocationSelect(null); // Deselect if clicking the same location
    } else {
      onLocationSelect(location);
    }
  };

  const getRowStyle = (location: LocationPoint) => {
    let backgroundColor = 'white';
    if (location.id === selectedLocation?.id) {
      backgroundColor = '#fff3cd'; // Yellow for selected
    } else if (location.id === currentLocation?.id) {
      backgroundColor = '#e3f2fd'; // Blue for current
    }
    return {
      backgroundColor,
      cursor: 'pointer',
      transition: 'background-color 0.2s'
    };
  };

  const renderGroupedView = () => (
    <div style={{ maxHeight: 'calc(100% - 100px)', overflow: 'auto' }}>
      {locationGroups.length === 0 ? (
        <div style={{ 
          padding: '20px', 
          textAlign: 'center',
          color: '#666'
        }}>
          No locations recorded yet. Start tracking to see data.
        </div>
      ) : (
        locationGroups.map((group, groupIndex) => {
          const stats = getLocationGroupStats(group);
          const isExpanded = expandedGroups.has(groupIndex);
          
          return (
            <div key={groupIndex} style={{ marginBottom: '10px' }}>
              {/* Group Header */}
              <div 
                style={{
                  backgroundColor: '#f8f9fa',
                  border: '1px solid #dee2e6',
                  borderRadius: '5px 5px 0 0',
                  padding: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
                onClick={() => toggleGroup(groupIndex)}
              >
                <div>
                  <strong>{group.timeRange}</strong>
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                    {group.locations.length} location{group.locations.length !== 1 ? 's' : ''}
                    {stats && (
                      <span> • Avg: {formatCoordinate(stats.avgLatitude)}, {formatCoordinate(stats.avgLongitude)}</span>
                    )}
                  </div>
                </div>
                <span style={{ fontSize: '18px', color: '#666' }}>
                  {isExpanded ? '−' : '+'}
                </span>
              </div>
              
              {/* Group Details */}
              {isExpanded && (
                <div style={{ 
                  border: '1px solid #dee2e6', 
                  borderTop: 'none',
                  borderRadius: '0 0 5px 5px'
                }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8f9fa' }}>
                        <th style={{ border: '1px solid #dee2e6', padding: '6px', textAlign: 'left' }}>
                          Time
                        </th>
                        <th style={{ border: '1px solid #dee2e6', padding: '6px', textAlign: 'left' }}>
                          Latitude
                        </th>
                        <th style={{ border: '1px solid #dee2e6', padding: '6px', textAlign: 'left' }}>
                          Longitude
                        </th>
                        <th style={{ border: '1px solid #dee2e6', padding: '6px', textAlign: 'center' }}>
                          Current
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.locations.reverse().map((location) => (
                        <tr 
                          key={location.id}
                          style={getRowStyle(location)}
                          onClick={() => handleLocationClick(location)}
                          onMouseEnter={(e) => {
                            if (location.id !== selectedLocation?.id && location.id !== currentLocation?.id) {
                              e.currentTarget.style.backgroundColor = '#f8f9fa';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (location.id !== selectedLocation?.id && location.id !== currentLocation?.id) {
                              e.currentTarget.style.backgroundColor = 'white';
                            }
                          }}
                        >
                          <td style={{ border: '1px solid #dee2e6', padding: '6px' }}>
                            {new Date(location.timestamp).toLocaleTimeString()}
                          </td>
                          <td style={{ border: '1px solid #dee2e6', padding: '6px', fontFamily: 'monospace' }}>
                            {formatCoordinate(location.latitude)}
                          </td>
                          <td style={{ border: '1px solid #dee2e6', padding: '6px', fontFamily: 'monospace' }}>
                            {formatCoordinate(location.longitude)}
                          </td>
                          <td style={{ border: '1px solid #dee2e6', padding: '6px', textAlign: 'center' }}>
                            {location.id === currentLocation?.id && (
                              <span style={{ color: '#d32f2f', fontWeight: 'bold' }}>●</span>
                            )}
                            {location.id === selectedLocation?.id && (
                              <span style={{ color: '#ffc107', fontWeight: 'bold' }}>⭐</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );

  const renderIndividualView = () => (
    <div style={{ maxHeight: 'calc(100% - 100px)', overflow: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
        <thead>
          <tr style={{ backgroundColor: '#f5f5f5', position: 'sticky', top: 0 }}>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>
              Time
            </th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>
              Latitude
            </th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>
              Longitude
            </th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>
              Current
            </th>
          </tr>
        </thead>
        <tbody>
          {locations.length === 0 ? (
            <tr>
              <td 
                colSpan={4} 
                style={{ 
                  border: '1px solid #ddd', 
                  padding: '20px', 
                  textAlign: 'center',
                  color: '#666'
                }}
              >
                No locations recorded yet. Start tracking to see data.
              </td>
            </tr>
          ) : (
            [...locations].reverse().map((location, index) => (
              <tr 
                key={location.id}
                style={getRowStyle(location)}
                onClick={() => handleLocationClick(location)}
                onMouseEnter={(e) => {
                  if (location.id !== selectedLocation?.id && location.id !== currentLocation?.id) {
                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                  }
                }}
                onMouseLeave={(e) => {
                  if (location.id !== selectedLocation?.id && location.id !== currentLocation?.id) {
                    e.currentTarget.style.backgroundColor = 'white';
                  }
                }}
              >
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  {formatTime(location.timestamp)}
                </td>
                <td style={{ border: '1px solid #ddd', padding: '8px', fontFamily: 'monospace' }}>
                  {formatCoordinate(location.latitude)}
                </td>
                <td style={{ border: '1px solid #ddd', padding: '8px', fontFamily: 'monospace' }}>
                  {formatCoordinate(location.longitude)}
                </td>
                <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>
                  {location.id === currentLocation?.id && (
                    <span style={{ color: '#d32f2f', fontWeight: 'bold' }}>●</span>
                  )}
                  {location.id === selectedLocation?.id && (
                    <span style={{ color: '#ffc107', fontWeight: 'bold' }}>⭐</span>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div style={{ height: '100%', overflow: 'auto', padding: '10px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '15px'
      }}>
        <h3 style={{ margin: 0 }}>
          Location History ({locations.length} points)
        </h3>
        
        <div style={{ display: 'flex', gap: '5px' }}>
          <button
            onClick={() => setViewMode('grouped')}
            style={{
              padding: '5px 10px',
              backgroundColor: viewMode === 'grouped' ? '#007bff' : '#f8f9fa',
              color: viewMode === 'grouped' ? 'white' : '#333',
              border: '1px solid #dee2e6',
              borderRadius: '3px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Grouped
          </button>
          <button
            onClick={() => setViewMode('individual')}
            style={{
              padding: '5px 10px',
              backgroundColor: viewMode === 'individual' ? '#007bff' : '#f8f9fa',
              color: viewMode === 'individual' ? 'white' : '#333',
              border: '1px solid #dee2e6',
              borderRadius: '3px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Individual
          </button>
        </div>
      </div>

      {viewMode === 'grouped' ? renderGroupedView() : renderIndividualView()}
    </div>
  );
};