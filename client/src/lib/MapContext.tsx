import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import L from 'leaflet';
import { PhotoWithTags } from '@shared/schema';

// Import Leaflet CSS
import 'leaflet/dist/leaflet.css';

// Fix the Leaflet icon path issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix Leaflet default icon issue
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface MapContextValue {
  map: L.Map | null;
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
  const [map, setMap] = useState<L.Map | null>(null);
  const [mapContainer, setMapContainerState] = useState<React.RefObject<HTMLDivElement> | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [markers, setMarkers] = useState<L.Marker[]>([]);
  const [markerLayer, setMarkerLayer] = useState<L.LayerGroup | null>(null);

  // Set map container ref
  const setMapContainer = (ref: React.RefObject<HTMLDivElement>) => {
    setMapContainerState(ref);
  };

  // Initialize map when container is available
  useEffect(() => {
    if (!mapContainer?.current || map) return;

    // Create the map instance
    const newMap = L.map(mapContainer.current).setView([37.8, -96], 4); // Center on US

    // Add the OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(newMap);

    // Create a layer group for markers
    const newMarkerLayer = L.layerGroup().addTo(newMap);
    
    setMarkerLayer(newMarkerLayer);
    setMap(newMap);
    setMapLoaded(true);

    // Return a cleanup function to properly remove the map
    return () => {
      if (newMap) {
        newMap.remove();
      }
      setMap(null);
      setMarkerLayer(null);
      
      // For debugging purposes
      console.log('Map component unmounted, state reset');
    };
  }, [mapContainer, map]);

  // Add markers to map
  const addMarkers = (photos: PhotoWithTags[]) => {
    if (!map || !markerLayer) return;

    // Clear previous markers
    markerLayer.clearLayers();
    setMarkers([]);

    // Create custom icon for markers
    const customIcon = L.divIcon({
      className: 'custom-div-icon',
      html: '<div class="marker-pin bg-primary rounded-full flex items-center justify-center text-white shadow-md" style="width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path><circle cx="12" cy="13" r="3"></circle></svg></div>',
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });

    // Filter photos with valid coordinates and add markers
    const photosWithCoords = photos.filter(photo => photo.latitude && photo.longitude);
    
    const newMarkers = photosWithCoords.map(photo => {
      // Safely handle potentially null values
      const lng = photo.longitude ? parseFloat(photo.longitude) : 0;
      const lat = photo.latitude ? parseFloat(photo.latitude) : 0;

      // Create popup content
      const popupContent = `
        <div class="p-2">
          <strong class="block mb-1">${photo.title}</strong>
          <p class="text-xs text-gray-600">${new Date(photo.uploadedAt).toLocaleDateString()}</p>
          <p class="text-xs mt-1">Click to view details</p>
        </div>
      `;

      // Add marker to map
      const marker = L.marker([lat, lng], { icon: customIcon })
        .bindPopup(popupContent)
        .addTo(markerLayer);

      return marker;
    });

    setMarkers(newMarkers);

    // Fit map to markers if there are any
    if (newMarkers.length > 0) {
      const bounds = L.latLngBounds(
        photosWithCoords.map(photo => {
          const lat = photo.latitude ? parseFloat(photo.latitude) : 0;
          const lng = photo.longitude ? parseFloat(photo.longitude) : 0;
          return [lat, lng];
        })
      );
      
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  };

  // Fly to a specific photo
  const flyToPhoto = (photo: PhotoWithTags) => {
    if (!map || !photo.latitude || !photo.longitude) return;
    
    const lng = photo.longitude ? parseFloat(photo.longitude) : 0;
    const lat = photo.latitude ? parseFloat(photo.latitude) : 0;
    
    map.setView([lat, lng], 14, {
      animate: true
    });

    // Find and open the popup for this photo
    markers.forEach(marker => {
      const markerLatLng = marker.getLatLng();
      
      if (markerLatLng.lat === lat && markerLatLng.lng === lng) {
        marker.openPopup();
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
