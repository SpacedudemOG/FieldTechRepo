import React from 'react';
import { PhotoWithTags } from '@shared/schema';
import useRecommendations from '@/hooks/useRecommendations';
import PhotoCard from '@/components/PhotoCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SimilarPhotosProps {
  photoId: number;
  onPhotoClick: (photo: PhotoWithTags) => void;
}

const SimilarPhotos: React.FC<SimilarPhotosProps> = ({ photoId, onPhotoClick }) => {
  const { getSimilarPhotos } = useRecommendations();
  const { data: similarPhotos, isLoading } = getSimilarPhotos(photoId, 4);

  if (isLoading) {
    return <SimilarPhotosSkeleton />;
  }

  if (!similarPhotos || similarPhotos.length === 0) {
    return null; // Don't show the component if there are no similar photos
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Similar Photos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {similarPhotos.map((photo) => (
            <div key={photo.id} onClick={() => onPhotoClick(photo)}>
              <PhotoCard 
                photo={photo} 
                viewMode="grid" 
                onClick={() => onPhotoClick(photo)} 
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const SimilarPhotosSkeleton = () => (
  <Card className="mt-6">
    <CardHeader>
      <CardTitle>Similar Photos</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-40 w-full" />
        ))}
      </div>
    </CardContent>
  </Card>
);

export default SimilarPhotos;