import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import mapboxgl from 'mapbox-gl';
import { PhotoWithTags } from '@shared/schema';

// Setup mapbox access token - using a direct token for demo purposes
// In production, you would use a more secure method for managing tokens
const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoiZnRlY2gtc3lzdGVtIiwiYSI6ImNsc2p3Z2ZrMjEyZXEyam8wMXdpNnVkYnkifQ.XBsfOsLM4g7JPITBb4d6Pg';

// Set the token for mapbox
mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

interface MapContextValue {
  map: mapboxgl.Map | null;
  mapContainer: React.RefObject<HTMLDivElement> | null;
  setMapContainer: (ref: React.RefObject<HTMLDivElement>) => void;
  addMarkers: (photos: PhotoWithTags[]) => void;
  flyToPhoto: (photo: PhotoWithTags) => void;
  mapLoaded: boolean;
}

// Create context
const MapContext = createContext<MapContextValue>({
  map: null,
  mapContainer: null,
  setMapContainer: () => {},
  addMarkers: () => {},
  flyToPhoto: () => {},
  mapLoaded: false,
});

// Hook to use map context
export const useMap = () => useContext(MapContext);

// Provider component
export const MapContextProvider = ({ children }: { children: ReactNode }) => {
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [mapContainer, setMapContainerState] = useState<React.RefObject<HTMLDivElement> | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [markers, setMarkers] = useState<mapboxgl.Marker[]>([]);

  // Set map container ref
  const setMapContainer = (ref: React.RefObject<HTMLDivElement>) => {
    setMapContainerState(ref);
  };

  // Initialize map when container is available
  useEffect(() => {
    if (!mapContainer?.current || map) return;

    const newMap = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v10',
      center: [-96, 37.8], // Center on US
      zoom: 3,
    });

    newMap.on('load', () => {
      setMapLoaded(true);
    });

    setMap(newMap);

    // Return a cleanup function that doesn't actually remove the map
    // This avoids the aborted signal error
    return () => {
      // Just reset the state
      setMap(null);
      
      // For debugging purposes
      console.log('Map component unmounted, state reset');
    };
  }, [mapContainer, map]);

  // Add markers to map
  const addMarkers = (photos: PhotoWithTags[]) => {
    if (!map || !mapLoaded) return;

    // Clear previous markers
    markers.forEach(marker => marker.remove());
    setMarkers([]);

    // Add new markers
    const newMarkers = photos
      .filter(photo => photo.latitude && photo.longitude)
      .map(photo => {
        // Create marker element
        const el = document.createElement('div');
        el.className = 'w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white shadow-md';
        el.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path><circle cx="12" cy="13" r="3"></circle></svg>';

        // Safely handle potentially null values
        const lng = photo.longitude ? parseFloat(photo.longitude) : 0;
        const lat = photo.latitude ? parseFloat(photo.latitude) : 0;

        // Add marker to map
        const marker = new mapboxgl.Marker(el)
          .setLngLat([lng, lat])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setHTML(
              `<div class="p-2">
                <strong class="block mb-1">${photo.title}</strong>
                <p class="text-xs text-gray-600">${new Date(photo.uploadedAt).toLocaleDateString()}</p>
                <p class="text-xs mt-1">Click to view details</p>
              </div>`
            )
          )
          .addTo(map);

        return marker;
      });

    setMarkers(newMarkers);

    // Fit map to markers if there are any
    if (newMarkers.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      photos
        .filter(photo => photo.latitude && photo.longitude)
        .forEach(photo => {
          const lng = photo.longitude ? parseFloat(photo.longitude) : 0;
          const lat = photo.latitude ? parseFloat(photo.latitude) : 0;
          bounds.extend([lng, lat]);
        });
      
      map.fitBounds(bounds, { padding: 50 });
    }
  };

  // Fly to a specific photo
  const flyToPhoto = (photo: PhotoWithTags) => {
    if (!map || !mapLoaded || !photo.latitude || !photo.longitude) return;
    
    const lng = photo.longitude ? parseFloat(photo.longitude) : 0;
    const lat = photo.latitude ? parseFloat(photo.latitude) : 0;
    
    map.flyTo({
      center: [lng, lat],
      zoom: 14,
      essential: true
    });

    // Find and open the popup for this photo
    markers.forEach(marker => {
      const markerLngLat = marker.getLngLat();
      
      if (markerLngLat.lng === lng && markerLngLat.lat === lat) {
        marker.togglePopup();
      }
    });
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
