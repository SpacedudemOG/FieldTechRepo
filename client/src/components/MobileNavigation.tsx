import { MapPin, Image, PlusCircle, SlidersHorizontal } from 'lucide-react';

interface MobileNavigationProps {
  activeTab: 'map' | 'photos';
  onTabChange: (tab: 'map' | 'photos') => void;
  onUploadClick: () => void;
  onFilterClick?: () => void;
}

const MobileNavigation = ({ 
  activeTab, 
  onTabChange, 
  onUploadClick,
  onFilterClick 
}: MobileNavigationProps) => {
  return (
    <nav className="md:hidden bg-white border-t border-gray-200 flex items-center justify-around py-2 px-4">
      <button 
        className={`flex flex-col items-center justify-center w-1/4 py-1 ${activeTab === 'map' ? 'text-primary' : 'text-gray-500'}`}
        onClick={() => onTabChange('map')}
      >
        <MapPin className="h-5 w-5" />
        <span className="text-xs mt-1">Map</span>
      </button>
      
      <button 
        className={`flex flex-col items-center justify-center w-1/4 py-1 ${activeTab === 'photos' ? 'text-primary' : 'text-gray-500'}`}
        onClick={() => onTabChange('photos')}
      >
        <Image className="h-5 w-5" />
        <span className="text-xs mt-1">Photos</span>
      </button>
      
      <button 
        className="flex flex-col items-center justify-center w-1/4 py-1 text-gray-500"
        onClick={onUploadClick}
      >
        <PlusCircle className="h-5 w-5" />
        <span className="text-xs mt-1">Upload</span>
      </button>
      
      <button 
        className="flex flex-col items-center justify-center w-1/4 py-1 text-gray-500"
        onClick={onFilterClick}
      >
        <SlidersHorizontal className="h-5 w-5" />
        <span className="text-xs mt-1">Filter</span>
      </button>
    </nav>
  );
};

export default MobileNavigation;
