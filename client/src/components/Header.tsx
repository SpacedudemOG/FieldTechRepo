import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Menu, SlidersHorizontal, Plus } from 'lucide-react';

interface HeaderProps {
  onUploadClick: () => void;
  onFilterToggle?: () => void;
}

const Header = ({ onUploadClick, onFilterToggle }: HeaderProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm z-10">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Camera className="text-primary w-5 h-5" />
          <h1 className="text-xl font-bold text-gray-800">FieldVision</h1>
        </div>
        
        <div className="hidden md:flex items-center space-x-4">
          {onFilterToggle && (
            <Button
              variant="outline"
              size="sm"
              onClick={onFilterToggle}
              className="flex items-center"
            >
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filters
            </Button>
          )}
          
          <Button
            size="sm"
            onClick={onUploadClick}
            className="flex items-center"
          >
            <Plus className="mr-2 h-4 w-4" />
            Upload Photo
          </Button>
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
};

export default Header;
