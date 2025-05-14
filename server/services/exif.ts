import ExifReader from 'exif-reader';

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
    // Parse EXIF data from the buffer
    const exifData = ExifReader.load(buffer);
    
    if (!exifData?.GPSLatitude || !exifData?.GPSLongitude) {
      return {};
    }

    // Extract GPS coordinates
    const latitudeRef = exifData.GPSLatitudeRef?.value[0] || 'N';
    const longitudeRef = exifData.GPSLongitudeRef?.value[0] || 'E';

    // Convert coordinates to decimal format
    let latitude = convertDMSToDD(
      exifData.GPSLatitude.value[0],
      exifData.GPSLatitude.value[1],
      exifData.GPSLatitude.value[2],
      latitudeRef
    );

    let longitude = convertDMSToDD(
      exifData.GPSLongitude.value[0],
      exifData.GPSLongitude.value[1],
      exifData.GPSLongitude.value[2],
      longitudeRef
    );

    // Format for display
    const latitudeStr = latitude.toFixed(6) + (latitudeRef === 'N' ? '° N' : '° S');
    const longitudeStr = longitude.toFixed(6) + (longitudeRef === 'E' ? '° E' : '° W');
    
    // For MVP, we're returning the coordinates as the location
    // In a production app, we'd use reverse geocoding to get the actual location name
    return {
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      location: `${latitudeStr}, ${longitudeStr}`
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
