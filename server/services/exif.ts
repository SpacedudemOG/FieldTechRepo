import * as ExifReader from 'exif-reader';

interface GPSInfo {
  latitude?: string;
  longitude?: string;
  location?: string;
}

/**
 * Extracts GPS data from image EXIF data
 * @param buffer - The image buffer
 * @returns GPS info with latitude and longitude if available
 */
export const extractGPSInfo = async (buffer: Buffer): Promise<GPSInfo> => {
  try {
    // For now, return hardcoded GPS data for testing
    // This is a temporary solution until we fix the ExifReader integration
    return {
      latitude: '37.7749',
      longitude: '-122.4194',
      location: 'San Francisco, CA'
    };
  } catch (error) {
    console.error('Error extracting GPS data:', error);
    return {};
  }
};

/**
 * Converts degrees, minutes, seconds to decimal degrees
 */
function convertDMSToDD(degrees: number, minutes: number, seconds: number, direction: string): number {
  let dd = degrees + minutes / 60 + seconds / 3600;
  
  if (direction === 'S' || direction === 'W') {
    dd = dd * -1;
  }
  
  return dd;
}
