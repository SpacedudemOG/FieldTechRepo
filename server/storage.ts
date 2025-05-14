import { 
  users, type User, type InsertUser, 
  photos, type Photo, type InsertPhoto,
  tags, type Tag, type InsertTag,
  photoTags, type PhotoTag, type InsertPhotoTag,
  type PhotoWithTags,
  type PhotoFilter
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Photo methods
  getAllPhotos(): Promise<PhotoWithTags[]>;
  getPhoto(id: number): Promise<PhotoWithTags | undefined>;
  createPhoto(photo: InsertPhoto): Promise<Photo>;
  updatePhoto(id: number, photoData: Partial<InsertPhoto>): Promise<Photo | undefined>;
  deletePhoto(id: number): Promise<boolean>;
  filterPhotos(filter: PhotoFilter): Promise<PhotoWithTags[]>;

  // Tag methods
  getAllTags(): Promise<Tag[]>;
  getTag(id: number): Promise<Tag | undefined>;
  getTagByName(name: string): Promise<Tag | undefined>;
  createTag(tag: InsertTag): Promise<Tag>;
  deleteTag(id: number): Promise<boolean>;

  // PhotoTag methods
  addTagToPhoto(photoId: number, tagId: number): Promise<PhotoTag>;
  removeTagFromPhoto(photoId: number, tagId: number): Promise<boolean>;
  getTagsForPhoto(photoId: number): Promise<Tag[]>;
  getPhotosWithTag(tagId: number): Promise<Photo[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private photos: Map<number, Photo>;
  private tags: Map<number, Tag>;
  private photoTags: Map<number, PhotoTag>;
  private currentUserId: number;
  private currentPhotoId: number;
  private currentTagId: number;
  private currentPhotoTagId: number;

  constructor() {
    this.users = new Map();
    this.photos = new Map();
    this.tags = new Map();
    this.photoTags = new Map();
    this.currentUserId = 1;
    this.currentPhotoId = 1;
    this.currentTagId = 1;
    this.currentPhotoTagId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Photo methods
  async getAllPhotos(): Promise<PhotoWithTags[]> {
    return Promise.all(
      Array.from(this.photos.values()).map(async (photo) => {
        return {
          ...photo,
          tags: await this.getTagsForPhoto(photo.id)
        };
      })
    );
  }

  async getPhoto(id: number): Promise<PhotoWithTags | undefined> {
    const photo = this.photos.get(id);
    if (!photo) return undefined;

    const tags = await this.getTagsForPhoto(id);
    return { ...photo, tags };
  }

  async createPhoto(insertPhoto: InsertPhoto): Promise<Photo> {
    const id = this.currentPhotoId++;
    const uploadedAt = new Date();
    const photo: Photo = { ...insertPhoto, id, uploadedAt };
    this.photos.set(id, photo);
    return photo;
  }

  async updatePhoto(id: number, photoData: Partial<InsertPhoto>): Promise<Photo | undefined> {
    const photo = this.photos.get(id);
    if (!photo) return undefined;

    const updatedPhoto = { ...photo, ...photoData };
    this.photos.set(id, updatedPhoto);
    return updatedPhoto;
  }

  async deletePhoto(id: number): Promise<boolean> {
    if (!this.photos.has(id)) return false;
    this.photos.delete(id);

    // Delete associated photo tags
    for (const [photoTagId, photoTag] of this.photoTags.entries()) {
      if (photoTag.photoId === id) {
        this.photoTags.delete(photoTagId);
      }
    }

    return true;
  }

  async filterPhotos(filter: PhotoFilter): Promise<PhotoWithTags[]> {
    let filteredPhotos = Array.from(this.photos.values());

    // Filter by date range
    if (filter.startDate) {
      const startDate = new Date(filter.startDate);
      filteredPhotos = filteredPhotos.filter(photo => 
        photo.uploadedAt >= startDate
      );
    }

    if (filter.endDate) {
      const endDate = new Date(filter.endDate);
      endDate.setHours(23, 59, 59, 999); // End of the day
      filteredPhotos = filteredPhotos.filter(photo => 
        photo.uploadedAt <= endDate
      );
    }

    // Filter by location radius (simplified)
    if (filter.locationRadius && filter.locationRadius > 0) {
      // This is a simplified version - in a real app we'd calculate real distances
      // For now, just return photos that have coordinates
      filteredPhotos = filteredPhotos.filter(photo => 
        photo.latitude && photo.longitude
      );
    }

    // Filter by tags
    if (filter.tags && filter.tags.length > 0) {
      // Get all photos that have at least one of the requested tags
      const photoIds = new Set<number>();
      for (const photoTag of this.photoTags.values()) {
        const tag = this.tags.get(photoTag.tagId);
        if (tag && filter.tags.includes(tag.name)) {
          photoIds.add(photoTag.photoId);
        }
      }

      filteredPhotos = filteredPhotos.filter(photo => photoIds.has(photo.id));
    }

    // Convert to PhotoWithTags
    return Promise.all(
      filteredPhotos.map(async (photo) => {
        return {
          ...photo,
          tags: await this.getTagsForPhoto(photo.id)
        };
      })
    );
  }

  // Tag methods
  async getAllTags(): Promise<Tag[]> {
    return Array.from(this.tags.values());
  }

  async getTag(id: number): Promise<Tag | undefined> {
    return this.tags.get(id);
  }

  async getTagByName(name: string): Promise<Tag | undefined> {
    return Array.from(this.tags.values()).find(
      (tag) => tag.name.toLowerCase() === name.toLowerCase(),
    );
  }

  async createTag(insertTag: InsertTag): Promise<Tag> {
    const id = this.currentTagId++;
    const tag: Tag = { ...insertTag, id };
    this.tags.set(id, tag);
    return tag;
  }

  async deleteTag(id: number): Promise<boolean> {
    if (!this.tags.has(id)) return false;
    this.tags.delete(id);

    // Remove the tag from all photos
    for (const [photoTagId, photoTag] of this.photoTags.entries()) {
      if (photoTag.tagId === id) {
        this.photoTags.delete(photoTagId);
      }
    }

    return true;
  }

  // PhotoTag methods
  async addTagToPhoto(photoId: number, tagId: number): Promise<PhotoTag> {
    // Check if this relation already exists
    const existing = Array.from(this.photoTags.values()).find(
      pt => pt.photoId === photoId && pt.tagId === tagId
    );
    
    if (existing) return existing;

    const id = this.currentPhotoTagId++;
    const photoTag: PhotoTag = { id, photoId, tagId };
    this.photoTags.set(id, photoTag);
    return photoTag;
  }

  async removeTagFromPhoto(photoId: number, tagId: number): Promise<boolean> {
    for (const [id, photoTag] of this.photoTags.entries()) {
      if (photoTag.photoId === photoId && photoTag.tagId === tagId) {
        this.photoTags.delete(id);
        return true;
      }
    }
    return false;
  }

  async getTagsForPhoto(photoId: number): Promise<Tag[]> {
    const tagIds = Array.from(this.photoTags.values())
      .filter(photoTag => photoTag.photoId === photoId)
      .map(photoTag => photoTag.tagId);
    
    return tagIds.map(id => this.tags.get(id)).filter(Boolean) as Tag[];
  }

  async getPhotosWithTag(tagId: number): Promise<Photo[]> {
    const photoIds = Array.from(this.photoTags.values())
      .filter(photoTag => photoTag.tagId === tagId)
      .map(photoTag => photoTag.photoId);
    
    return photoIds.map(id => this.photos.get(id)).filter(Boolean) as Photo[];
  }
}

export const storage = new MemStorage();
