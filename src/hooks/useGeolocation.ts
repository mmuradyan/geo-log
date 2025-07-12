import { useState, useEffect, useCallback } from 'react';
import { LocationPoint, GeolocationState } from '../types';

const STORAGE_KEY = 'geo-log-locations';

export const useGeolocation = (): GeolocationState & {
  startTracking: () => void;
  stopTracking: () => void;
  clearLocations: () => void;
} => {
  const [locations, setLocations] = useState<LocationPoint[]>([]);
  const [currentLocation, setCurrentLocation] = useState<LocationPoint | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(10);

  // Load locations from localStorage on mount
  useEffect(() => {
    const savedLocations = localStorage.getItem(STORAGE_KEY);
    if (savedLocations) {
      try {
        const parsedLocations: LocationPoint[] = JSON.parse(savedLocations);
        
        // Fix any duplicate IDs from old data
        const fixedLocations = parsedLocations.map((location, index) => ({
          ...location,
          id: `${location.timestamp}-${index}-${Math.random().toString(36).substr(2, 9)}`
        }));
        
        setLocations(fixedLocations);
        
        // Set the most recent location as current if it exists
        if (fixedLocations.length > 0) {
          const mostRecent = fixedLocations[fixedLocations.length - 1];
          setCurrentLocation(mostRecent);
        }
      } catch (e) {
        console.error('Failed to parse saved locations:', e);
      }
    }
  }, []);

  // Save locations to localStorage whenever locations change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(locations));
  }, [locations]);

  // Get current position
  const getCurrentPosition = useCallback((): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      });
    });
  }, []);

  // Add new location point
  const addLocationPoint = useCallback((position: GeolocationPosition) => {
    const timestamp = Date.now();
    const newLocation: LocationPoint = {
      id: `${timestamp}-${Math.random().toString(36).substr(2, 9)}`, // Unique ID
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      timestamp
    };

    setCurrentLocation(newLocation);
    setLocations(prev => [...prev, newLocation]);
    setError(null);
  }, []);

  // Track location
  const trackLocation = useCallback(async () => {
    try {
      const position = await getCurrentPosition();
      addLocationPoint(position);
    } catch (err) {
      console.error('Geolocation error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to get location';
      setError(errorMessage);
      
      // Don't stop tracking on error, just show the error message
      // This allows the app to continue trying to get location
    }
  }, [getCurrentPosition, addLocationPoint]);

  // Countdown timer effect
  useEffect(() => {
    if (!isTracking) return;

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          trackLocation();
          return 10;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isTracking, trackLocation]);

  // Start tracking
  const startTracking = useCallback(() => {
    setIsTracking(true);
    setCountdown(10);
    trackLocation(); // Get initial position immediately
  }, [trackLocation]);

  // Stop tracking
  const stopTracking = useCallback(() => {
    setIsTracking(false);
    setCountdown(10);
  }, []);

  // Clear all locations
  const clearLocations = useCallback(() => {
    setLocations([]);
    setCurrentLocation(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    locations,
    currentLocation,
    isTracking,
    error,
    countdown,
    startTracking,
    stopTracking,
    clearLocations
  };
};