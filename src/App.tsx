import React, { useState } from 'react';
import { useGeolocation } from './hooks/useGeolocation';
import { ControlPanel } from './components/ControlPanel';
import { MapPanel } from './components/MapPanel';
import { CoordinatesTable } from './components/CoordinatesTable';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LocationPoint } from './types';
import './App.css';

function App() {
  const {
    locations,
    currentLocation,
    isTracking,
    error,
    countdown,
    startTracking,
    stopTracking,
    clearLocations
  } = useGeolocation();

  const [selectedLocation, setSelectedLocation] = useState<LocationPoint | null>(null);

  return (
    <div className="App">
      <ControlPanel
        isTracking={isTracking}
        countdown={countdown}
        error={error}
        onStartTracking={startTracking}
        onStopTracking={stopTracking}
        onClearLocations={clearLocations}
        locationCount={locations.length}
      />
      
      <div className="main-content">
        <div className="map-panel">
          <ErrorBoundary>
            <MapPanel 
              locations={locations} 
              currentLocation={currentLocation} 
              selectedLocation={selectedLocation}
            />
          </ErrorBoundary>
        </div>
        
        <div className="table-panel">
          <ErrorBoundary>
            <CoordinatesTable 
              locations={locations} 
              currentLocation={currentLocation}
              selectedLocation={selectedLocation}
              onLocationSelect={setSelectedLocation}
            />
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
}

export default App;