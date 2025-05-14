import { useEffect, useRef, useState } from 'react';
import { PhotoWithTags } from '@shared/schema';
import { Loader2 } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Map } from 'leaflet';

// Fix for missing marker icons in Leaflet with React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface PhotoMapProps {
  photos: PhotoWithTags[];
  loading: boolean;
  onPhotoClick?: (photo: PhotoWithTags) => void;
}

const StaticPhotoMap = ({ photos, loading, onPhotoClick }: PhotoMapProps) => {
  const mapRef = useRef<Map>(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  
  // Calculate map center from photos
  const getMapCenter = () => {
    if (!photos || photos.length === 0) {
      return [37.7749, -122.4194]; // Default to San Francisco
    }
    
    // Find photos with valid coordinates
    const validPhotos = photos.filter(p => p.latitude && p.longitude);
    if (validPhotos.length === 0) {
      return [37.7749, -122.4194]; // Default to San Francisco
    }
    
    // Calculate average position
    const latSum = validPhotos.reduce((sum, photo) => 
      sum + parseFloat(photo.latitude || "0"), 0);
    const lngSum = validPhotos.reduce((sum, photo) => 
      sum + parseFloat(photo.longitude || "0"), 0);
    
    return [latSum / validPhotos.length, lngSum / validPhotos.length];
  };

  const center = getMapCenter();
  
  // Fit bounds to contain all markers when photos change
  useEffect(() => {
    if (mapRef.current && mapInitialized && photos.length > 0) {
      const validPhotos = photos.filter(p => p.latitude && p.longitude);
      
      if (validPhotos.length > 0) {
        const bounds = L.latLngBounds(
          validPhotos.map(photo => [
            parseFloat(photo.latitude || "0"), 
            parseFloat(photo.longitude || "0")
          ])
        );
        
        mapRef.current.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [photos, mapInitialized]);

  return (
    <div className="h-screen-minus-header w-full md:w-2/3 relative">
      <div className="h-full flex flex-col">
        {/* Map Header */}
        <div className="bg-white p-3 border-b">
          <h3 className="text-lg font-semibold">Field Technician Photo Locations</h3>
          <p className="text-sm text-gray-500">
            {photos.filter(p => p.latitude && p.longitude).length} photos with GPS coordinates
          </p>
        </div>
        
        {/* Map Container */}
        <div className="flex-1 relative">
          <MapContainer
            center={center as [number, number]}
            zoom={10}
            style={{ height: '100%', width: '100%' }}
            ref={mapRef}
            whenReady={() => {
              setMapInitialized(true);
            }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Photo Markers */}
            {photos.filter(p => p.latitude && p.longitude).map(photo => (
              <Marker 
                key={photo.id} 
                position={[
                  parseFloat(photo.latitude || "0"), 
                  parseFloat(photo.longitude || "0")
                ]}
              >
                <Popup>
                  <div className="p-1">
                    <h4 className="font-medium text-sm">{photo.title}</h4>
                    {photo.location && (
                      <p className="text-xs text-gray-600 mt-1">{photo.location}</p>
                    )}
                    <button 
                      className="mt-2 text-xs text-primary hover:underline"
                      onClick={() => onPhotoClick && onPhotoClick(photo)}
                    >
                      View Details
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
        
        {/* Photo List beneath map on mobile */}
        <div className="md:hidden bg-white border-t p-3 overflow-auto max-h-[200px]">
          <h4 className="font-medium text-sm mb-2">Photo List</h4>
          {photos && photos.length > 0 ? (
            <div className="space-y-2">
              {photos.filter(p => p.latitude && p.longitude).map(photo => (
                <div 
                  key={photo.id} 
                  className="flex items-center text-sm p-2 bg-blue-50 rounded cursor-pointer hover:bg-blue-100 transition-colors"
                  onClick={() => onPhotoClick && onPhotoClick(photo)}
                >
                  <div className="h-6 w-6 bg-primary rounded-full flex items-center justify-center text-white mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path>
                      <circle cx="12" cy="13" r="3"></circle>
                    </svg>
                  </div>
                  <span className="flex-1 truncate">{photo.title}</span>
                  <span className="text-xs text-gray-500 ml-2">
                    {photo.location || `${photo.latitude?.slice(0, 6)}, ${photo.longitude?.slice(0, 6)}`}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm italic text-center text-gray-400">No photos with coordinates available</p>
          )}
        </div>
      </div>

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-[999]">
          <div className="flex flex-col items-center">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <p className="mt-2 text-gray-600">Loading photos...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaticPhotoMap;