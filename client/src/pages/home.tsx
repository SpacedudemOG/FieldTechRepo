import { useState } from 'react';
import { Link } from 'wouter';
import Layout from '@/components/Layout';
import PhotoMap from '@/components/PhotoMap';
import PhotoList from '@/components/PhotoList';
import PhotoDetailModal from '@/components/PhotoDetailModal';
import UploadModal from '@/components/UploadModal';
import usePhotoStorage from '@/hooks/usePhotoStorage';
import { PhotoWithTags } from '@shared/schema';
import { useMap } from '@/lib/MapContext';
import { Helmet } from 'react-helmet';
import { BarChart } from 'lucide-react';

export default function Home() {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoWithTags | null>(null);
  const [activeTab, setActiveTab] = useState<'map' | 'photos'>('map');
  
  const { 
    photos, 
    isLoading, 
    applyFilters, 
    clearFilters 
  } = usePhotoStorage();
  
  const { flyToPhoto } = useMap();
  
  const handlePhotoClick = (photo: PhotoWithTags) => {
    setSelectedPhoto(photo);
    setIsDetailModalOpen(true);
    
    // If the photo has coordinates, fly to it on the map
    if (photo.latitude && photo.longitude) {
      flyToPhoto(photo);
    }
  };
  
  const handleCloseDetail = () => {
    setIsDetailModalOpen(false);
  };
  
  const toggleActiveTab = (tab: 'map' | 'photos') => {
    setActiveTab(tab);
  };

  return (
    <>
      <Helmet>
        <title>FieldVision - Field Technician Photo Repository</title>
        <meta name="description" content="A photo repository system for field technicians with GPS data extraction, interactive map display, and AI-assisted tagging." />
      </Helmet>
      
      <div className="flex flex-col h-screen">
        <header className="bg-white border-b border-gray-200 shadow-sm z-10">
          <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="text-primary w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path>
                <circle cx="12" cy="13" r="3"></circle>
              </svg>
              <h1 className="text-xl font-bold text-gray-800">FieldVision</h1>
            </div>
            
            <div className="hidden md:flex items-center space-x-4">
              <button 
                className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                onClick={() => clearFilters()}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="4" y1="21" x2="4" y2="14"></line>
                  <line x1="4" y1="10" x2="4" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12" y2="3"></line>
                  <line x1="20" y1="21" x2="20" y2="16"></line>
                  <line x1="20" y1="12" x2="20" y2="3"></line>
                  <line x1="1" y1="14" x2="7" y2="14"></line>
                  <line x1="9" y1="8" x2="15" y2="8"></line>
                  <line x1="17" y1="16" x2="23" y2="16"></line>
                </svg>
                Filters
              </button>
              <button 
                className="flex items-center px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-blue-600"
                onClick={() => setIsUploadModalOpen(true)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Upload Photo
              </button>
            </div>
            
            <button className="md:hidden text-gray-500 hover:text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </header>

        <main className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Conditionally show map or photos on mobile based on active tab */}
          <div className={`${activeTab === 'map' ? 'block' : 'hidden'} md:block md:flex md:flex-1`}>
            <PhotoMap 
              photos={photos || []} 
              loading={isLoading} 
            />
          </div>
          
          <div className={`${activeTab === 'photos' ? 'block' : 'hidden'} md:block md:flex md:flex-1`}>
            <PhotoList 
              photos={photos || []} 
              loading={isLoading}
              onPhotoClick={handlePhotoClick}
              onFilterApply={applyFilters}
              onFilterClear={clearFilters}
            />
          </div>
        </main>

        <nav className="md:hidden bg-white border-t border-gray-200 flex items-center justify-around py-2 px-4">
          <button 
            className={`flex flex-col items-center justify-center w-1/5 py-1 ${activeTab === 'map' ? 'text-primary' : 'text-gray-500'}`}
            onClick={() => toggleActiveTab('map')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
              <line x1="8" y1="2" x2="8" y2="18"></line>
              <line x1="16" y1="6" x2="16" y2="22"></line>
            </svg>
            <span className="text-xs mt-1">Map</span>
          </button>
          
          <button 
            className={`flex flex-col items-center justify-center w-1/5 py-1 ${activeTab === 'photos' ? 'text-primary' : 'text-gray-500'}`}
            onClick={() => toggleActiveTab('photos')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
            <span className="text-xs mt-1">Photos</span>
          </button>
          
          <button 
            className="flex flex-col items-center justify-center w-1/5 py-1 text-gray-500"
            onClick={() => setIsUploadModalOpen(true)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="16"></line>
              <line x1="8" y1="12" x2="16" y2="12"></line>
            </svg>
            <span className="text-xs mt-1">Upload</span>
          </button>
          
          <button 
            className="flex flex-col items-center justify-center w-1/5 py-1 text-gray-500"
            onClick={() => {
              toggleActiveTab('photos');
              clearFilters();
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="21" x2="4" y2="14"></line>
              <line x1="4" y1="10" x2="4" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12" y2="3"></line>
              <line x1="20" y1="21" x2="20" y2="16"></line>
              <line x1="20" y1="12" x2="20" y2="3"></line>
              <line x1="1" y1="14" x2="7" y2="14"></line>
              <line x1="9" y1="8" x2="15" y2="8"></line>
              <line x1="17" y1="16" x2="23" y2="16"></line>
            </svg>
            <span className="text-xs mt-1">Filter</span>
          </button>
          
          <Link href="/dashboard">
            <a className="flex flex-col items-center justify-center w-1/5 py-1 text-gray-500 hover:text-primary">
              <BarChart className="h-5 w-5" />
              <span className="text-xs mt-1">Dashboard</span>
            </a>
          </Link>
        </nav>

        {/* Upload Modal */}
        <UploadModal 
          isOpen={isUploadModalOpen} 
          onClose={() => setIsUploadModalOpen(false)} 
        />

        {/* Photo Detail Modal */}
        {selectedPhoto && (
          <PhotoDetailModal 
            isOpen={isDetailModalOpen} 
            onClose={handleCloseDetail} 
            photo={selectedPhoto} 
          />
        )}
      </div>
    </>
  );
}
