import { LocationPoint } from '../types';

export interface LocationGroup {
  timeRange: string;
  locations: LocationPoint[];
  startTime: number;
  endTime: number;
}

export const groupLocationsByInterval = (locations: LocationPoint[], intervalMinutes: number = 10): LocationGroup[] => {
  if (locations.length === 0) return [];

  const sortedLocations = [...locations].sort((a, b) => a.timestamp - b.timestamp);
  const groups: LocationGroup[] = [];
  const intervalMs = intervalMinutes * 60 * 1000;

  let currentGroupStart = Math.floor(sortedLocations[0].timestamp / intervalMs) * intervalMs;
  let currentGroup: LocationPoint[] = [];

  for (const location of sortedLocations) {
    const locationGroupStart = Math.floor(location.timestamp / intervalMs) * intervalMs;
    
    if (locationGroupStart === currentGroupStart) {
      currentGroup.push(location);
    } else {
      // Finish current group
      if (currentGroup.length > 0) {
        groups.push({
          timeRange: formatTimeRange(currentGroupStart, currentGroupStart + intervalMs),
          locations: currentGroup,
          startTime: currentGroupStart,
          endTime: currentGroupStart + intervalMs
        });
      }
      
      // Start new group
      currentGroupStart = locationGroupStart;
      currentGroup = [location];
    }
  }

  // Add the last group
  if (currentGroup.length > 0) {
    groups.push({
      timeRange: formatTimeRange(currentGroupStart, currentGroupStart + intervalMs),
      locations: currentGroup,
      startTime: currentGroupStart,
      endTime: currentGroupStart + intervalMs
    });
  }

  return groups.reverse(); // Show newest first
};

const formatTimeRange = (startTime: number, endTime: number): string => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString();
  };
  
  const startDateStr = formatDate(start);
  const endDateStr = formatDate(end);
  
  if (startDateStr === endDateStr) {
    return `${startDateStr} ${formatTime(start)} - ${formatTime(end)}`;
  } else {
    return `${startDateStr} ${formatTime(start)} - ${endDateStr} ${formatTime(end)}`;
  }
};

export const getLocationGroupStats = (group: LocationGroup) => {
  const { locations } = group;
  if (locations.length === 0) return null;

  const latitudes = locations.map(loc => loc.latitude);
  const longitudes = locations.map(loc => loc.longitude);
  
  return {
    count: locations.length,
    avgLatitude: latitudes.reduce((sum, lat) => sum + lat, 0) / latitudes.length,
    avgLongitude: longitudes.reduce((sum, lng) => sum + lng, 0) / longitudes.length,
    firstLocation: locations[0],
    lastLocation: locations[locations.length - 1]
  };
};