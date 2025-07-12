export interface LocationPoint {
  id: string;
  latitude: number;
  longitude: number;
  timestamp: number;
}

export interface GeolocationState {
  locations: LocationPoint[];
  currentLocation: LocationPoint | null;
  isTracking: boolean;
  error: string | null;
  countdown: number;
}