import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { PhotoFilter, PhotoWithTags, InsertPhoto } from '@shared/schema';
import { useState } from 'react';

export const usePhotoStorage = () => {
  const [filter, setFilter] = useState<PhotoFilter>({
    startDate: undefined,
    endDate: undefined,
    locationRadius: undefined,
    tags: undefined
  });

  // Fetch all photos
  const { 
    data: photos, 
    isLoading, 
    isError,
    error
  } = useQuery({
    queryKey: ['/api/photos'], 
    enabled: true
  });

  // Fetch filtered photos
  const { 
    data: filteredPhotos,
    isLoading: isFilteredLoading,
    refetch: refetchFiltered
  } = useQuery({
    queryKey: ['/api/photos/filter', filter], 
    queryFn: async () => {
      const res = await apiRequest('POST', '/api/photos/filter', filter);
      return res.json();
    },
    enabled: !!(filter.startDate || filter.endDate || filter.locationRadius || (filter.tags && filter.tags.length > 0))
  });

  // Upload a new photo
  const uploadPhoto = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch('/api/photos', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText);
      }
      
      return res.json();
    },
    onSuccess: () => {
      // Invalidate the query to refetch photos
      queryClient.invalidateQueries({ queryKey: ['/api/photos'] });
      if (filter.startDate || filter.endDate || filter.locationRadius || (filter.tags && filter.tags.length > 0)) {
        refetchFiltered();
      }
    }
  });

  // Update a photo
  const updatePhoto = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: Partial<InsertPhoto> }) => {
      const res = await apiRequest('PATCH', `/api/photos/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/photos'] });
      if (filter.startDate || filter.endDate || filter.locationRadius || (filter.tags && filter.tags.length > 0)) {
        refetchFiltered();
      }
    }
  });

  // Delete a photo
  const deletePhoto = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/photos/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/photos'] });
      if (filter.startDate || filter.endDate || filter.locationRadius || (filter.tags && filter.tags.length > 0)) {
        refetchFiltered();
      }
    }
  });

  // Add a tag to a photo
  const addTagToPhoto = useMutation({
    mutationFn: async ({ photoId, tagName }: { photoId: number, tagName: string }) => {
      // First check if tag exists
      const tagsRes = await apiRequest('GET', '/api/tags');
      const tags = await tagsRes.json();
      
      let tagId: number;
      const existingTag = tags.find((tag: any) => tag.name.toLowerCase() === tagName.toLowerCase());
      
      if (existingTag) {
        tagId = existingTag.id;
      } else {
        // Create new tag
        const newTagRes = await apiRequest('POST', '/api/tags', { name: tagName, aiGenerated: false });
        const newTag = await newTagRes.json();
        tagId = newTag.id;
      }
      
      // Add tag to photo
      const res = await apiRequest('POST', `/api/photos/${photoId}/tags/${tagId}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/photos'] });
      if (filter.startDate || filter.endDate || filter.locationRadius || (filter.tags && filter.tags.length > 0)) {
        refetchFiltered();
      }
    }
  });

  // Remove a tag from a photo
  const removeTagFromPhoto = useMutation({
    mutationFn: async ({ photoId, tagId }: { photoId: number, tagId: number }) => {
      await apiRequest('DELETE', `/api/photos/${photoId}/tags/${tagId}`);
      return { photoId, tagId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/photos'] });
      if (filter.startDate || filter.endDate || filter.locationRadius || (filter.tags && filter.tags.length > 0)) {
        refetchFiltered();
      }
    }
  });

  // Apply filters
  const applyFilters = (newFilter: PhotoFilter) => {
    setFilter(newFilter);
  };

  // Clear filters
  const clearFilters = () => {
    setFilter({
      startDate: undefined,
      endDate: undefined,
      locationRadius: undefined,
      tags: undefined
    });
  };

  return {
    photos: (filteredPhotos || photos) as PhotoWithTags[],
    isLoading: isLoading || isFilteredLoading,
    isError,
    error,
    filter,
    uploadPhoto,
    updatePhoto,
    deletePhoto,
    addTagToPhoto,
    removeTagFromPhoto,
    applyFilters,
    clearFilters
  };
};

export default usePhotoStorage;
