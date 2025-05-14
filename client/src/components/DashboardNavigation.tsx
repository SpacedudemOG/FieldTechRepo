import React from 'react';
import { Link } from 'wouter';
import { BarChart, Map, Image, Sparkles } from 'lucide-react';

interface DashboardNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const DashboardNavigation: React.FC<DashboardNavigationProps> = ({ 
  activeTab, 
  onTabChange
}) => {
  return (
    <nav className="md:hidden bg-white border-t border-gray-200 fixed bottom-0 left-0 right-0 flex items-center justify-around py-2 px-4 z-50">
      <button 
        className={`flex flex-col items-center justify-center w-1/4 py-1 ${activeTab === 'overview' ? 'text-primary' : 'text-gray-500'}`}
        onClick={() => onTabChange('overview')}
      >
        <BarChart className="h-5 w-5" />
        <span className="text-xs mt-1">Overview</span>
      </button>
      
      <button 
        className={`flex flex-col items-center justify-center w-1/4 py-1 ${activeTab === 'tags' ? 'text-primary' : 'text-gray-500'}`}
        onClick={() => onTabChange('tags')}
      >
        <Image className="h-5 w-5" />
        <span className="text-xs mt-1">Tags</span>
      </button>
      
      <button 
        className={`flex flex-col items-center justify-center w-1/4 py-1 ${activeTab === 'locations' ? 'text-primary' : 'text-gray-500'}`}
        onClick={() => onTabChange('locations')}
      >
        <Map className="h-5 w-5" />
        <span className="text-xs mt-1">Locations</span>
      </button>
      
      <button 
        className={`flex flex-col items-center justify-center w-1/4 py-1 ${activeTab === 'recommendations' ? 'text-primary' : 'text-gray-500'}`}
        onClick={() => onTabChange('recommendations')}
      >
        <Sparkles className="h-5 w-5" />
        <span className="text-xs mt-1">Recs</span>
      </button>
    </nav>
  );
};

export default DashboardNavigation;