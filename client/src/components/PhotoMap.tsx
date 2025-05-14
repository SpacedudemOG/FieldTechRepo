import { useEffect, useCallback } from 'react';
import { GoogleMap } from '@react-google-maps/api';
import { useMap } from '@/lib/MapContext';
import { PhotoWithTags } from '@shared/schema';
import { Loader2 } from 'lucide-react';

interface PhotoMapProps {
  photos: PhotoWithTags[];
  loading: boolean;
}

// Define map container style
const containerStyle = {
  width: '100%',
  height: '100%'
};

// Define map options
const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: true,
  fullscreenControl: false,
};

// Default center (US)
const defaultCenter = { lat: 37.8, lng: -96 };

const PhotoMap = ({ photos, loading }: PhotoMapProps) => {
  const { isLoaded, addMarkers, mapLoaded } = useMap();
  
  // Setup map
  const onMapLoad = useCallback((map: google.maps.Map) => {
    // Map is loaded
    console.log('Map loaded successfully');
  }, []);

  // Add markers when photos change
  useEffect(() => {
    if (photos && photos.length > 0 && mapLoaded) {
      addMarkers(photos);
    }
  }, [photos, addMarkers, mapLoaded]);

  return (
    <div className="h-screen-minus-header w-full md:w-2/3 relative">
      {/* Google Maps component */}
      {isLoaded ? (
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={defaultCenter}
          zoom={4}
          options={mapOptions}
          onLoad={onMapLoad}
        />
      ) : (
        <div className="map-container bg-gray-100 flex items-center justify-center">
          <p>Loading Google Maps...</p>
        </div>
      )}

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10">
          <div className="flex flex-col items-center">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <p className="mt-2 text-gray-600">Loading photos...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoMap;