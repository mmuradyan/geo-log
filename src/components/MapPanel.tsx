import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { LocationPoint } from '../types';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;

// Create default icon
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Set default icon for all markers
L.Marker.prototype.options.icon = defaultIcon;

// Custom icon for current location
const currentLocationIcon = L.icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
      <path fill="#dc3545" stroke="#fff" stroke-width="2" d="M12.5 0C19.404 0 25 5.596 25 12.5c0 6.904-12.5 28.5-12.5 28.5S0 19.404 0 12.5C0 5.596 5.596 0 12.5 0z"/>
      <circle fill="#fff" cx="12.5" cy="12.5" r="6"/>
    </svg>
  `),
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Custom icon for selected location
const selectedLocationIcon = L.icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
      <path fill="#ffc107" stroke="#000" stroke-width="2" d="M12.5 0C19.404 0 25 5.596 25 12.5c0 6.904-12.5 28.5-12.5 28.5S0 19.404 0 12.5C0 5.596 5.596 0 12.5 0z"/>
      <circle fill="#000" cx="12.5" cy="12.5" r="6"/>
    </svg>
  `),
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to handle map centering
const MapUpdater: React.FC<{ center: [number, number]; locations: LocationPoint[] }> = ({ center, locations }) => {
  const map = useMap();

  useEffect(() => {
    if (locations.length > 0) {
      map.setView(center, 15);
    }
  }, [map, center, locations.length]);

  return null;
};

interface MapPanelProps {
  locations: LocationPoint[];
  currentLocation: LocationPoint | null;
  selectedLocation: LocationPoint | null;
}

export const MapPanel: React.FC<MapPanelProps> = ({ locations, currentLocation, selectedLocation }) => {
  // Default center (fallback)
  const defaultCenter: [number, number] = [40.7128, -74.0060]; // New York
  
  // Use selected location, current location, or last location as center, or default
  const center: [number, number] = selectedLocation
    ? [selectedLocation.latitude, selectedLocation.longitude]
    : currentLocation 
    ? [currentLocation.latitude, currentLocation.longitude]
    : locations.length > 0 
    ? [locations[locations.length - 1].latitude, locations[locations.length - 1].longitude]
    : defaultCenter;

  // Create path from all locations
  const path: [number, number][] = locations.map(loc => [loc.latitude, loc.longitude]);

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div style={{ height: '100%', width: '100%' }}>
      {/* Show message if no locations yet */}
      {locations.length === 0 ? (
        <div style={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f8f9fa',
          color: '#666',
          fontSize: '16px'
        }}>
          Start tracking to see your location on the map
        </div>
      ) : (
        <MapContainer
          center={center}
          zoom={15}
          style={{ height: '100%', width: '100%' }}
          key={`map-${locations.length}`} // Force re-render when locations change
        >
          <MapUpdater center={center} locations={locations} />
          
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Draw path between points */}
          {path.length > 1 && (
            <Polyline
              positions={path}
              color="blue"
              weight={3}
              opacity={0.7}
            />
          )}
          
          {/* Render all location markers */}
          {locations.map((location, index) => {
            let icon = defaultIcon;
            let label = `Point ${index + 1}`;
            
            if (location.id === currentLocation?.id) {
              icon = currentLocationIcon;
              label = 'Current Location';
            } else if (location.id === selectedLocation?.id) {
              icon = selectedLocationIcon;
              label = 'Selected Location';
            }
            
            return (
              <Marker
                key={location.id}
                position={[location.latitude, location.longitude]}
                icon={icon}
              >
                <Popup>
                  <div>
                    <strong>{label}</strong><br />
                    Lat: {location.latitude.toFixed(6)}<br />
                    Lng: {location.longitude.toFixed(6)}<br />
                    Time: {formatTime(location.timestamp)}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      )}
    </div>
  );
};