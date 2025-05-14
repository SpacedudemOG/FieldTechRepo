import { ReactNode, useState } from 'react';
import Header from './Header';
import MobileNavigation from './MobileNavigation';
import UploadModal from './UploadModal';
import PhotoDetailModal from './PhotoDetailModal';
import { PhotoWithTags } from '@shared/schema';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoWithTags | null>(null);
  const [activeTab, setActiveTab] = useState<'map' | 'photos'>('map');

  const openUploadModal = () => {
    setIsUploadModalOpen(true);
  };

  const closeUploadModal = () => {
    setIsUploadModalOpen(false);
  };

  const openPhotoDetail = (photo: PhotoWithTags) => {
    setSelectedPhoto(photo);
    setIsDetailModalOpen(true);
  };

  const closePhotoDetail = () => {
    setIsDetailModalOpen(false);
    setSelectedPhoto(null);
  };

  return (
    <div className="flex flex-col h-screen">
      <Header onUploadClick={openUploadModal} />
      
      <main className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {children}
      </main>
      
      <MobileNavigation 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onUploadClick={openUploadModal}
      />
      
      <UploadModal 
        isOpen={isUploadModalOpen} 
        onClose={closeUploadModal} 
      />
      
      {selectedPhoto && (
        <PhotoDetailModal 
          isOpen={isDetailModalOpen} 
          onClose={closePhotoDetail} 
          photo={selectedPhoto} 
        />
      )}
    </div>
  );
};

export default Layout;
