import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { PhotoWithTags } from '@shared/schema';

interface MapContextValue {
  mapContainer: React.RefObject<HTMLDivElement> | null;
  setMapContainer: (ref: React.RefObject<HTMLDivElement>) => void;
  addMarkers: (photos: PhotoWithTags[]) => void;
  flyToPhoto: (photo: PhotoWithTags) => void;
  mapLoaded: boolean;
  map: any;
}

// Create context
const MapContext = createContext<MapContextValue>({
  mapContainer: null,
  setMapContainer: () => {},
  addMarkers: () => {},
  flyToPhoto: () => {},
  mapLoaded: false,
  map: null,
});

// Hook to use map context
export const useMap = () => useContext(MapContext);

// Provider component
export const MapContextProvider = ({ children }: { children: ReactNode }) => {
  const [mapContainer, setMapContainerState] = useState<React.RefObject<HTMLDivElement> | null>(null);
  const [mapLoaded, setMapLoaded] = useState(true); // Set to true to avoid loading state
  const [map, setMap] = useState(null);

  // Set map container ref
  const setMapContainer = (ref: React.RefObject<HTMLDivElement>) => {
    setMapContainerState(ref);
  };

  // Add markers to map
  const addMarkers = (photos: PhotoWithTags[]) => {
    // Basic implementation that does nothing but avoids errors
    console.log(`Would display ${photos.length} photos on map`);
  };

  // Fly to a specific photo
  const flyToPhoto = (photo: PhotoWithTags) => {
    // Basic implementation that does nothing but avoids errors
    console.log(`Would fly to photo at ${photo.latitude}, ${photo.longitude}`);
  };

  return (
    <MapContext.Provider value={{ 
      map, 
      mapContainer, 
      setMapContainer, 
      addMarkers, 
      flyToPhoto,
      mapLoaded
    }}>
      {children}
    </MapContext.Provider>
  );
};