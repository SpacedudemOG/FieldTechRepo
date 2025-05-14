import React from 'react';
import { Link } from 'wouter';
import { PhotoWithTags } from '@shared/schema';
import useRecommendations from '@/hooks/useRecommendations';
import PhotoCard from '@/components/PhotoCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface PhotoCategoriesProps {
  onPhotoClick: (photo: PhotoWithTags) => void;
}

const PhotoCategories: React.FC<PhotoCategoriesProps> = ({ onPhotoClick }) => {
  const { getPhotoCategories } = useRecommendations();
  const { data: categories, isLoading } = getPhotoCategories(4);

  if (isLoading) {
    return <CategorySkeleton />;
  }

  if (!categories || categories.length === 0) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Photo Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No categories found. Upload more photos to see categories.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Photo Categories</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={categories[0].category}>
          <TabsList className="mb-4 w-full overflow-x-auto flex-nowrap">
            {categories.map((category) => (
              <TabsTrigger
                key={category.category}
                value={category.category}
                className="whitespace-nowrap"
              >
                {category.category}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map((category) => (
            <TabsContent key={category.category} value={category.category} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {category.photos.map((photo) => (
                  <div key={photo.id} onClick={() => onPhotoClick(photo)}>
                    <PhotoCard 
                      photo={photo} 
                      viewMode="grid" 
                      onClick={() => onPhotoClick(photo)} 
                    />
                  </div>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

const CategorySkeleton = () => (
  <Card className="mb-6">
    <CardHeader>
      <CardTitle>Photo Categories</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="flex gap-2 mb-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-10 w-28" />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-40 w-full" />
        ))}
      </div>
    </CardContent>
  </Card>
);

export default PhotoCategories;