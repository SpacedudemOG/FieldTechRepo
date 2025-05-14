import { useQuery } from '@tanstack/react-query';
import { PhotoWithTags } from '@shared/schema';
import { getQueryFn, apiRequest } from '@/lib/queryClient';

interface PhotoCategory {
  category: string;
  photos: PhotoWithTags[];
}

export const useRecommendations = () => {
  // Fetch similar photos based on a reference photo
  const getSimilarPhotos = (photoId: number, limit: number = 5) => {
    return useQuery<PhotoWithTags[]>({
      queryKey: ['/api/recommendations/similar', photoId, limit],
      queryFn: getQueryFn({ on401: 'throw' }),
      enabled: !!photoId && photoId > 0,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    });
  };
  
  // Fetch categorized photo groups
  const getPhotoCategories = (limit: number = 3) => {
    return useQuery<PhotoCategory[]>({
      queryKey: ['/api/recommendations/categories', limit],
      queryFn: getQueryFn({ on401: 'throw' }),
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    });
  };
  
  // Search for recommendations based on a query
  const getRecommendationsByQuery = (query: string, limit: number = 5) => {
    return useQuery<PhotoWithTags[]>({
      queryKey: ['/api/recommendations/search', query, limit],
      queryFn: getQueryFn({ on401: 'throw' }),
      enabled: !!query && query.trim() !== '',
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    });
  };
  
  return {
    getSimilarPhotos,
    getPhotoCategories,
    getRecommendationsByQuery
  };
};

export default useRecommendations;