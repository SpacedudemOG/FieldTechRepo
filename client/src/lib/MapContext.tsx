import { createContext, useContext, useState, ReactNode, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, InfoWindow } from '@react-google-maps/api';
import { PhotoWithTags } from '@shared/schema';

// Define map options
const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: true,
  fullscreenControl: false,
};

// Define center for US
const defaultCenter = { lat: 37.8, lng: -96 };
const defaultZoom = 4;

// Define interface for the context
interface MapContextValue {
  isLoaded: boolean;
  addMarkers: (photos: PhotoWithTags[]) => void;
  flyToPhoto: (photo: PhotoWithTags) => void;
  mapLoaded: boolean;
  mapContainer: null; // Kept for compatibility
  setMapContainer: () => void; // Kept for compatibility
  map: any; // Kept for compatibility
}

// Create the context
const MapContext = createContext<MapContextValue>({
  isLoaded: false,
  addMarkers: () => {},
  flyToPhoto: () => {},
  mapLoaded: false,
  mapContainer: null,
  setMapContainer: () => {},
  map: null,
});

// Hook to use the map context
export const useMap = () => useContext(MapContext);

// Provider component
export const MapContextProvider = ({ children }: { children: ReactNode }) => {
  // Load the Google Maps API with the key from server
  const [apiKey, setApiKey] = useState<string>('');
  
  // Fetch the API key from server
  useEffect(() => {
    fetch('/api/map-key')
      .then(res => res.text())
      .then(key => {
        console.log('API key loaded');
        setApiKey(key);
      })
      .catch(err => console.error('Failed to load map API key:', err));
  }, []);
  
  // Load the API once we have the key
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey,
  });

  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [activeMarkers, setActiveMarkers] = useState<google.maps.Marker[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoWithTags | null>(null);

  // Set map loaded status when the map is ready
  const onMapLoad = useCallback((map: google.maps.Map) => {
    setMapInstance(map);
    setMapLoaded(true);
    console.log('Google Maps loaded successfully');
  }, []);

  // Add markers to map for each photo with coordinates
  const addMarkers = useCallback((photos: PhotoWithTags[]) => {
    if (!mapInstance) return;

    // Clear existing markers
    activeMarkers.forEach(marker => marker.setMap(null));
    setActiveMarkers([]);

    // Filter photos with valid coordinates
    const photosWithCoords = photos.filter(photo => photo.latitude && photo.longitude);
    
    if (photosWithCoords.length === 0) return;

    // Create bounds to fit all markers
    const bounds = new google.maps.LatLngBounds();
    
    // Create new markers
    const newMarkers = photosWithCoords.map(photo => {
      // Parse coordinates
      const lat = photo.latitude ? parseFloat(photo.latitude) : 0;
      const lng = photo.longitude ? parseFloat(photo.longitude) : 0;
      const position = { lat, lng };
      
      // Add position to bounds
      bounds.extend(position);
      
      // Create marker
      const marker = new google.maps.Marker({
        position,
        map: mapInstance,
        title: photo.title,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: '#3b82f6', // Primary color
          fillOpacity: 1,
          strokeWeight: 1,
          strokeColor: '#ffffff',
          scale: 10,
        }
      });
      
      // Add click listener to show info window
      marker.addListener('click', () => {
        setSelectedPhoto(photo);
      });
      
      return marker;
    });
    
    // Set active markers
    setActiveMarkers(newMarkers);
    
    // Fit map to bounds
    mapInstance.fitBounds(bounds);
    
    // Adjust zoom if too close
    const listener = google.maps.event.addListener(mapInstance, 'idle', () => {
      try {
        const zoom = mapInstance.getZoom() as number | undefined;
        if (zoom && zoom > 16) {
          mapInstance.setZoom(16);
        }
        google.maps.event.removeListener(listener);
      } catch (e) {
        console.error('Error handling map zoom', e);
      }
    });
  }, [mapInstance, activeMarkers]);

  // Fly to a specific photo
  const flyToPhoto = useCallback((photo: PhotoWithTags) => {
    if (!mapInstance || !photo.latitude || !photo.longitude) return;
    
    const lat = photo.latitude ? parseFloat(photo.latitude) : 0;
    const lng = photo.longitude ? parseFloat(photo.longitude) : 0;
    
    mapInstance.panTo({ lat, lng });
    mapInstance.setZoom(14);
    
    // Find and show info window for this photo
    const marker = activeMarkers.find(marker => {
      const position = marker.getPosition();
      return position && position.lat() === lat && position.lng() === lng;
    });
    
    if (marker) {
      setSelectedPhoto(photo);
    }
  }, [mapInstance, activeMarkers]);

  // These are kept for compatibility with the existing code
  const setMapContainer = useCallback(() => {}, []);

  return (
    <MapContext.Provider value={{
      isLoaded,
      addMarkers,
      flyToPhoto,
      mapLoaded,
      // Compatibility with previous implementation
      mapContainer: null,
      setMapContainer,
      map: mapInstance,
    }}>
      {children}
      
      {/* Info window for selected photo */}
      {isLoaded && mapInstance && selectedPhoto && (
        <InfoWindow
          position={{
            lat: parseFloat(selectedPhoto.latitude || '0'),
            lng: parseFloat(selectedPhoto.longitude || '0')
          }}
          onCloseClick={() => setSelectedPhoto(null)}
        >
          <div className="p-2 max-w-xs">
            <h3 className="font-bold mb-1">{selectedPhoto.title}</h3>
            <p className="text-xs text-gray-600 mb-2">
              {new Date(selectedPhoto.uploadedAt).toLocaleDateString()}
            </p>
            {selectedPhoto.tags && selectedPhoto.tags.length > 0 && (
              <div className="mt-1">
                <p className="text-xs font-medium mb-1">Tags:</p>
                <div className="flex flex-wrap gap-1">
                  {selectedPhoto.tags.map(tag => (
                    <span key={tag.id} className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                      {tag.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </InfoWindow>
      )}
    </MapContext.Provider>
  );
};