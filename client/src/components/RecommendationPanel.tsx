import React from 'react';
import { PhotoWithTags } from '@shared/schema';
import useRecommendations from '@/hooks/useRecommendations';
import SimilarPhotos from '@/components/SimilarPhotos';
import PhotoCategories from '@/components/PhotoCategories';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface RecommendationPanelProps {
  selectedPhoto: PhotoWithTags | null;
  onPhotoClick: (photo: PhotoWithTags) => void;
}

const RecommendationPanel: React.FC<RecommendationPanelProps> = ({ 
  selectedPhoto, 
  onPhotoClick 
}) => {
  // For text-based search recommendations
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const { getRecommendationsByQuery } = useRecommendations();
  const { data: queryResults, isLoading: queryLoading } = getRecommendationsByQuery(searchQuery);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight mb-4">
          Smart Recommendations
        </h2>
        <p className="text-muted-foreground mb-6">
          Discover related photos based on context, location, projects, and more
        </p>
      </div>

      <Tabs defaultValue="categories">
        <TabsList className="mb-4">
          <TabsTrigger value="categories">Categories</TabsTrigger>
          {selectedPhoto && <TabsTrigger value="similar">Similar to Selected</TabsTrigger>}
        </TabsList>
        
        <TabsContent value="categories">
          <PhotoCategories onPhotoClick={onPhotoClick} />
        </TabsContent>
        
        {selectedPhoto && (
          <TabsContent value="similar">
            <SimilarPhotos photoId={selectedPhoto.id} onPhotoClick={onPhotoClick} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default RecommendationPanel;