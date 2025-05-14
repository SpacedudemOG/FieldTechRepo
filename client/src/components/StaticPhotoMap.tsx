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

// Custom marker icons for different photo categories
const createCategoryIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: ${color}; width: 22px; height: 22px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.4);"></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
};

// Marker icon definitions
const markerIcons = {
  default: createCategoryIcon('#3B82F6'), // blue
  electrical: createCategoryIcon('#F97316'), // orange for electrical
  mechanical: createCategoryIcon('#14B8A6'), // teal for mechanical/HVAC
  structural: createCategoryIcon('#6366F1'), // indigo for structural
  plumbing: createCategoryIcon('#0EA5E9'), // sky blue for plumbing/water
  safety: createCategoryIcon('#EF4444'), // red for safety/hazard
};

// Function to determine the marker category based on photo tags or title
const getMarkerCategory = (photo: PhotoWithTags): keyof typeof markerIcons => {
  const tagsAndTitle = [
    photo.title.toLowerCase(),
    ...(photo.tags?.map(tag => tag.name.toLowerCase()) || [])
  ];
  
  if (tagsAndTitle.some(text => text.includes('electr') || text.includes('panel') || text.includes('circuit'))) {
    return 'electrical';
  }
  if (tagsAndTitle.some(text => text.includes('hvac') || text.includes('mechanical') || text.includes('equipment'))) {
    return 'mechanical';
  }
  if (tagsAndTitle.some(text => text.includes('structur') || text.includes('building') || text.includes('rail'))) {
    return 'structural';
  }
  if (tagsAndTitle.some(text => text.includes('water') || text.includes('leak') || text.includes('plumb'))) {
    return 'plumbing';
  }
  if (tagsAndTitle.some(text => text.includes('safe') || text.includes('hazard') || text.includes('danger'))) {
    return 'safety';
  }
  
  return 'default';
};

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
            {photos.filter(p => p.latitude && p.longitude).map(photo => {
              const category = getMarkerCategory(photo);
              return (
                <Marker 
                  key={photo.id} 
                  position={[
                    parseFloat(photo.latitude || "0"), 
                    parseFloat(photo.longitude || "0")
                  ]}
                  icon={markerIcons[category]}
                >
                  <Popup maxWidth={300}>
                    <div className="p-2">
                      <div className="flex items-start mb-2">
                        <div className="w-20 h-20 rounded overflow-hidden mr-2 flex-shrink-0">
                          <img 
                            src={`/api/uploads/${photo.fileName}`}
                            alt={photo.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm mb-1">{photo.title}</h4>
                          {photo.location && (
                            <p className="text-xs text-gray-600 flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                <circle cx="12" cy="10" r="3"></circle>
                              </svg>
                              {photo.location}
                            </p>
                          )}
                          {photo.latitude && photo.longitude && (
                            <p className="text-xs text-gray-500 mt-1">
                              {photo.latitude.slice(0, 7)}, {photo.longitude.slice(0, 7)}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {/* Photo metadata */}
                      <div className="border-t pt-2 mt-2">
                        <div className="grid grid-cols-2 gap-1 text-xs">
                          <span className="text-gray-500">Date:</span>
                          <span>{new Date(photo.uploadedAt).toLocaleDateString()}</span>
                          
                          <span className="text-gray-500">Time:</span>
                          <span>{new Date(photo.uploadedAt).toLocaleTimeString()}</span>
                          
                          <span className="text-gray-500">File Size:</span>
                          <span>{Math.round(photo.fileSize / 1024)} KB</span>
                          
                          <span className="text-gray-500">Category:</span>
                          <span className="capitalize">{category}</span>
                        </div>
                      </div>
                      
                      {/* Tags */}
                      {photo.tags && photo.tags.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-500 mb-1">Tags:</p>
                          <div className="flex flex-wrap gap-1">
                            {photo.tags.map((tag) => (
                              <span 
                                key={tag.id} 
                                className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs"
                              >
                                {tag.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Notes */}
                      {photo.notes && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-500 mb-1">Notes:</p>
                          <p className="text-xs italic">{photo.notes}</p>
                        </div>
                      )}
                      
                      <button 
                        className="mt-3 text-xs bg-primary hover:bg-primary/90 text-white px-3 py-1.5 rounded w-full"
                        onClick={() => onPhotoClick && onPhotoClick(photo)}
                      >
                        View Full Details
                      </button>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
          
          {/* Map Legend - Outside of MapContainer */}
          <div className="absolute bottom-4 right-4 bg-white p-3 rounded-md shadow-lg z-[1000] max-w-xs">
            <h4 className="text-sm font-medium mb-2">Photo Categories</h4>
            <div className="space-y-1.5">
              {Object.entries(markerIcons).map(([category, _]) => (
                <div key={category} className="flex items-center text-xs">
                  <div 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ 
                      backgroundColor: 
                        category === 'electrical' ? '#F97316' :
                        category === 'mechanical' ? '#14B8A6' :
                        category === 'structural' ? '#6366F1' :
                        category === 'plumbing' ? '#0EA5E9' :
                        category === 'safety' ? '#EF4444' : '#3B82F6'
                    }}
                  />
                  <span className="capitalize">{category}</span>
                </div>
              ))}
            </div>
          </div>
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