import { PhotoWithTags, Tag } from '@shared/schema';
import { IStorage } from '../storage';

/**
 * Calculates similarity score between two photos
 * Higher score means more similarity
 */
export const calculateSimilarity = (photo1: PhotoWithTags, photo2: PhotoWithTags): number => {
  let score = 0;
  
  // Don't recommend the same photo
  if (photo1.id === photo2.id) {
    return 0;
  }
  
  // Location similarity - exact match gets highest score
  if (photo1.location && photo2.location && photo1.location === photo2.location) {
    score += 30;
  }
  
  // Location proximity using coordinates
  if (photo1.latitude && photo1.longitude && photo2.latitude && photo2.longitude) {
    const distance = calculateDistance(
      parseFloat(photo1.latitude), 
      parseFloat(photo1.longitude),
      parseFloat(photo2.latitude), 
      parseFloat(photo2.longitude)
    );
    
    // Photos within 0.1km get highest score, scale down for further distances
    if (distance < 0.1) {
      score += 25;
    } else if (distance < 0.5) {
      score += 20;
    } else if (distance < 1) {
      score += 15;
    } else if (distance < 5) {
      score += 10;
    } else if (distance < 10) {
      score += 5;
    }
  }
  
  // Field-specific metadata similarity
  if (photo1.employee && photo2.employee && photo1.employee === photo2.employee) {
    score += 10;
  }
  
  if (photo1.customer && photo2.customer && photo1.customer === photo2.customer) {
    score += 15;
  }
  
  if (photo1.workOrderNumber && photo2.workOrderNumber && photo1.workOrderNumber === photo2.workOrderNumber) {
    score += 20;
  }
  
  if (photo1.projectId && photo2.projectId && photo1.projectId === photo2.projectId) {
    score += 25;
  }
  
  if (photo1.category && photo2.category && photo1.category === photo2.category) {
    score += 20;
  }
  
  if (photo1.equipmentId && photo2.equipmentId && photo1.equipmentId === photo2.equipmentId) {
    score += 15;
  }
  
  // Tag similarity - each matching tag increases score
  const photo1Tags = new Set(photo1.tags.map(t => t.name.toLowerCase()));
  const photo2Tags = new Set(photo2.tags.map(t => t.name.toLowerCase()));
  const matchingTagCount = [...photo1Tags].filter(tag => photo2Tags.has(tag)).length;
  score += matchingTagCount * 7;
  
  // Time proximity - photos taken within similar timeframes
  const timeDistance = Math.abs(photo1.uploadedAt.getTime() - photo2.uploadedAt.getTime());
  const dayInMs = 86400000; // 24 * 60 * 60 * 1000
  
  if (timeDistance < dayInMs) {
    score += 10; // Same day
  } else if (timeDistance < dayInMs * 7) {
    score += 5; // Same week
  } else if (timeDistance < dayInMs * 30) {
    score += 2; // Same month
  }
  
  return score;
}

/**
 * Calculate distance between two points in kilometers using Haversine formula
 */
export const calculateDistance = (
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in km
  
  return distance;
}

/**
 * Recommends similar photos to the given photo
 * @param targetPhotoId - The ID of the photo to get recommendations for
 * @param storage - Storage instance
 * @param limit - Maximum number of recommendations to return
 */
export const getSimilarPhotos = async (
  targetPhotoId: number,
  storage: IStorage,
  limit = 5
): Promise<PhotoWithTags[]> => {
  const targetPhoto = await storage.getPhoto(targetPhotoId);
  if (!targetPhoto) {
    return [];
  }
  
  const allPhotos = await storage.getAllPhotos();
  
  // Calculate similarity scores for all photos
  const scoredPhotos = allPhotos
    .map(photo => ({
      photo,
      score: calculateSimilarity(targetPhoto, photo)
    }))
    .filter(item => item.score > 0) // Filter out photos with no similarity
    .sort((a, b) => b.score - a.score) // Sort by highest score first
    .slice(0, limit) // Take only the top recommendations
    .map(item => item.photo); // Return just the photos
  
  return scoredPhotos;
}

/**
 * Categorizes photos into groups based on common attributes
 * This is useful for creating contextual groups for display
 */
export const categorizePhotos = async (
  photos: PhotoWithTags[],
  groupLimit = 3
): Promise<{ category: string, photos: PhotoWithTags[] }[]> => {
  const groups: { category: string, photos: PhotoWithTags[] }[] = [];
  
  // Group by location
  const locationGroups = new Map<string, PhotoWithTags[]>();
  photos.forEach(photo => {
    if (photo.location) {
      if (!locationGroups.has(photo.location)) {
        locationGroups.set(photo.location, []);
      }
      locationGroups.get(photo.location)!.push(photo);
    }
  });
  
  // Group by project
  const projectGroups = new Map<string, PhotoWithTags[]>();
  photos.forEach(photo => {
    if (photo.projectId) {
      if (!projectGroups.has(photo.projectId)) {
        projectGroups.set(photo.projectId, []);
      }
      projectGroups.get(photo.projectId)!.push(photo);
    }
  });
  
  // Group by category
  const categoryGroups = new Map<string, PhotoWithTags[]>();
  photos.forEach(photo => {
    if (photo.category) {
      if (!categoryGroups.has(photo.category)) {
        categoryGroups.set(photo.category, []);
      }
      categoryGroups.get(photo.category)!.push(photo);
    }
  });
  
  // Group by common tags
  const tagGroups = new Map<string, PhotoWithTags[]>();
  photos.forEach(photo => {
    photo.tags.forEach(tag => {
      const tagName = tag.name;
      if (!tagGroups.has(tagName)) {
        tagGroups.set(tagName, []);
      }
      tagGroups.get(tagName)!.push(photo);
    });
  });
  
  // Add location groups
  for (const [location, locationPhotos] of locationGroups.entries()) {
    if (locationPhotos.length > 1) { // Only include groups with multiple photos
      groups.push({
        category: `Location: ${location}`,
        photos: locationPhotos.slice(0, 4) // Limit photos per group
      });
    }
  }
  
  // Add project groups
  for (const [project, projectPhotos] of projectGroups.entries()) {
    if (projectPhotos.length > 1) {
      groups.push({
        category: `Project: ${project}`,
        photos: projectPhotos.slice(0, 4)
      });
    }
  }
  
  // Add category groups
  for (const [category, categoryPhotos] of categoryGroups.entries()) {
    if (categoryPhotos.length > 1) {
      groups.push({
        category: `Category: ${category}`,
        photos: categoryPhotos.slice(0, 4)
      });
    }
  }
  
  // Add tag groups (only for tags with significant number of photos)
  for (const [tag, tagPhotos] of tagGroups.entries()) {
    if (tagPhotos.length > 1) {
      groups.push({
        category: `Tag: ${tag}`,
        photos: tagPhotos.slice(0, 4)
      });
    }
  }
  
  // Sort groups by number of photos (descending) and take the top groups
  return groups
    .sort((a, b) => b.photos.length - a.photos.length)
    .slice(0, groupLimit);
}

/**
 * Gets recommendations based on a text query
 * Useful for searching and creating relevant suggestions
 */
export const getRecommendationsByQuery = async (
  query: string,
  storage: IStorage,
  limit = 5
): Promise<PhotoWithTags[]> => {
  const allPhotos = await storage.getAllPhotos();
  const queryTerms = query.toLowerCase().split(/\s+/);
  
  // Score photos based on relevance to query terms
  const scoredPhotos = allPhotos
    .map(photo => {
      let score = 0;
      
      // Check if query terms appear in various fields
      queryTerms.forEach(term => {
        // Check title
        if (photo.title.toLowerCase().includes(term)) {
          score += 10;
        }
        
        // Check location
        if (photo.location && photo.location.toLowerCase().includes(term)) {
          score += 8;
        }
        
        // Check notes
        if (photo.notes && photo.notes.toLowerCase().includes(term)) {
          score += 6;
        }
        
        // Check tags
        if (photo.tags.some(tag => tag.name.toLowerCase().includes(term))) {
          score += 12;
        }
        
        // Check other metadata
        if (photo.category && photo.category.toLowerCase().includes(term)) {
          score += 7;
        }
        
        if (photo.projectId && photo.projectId.toLowerCase().includes(term)) {
          score += 7;
        }
        
        if (photo.customer && photo.customer.toLowerCase().includes(term)) {
          score += 5;
        }
        
        if (photo.employee && photo.employee.toLowerCase().includes(term)) {
          score += 4;
        }
      });
      
      return { photo, score };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.photo);
  
  return scoredPhotos;
}