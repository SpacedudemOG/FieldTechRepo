import { PhotoWithTags } from '@shared/schema';
import { Loader2 } from 'lucide-react';

interface PhotoMapProps {
  photos: PhotoWithTags[];
  loading: boolean;
  onPhotoClick?: (photo: PhotoWithTags) => void;
}

const StaticPhotoMap = ({ photos, loading, onPhotoClick }: PhotoMapProps) => {
  return (
    <div className="h-screen-minus-header w-full md:w-2/3 relative">
      {/* Simple Map Display */}
      <div className="map-container h-full bg-gray-100 p-4 overflow-auto">
        <h3 className="text-lg font-semibold mb-3">Photo Locations</h3>
        <div className="bg-white rounded-lg shadow-sm p-3">
          <p className="text-sm text-gray-500 mb-3">
            Map display is simplified. Your photos with coordinates are displayed below.
          </p>
          {photos && photos.length > 0 ? (
            <div className="space-y-2">
              {photos.map(photo => (
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
                  {photo.latitude && photo.longitude && (
                    <span className="text-xs text-gray-500">
                      {photo.latitude.slice(0, 6)}, {photo.longitude.slice(0, 6)}
                    </span>
                  )}
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

export default StaticPhotoMap;