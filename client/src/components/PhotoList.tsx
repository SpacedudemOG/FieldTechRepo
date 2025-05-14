import { useState } from 'react';
import { PhotoWithTags } from '@shared/schema';
import FilterPanel from './FilterPanel';
import PhotoCard from './PhotoCard';
import { Button } from '@/components/ui/button';
import { SlidersHorizontal, LayoutGrid, List } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface PhotoListProps {
  photos: PhotoWithTags[];
  loading: boolean;
  onPhotoClick: (photo: PhotoWithTags) => void;
  onFilterApply: (filter: any) => void;
  onFilterClear: () => void;
}

const PhotoList = ({ 
  photos, 
  loading, 
  onPhotoClick, 
  onFilterApply, 
  onFilterClear 
}: PhotoListProps) => {
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const toggleFilterVisibility = () => {
    setIsFilterVisible(!isFilterVisible);
  };

  return (
    <div className="h-screen-minus-header w-full md:w-1/3 bg-white border-t md:border-t-0 md:border-l border-gray-200 flex flex-col">
      {/* Filter Panel - visible on desktop or when toggle is active */}
      <div className={`md:block ${isFilterVisible ? 'block' : 'hidden'}`}>
        <FilterPanel 
          onApplyFilter={onFilterApply} 
          onClearFilter={onFilterClear} 
        />
      </div>
      
      {/* Photo List */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <h2 className="text-lg font-medium text-gray-800">
              Photos ({photos?.length || 0})
            </h2>
            <Button 
              variant="ghost" 
              size="sm"
              className="md:hidden ml-2" 
              onClick={toggleFilterVisibility}
            >
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex space-x-2 text-sm">
            <Button
              variant="ghost"
              size="sm"
              className={viewMode === 'grid' ? 'text-primary' : 'text-gray-500'}
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={viewMode === 'list' ? 'text-primary' : 'text-gray-500'}
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {loading ? (
          // Loading skeletons
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <Skeleton className="w-full h-40" />
                <div className="p-3">
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-3" />
                  <div className="flex space-x-2">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : photos && photos.length > 0 ? (
          // Photo cards
          <div className={viewMode === 'grid' ? 'space-y-4' : 'space-y-2'}>
            {photos.map((photo) => (
              <PhotoCard 
                key={photo.id} 
                photo={photo} 
                viewMode={viewMode}
                onClick={() => onPhotoClick(photo)} 
              />
            ))}
          </div>
        ) : (
          // Empty state
          <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No photos</h3>
            <p className="mt-1 text-sm text-gray-500">Upload photos to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotoList;
