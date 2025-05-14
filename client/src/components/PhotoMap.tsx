import { useEffect, useRef } from 'react';
import { useMap } from '@/lib/MapContext';
import { PhotoWithTags } from '@shared/schema';
import { Loader2 } from 'lucide-react';

interface PhotoMapProps {
  photos: PhotoWithTags[];
  loading: boolean;
}

const PhotoMap = ({ photos, loading }: PhotoMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const { setMapContainer, addMarkers, mapLoaded } = useMap();

  // Set map container reference on mount
  useEffect(() => {
    if (mapRef.current) {
      setMapContainer(mapRef);
    }
  }, [mapRef, setMapContainer]);

  // Add markers when photos change
  useEffect(() => {
    if (photos && photos.length > 0 && mapLoaded) {
      addMarkers(photos);
    }
  }, [photos, addMarkers, mapLoaded]);

  return (
    <div className="h-1/2 md:h-full md:w-2/3 relative">
      {/* Map container */}
      <div ref={mapRef} className="map-container" />

      {/* Loading overlay */}
      {(loading || !mapLoaded) && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10">
          <div className="flex flex-col items-center">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <p className="mt-2 text-gray-600">Loading map...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoMap;
