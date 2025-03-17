/**
 * Utility functions for working with Kp index data
 */

/**
 * Maps a Kp value to a color
 * @param kpValue Kp index value
 * @returns Color string
 */
export const mapKpToColor = (kpValue: number): string => {
  // Ensure kpValue is a number
  kpValue = Number(kpValue);
  if (isNaN(kpValue)) return 'gray';
  
  kpValue = Math.ceil(kpValue);
  if (kpValue < 5) {
    return '#00b050'; // Green
  } else if (kpValue === 5) {
    return '#ffff00'; // Yellow
  } else if (kpValue === 6) {
    return '#ffc000'; // Orange
  } else if (kpValue === 7) {
    return '#ff0000'; // Red
  } else if (kpValue >= 8 && kpValue <= 9) {
    return '#7f0000'; // Dark red
  } else {
    return '#3f3f3f'; // Dark gray for unknown
  }
};

/**
 * Maps a Kp value to a human-readable description
 * @param kpValue Kp index value
 * @returns Description string
 */
export const mapKpToDescription = (kpValue: number): string => {
  kpValue = Math.ceil(kpValue);
  if (kpValue < 5) {
    return 'No geomagnetic storm';
  } else if (kpValue === 5) {
    return 'Minor geomagnetic storm (G1)';
  } else if (kpValue === 6) {
    return 'Moderate geomagnetic storm (G2)';
  } else if (kpValue === 7) {
    return 'Strong geomagnetic storm (G3)';
  } else if (kpValue === 8) {
    return 'Severe geomagnetic storm (G4)';
  } else if (kpValue === 9) {
    return 'Extreme geomagnetic storm (G5)';
  } else {
    return 'Unknown';
  }
};

/**
 * Maps a Kp value to a NOAA scale
 * @param kpValue Kp index value
 * @returns NOAA scale string
 */
export const mapKpToNoaaScale = (kpValue: number): string => {
  kpValue = Math.ceil(kpValue);
  if (kpValue < 5) {
    return 'G0';
  } else if (kpValue === 5) {
    return 'G1';
  } else if (kpValue === 6) {
    return 'G2';
  } else if (kpValue === 7) {
    return 'G3';
  } else if (kpValue === 8) {
    return 'G4';
  } else if (kpValue === 9) {
    return 'G5';
  } else {
    return 'Unknown';
  }
};

/**
 * Determines if a Kp value indicates storm conditions
 * @param kpValue Kp index value
 * @returns Boolean indicating storm conditions
 */
export const isStormCondition = (kpValue: number): boolean => {
  return kpValue >= 5;
};

/**
 * Gets the aurora visibility latitude based on Kp value
 * @param kpValue Kp index value
 * @returns Approximate latitude where aurora might be visible
 */
export const getAuroraVisibilityLatitude = (kpValue: number): number => {
  // This is a rough approximation based on the Kp value
  // A higher Kp value means auroras can be seen at lower latitudes
  // Kp 9 = ~40 degrees, Kp 1 = ~70 degrees
  return Math.max(40, 70 - ((kpValue - 1) * 3.75));
};

/**
 * Gets information about aurora visibility at a given latitude
 * @param kpValue Kp index value
 * @param latitude Observer's latitude (positive for North, negative for South)
 * @returns Object containing visibility information
 */
export const getAuroraVisibilityInfo = (kpValue: number, latitude: number): {
  visible: boolean;
  message: string;
} => {
  const absLatitude = Math.abs(latitude);
  const visibilityLatitude = getAuroraVisibilityLatitude(kpValue);
  
  const visible = absLatitude >= visibilityLatitude;
  
  let message;
  if (visible) {
    message = `Aurora may be visible at your latitude (${absLatitude.toFixed(1)}°)`;
  } else {
    message = `Aurora is unlikely to be visible at your latitude (${absLatitude.toFixed(1)}°). Typically visible above ${visibilityLatitude.toFixed(1)}° during current conditions.`;
  }
  
  return {
    visible,
    message
  };
};
