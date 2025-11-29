import { 
  users, type User, type InsertUser, 
  photos, type Photo, type InsertPhoto,
  tags, type Tag, type InsertTag,
  photoTags, type PhotoTag, type InsertPhotoTag,
  type PhotoWithTags,
  type PhotoFilter,
  type Annotation, type InsertAnnotation
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

  // Annotation methods
  getAnnotationsForPhoto(photoId: number): Promise<Annotation[]>;
  createAnnotation(annotation: InsertAnnotation): Promise<Annotation>;
  updateAnnotation(id: number, data: Partial<InsertAnnotation>): Promise<Annotation | undefined>;
  deleteAnnotation(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private photos: Map<number, Photo>;
  private tags: Map<number, Tag>;
  private photoTags: Map<number, PhotoTag>;
  private annotations: Map<number, Annotation>;
  private currentUserId: number;
  private currentPhotoId: number;
  private currentTagId: number;
  private currentPhotoTagId: number;
  private currentAnnotationId: number;
  
  // Initialize sample data for testing
  private initializeSampleData = async () => {
    // Create sample tags
    const electricalTag = await this.createTag({ name: 'Electrical', aiGenerated: true, confidence: 0.95 });
    const structuralTag = await this.createTag({ name: 'Structural', aiGenerated: true, confidence: 0.92 });
    const plumbingTag = await this.createTag({ name: 'Plumbing', aiGenerated: true, confidence: 0.89 });
    const hvacTag = await this.createTag({ name: 'HVAC', aiGenerated: true, confidence: 0.94 });
    const safetyTag = await this.createTag({ name: 'Safety', aiGenerated: true, confidence: 0.97 });
    const maintenanceTag = await this.createTag({ name: 'Maintenance', aiGenerated: true, confidence: 0.91 });
    
    // Create sample photos with GPS coordinates
    const photo1 = await this.createPhoto({
      title: 'Electrical Panel Inspection',
      fileName: 'electrical_panel.jpg',
      fileSize: 2048,
      fileType: 'image/jpeg',
      base64Data: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAIBAQIBAQICAgICAgICAwUDAwMDAwYEBAMFBwYHBwcGBwcICQsJCAgKCAcHCg0KCgsMDAwMBwkODw0MDgsMDAz/2wBDAQICAgMDAwYDAwYMCAcIDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAz/wAARCAABAAEDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD9/KKKKAP/2Q==',
      latitude: '37.7749',
      longitude: '-122.4194',
      location: 'San Francisco Office',
      notes: 'Annual inspection of the main electrical panel',
      userId: 1
    });
    
    const photo2 = await this.createPhoto({
      title: 'Broken HVAC Unit',
      fileName: 'hvac_damage.jpg',
      fileSize: 1536,
      fileType: 'image/jpeg',
      base64Data: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAIBAQIBAQICAgICAgICAwUDAwMDAwYEBAMFBwYHBwcGBwcICQsJCAgKCAcHCg0KCgsMDAwMBwkODw0MDgsMDAz/2wBDAQICAgMDAwYDAwYMCAcIDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAz/wAARCAABAAEDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD9/KKKKAP/2Q==',
      latitude: '37.7833',
      longitude: '-122.4167',
      location: 'Oakland Site',
      notes: 'Commercial HVAC unit with damaged cooling coil',
      userId: 1
    });
    
    const photo3 = await this.createPhoto({
      title: 'Water Leak in Ceiling',
      fileName: 'water_leak.jpg',
      fileSize: 1789,
      fileType: 'image/jpeg',
      base64Data: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAIBAQIBAQICAgICAgICAwUDAwMDAwYEBAMFBwYHBwcGBwcICQsJCAgKCAcHCg0KCgsMDAwMBwkODw0MDgsMDAz/2wBDAQICAgMDAwYDAwYMCAcIDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAz/wAARCAABAAEDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD9/KKKKAP/2Q==',
      latitude: '37.7694',
      longitude: '-122.4862',
      location: 'Sunset District',
      notes: 'Water damage from pipe leak in office ceiling',
      userId: 1
    });
    
    const photo4 = await this.createPhoto({
      title: 'Safety Rail Installation',
      fileName: 'safety_rails.jpg',
      fileSize: 2156,
      fileType: 'image/jpeg',
      base64Data: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAIBAQIBAQICAgICAgICAwUDAwMDAwYEBAMFBwYHBwcGBwcICQsJCAgKCAcHCg0KCgsMDAwMBwkODw0MDgsMDAz/2wBDAQICAgMDAwYDAwYMCAcIDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAz/wAARCAABAAEDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD9/KKKKAP/2Q==',
      latitude: '37.8044',
      longitude: '-122.2711',
      location: 'Berkeley Campus',
      notes: 'New safety rails installed on loading dock',
      userId: 1
    });
    
    // Add tags to photos
    await this.addTagToPhoto(photo1.id, electricalTag.id);
    await this.addTagToPhoto(photo1.id, maintenanceTag.id);
    await this.addTagToPhoto(photo2.id, hvacTag.id);
    await this.addTagToPhoto(photo3.id, plumbingTag.id);
    await this.addTagToPhoto(photo3.id, structuralTag.id);
    await this.addTagToPhoto(photo4.id, safetyTag.id);
    await this.addTagToPhoto(photo4.id, structuralTag.id);
  }

  constructor() {
    this.users = new Map();
    this.photos = new Map();
    this.tags = new Map();
    this.photoTags = new Map();
    this.annotations = new Map();
    this.currentUserId = 1;
    this.currentPhotoId = 1;
    this.currentTagId = 1;
    this.currentPhotoTagId = 1;
    this.currentAnnotationId = 1;
    
    // Initialize with sample data
    this.initializeSampleData();
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
    if (filter.fromDate) {
      const fromDate = new Date(filter.fromDate);
      filteredPhotos = filteredPhotos.filter(photo => 
        photo.uploadedAt >= fromDate
      );
    }

    if (filter.toDate) {
      const toDate = new Date(filter.toDate);
      toDate.setHours(23, 59, 59, 999); // End of the day
      filteredPhotos = filteredPhotos.filter(photo => 
        photo.uploadedAt <= toDate
      );
    }

    // Filter by location
    if (filter.location) {
      filteredPhotos = filteredPhotos.filter(photo => 
        photo.location === filter.location
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

    // Filter by tags (now using tagIds)
    if (filter.tagIds && filter.tagIds.length > 0) {
      // Get all photos that have at least one of the requested tags
      const photoIds = new Set<number>();
      for (const photoTag of this.photoTags.values()) {
        if (filter.tagIds.includes(photoTag.tagId)) {
          photoIds.add(photoTag.photoId);
        }
      }

      filteredPhotos = filteredPhotos.filter(photo => photoIds.has(photo.id));
    }
    
    // Field technician filters
    
    // Filter by employee
    if (filter.employee) {
      filteredPhotos = filteredPhotos.filter(photo => 
        photo.employee === filter.employee ||
        // Fallback to title/notes for backwards compatibility
        photo.title.toLowerCase().includes(filter.employee.toLowerCase()) || 
        (photo.notes && photo.notes.toLowerCase().includes(filter.employee.toLowerCase()))
      );
    }
    
    // Filter by customer
    if (filter.customer) {
      filteredPhotos = filteredPhotos.filter(photo => 
        photo.customer === filter.customer ||
        // Fallback to title/notes for backwards compatibility
        photo.title.toLowerCase().includes(filter.customer.toLowerCase()) || 
        (photo.notes && photo.notes.toLowerCase().includes(filter.customer.toLowerCase()))
      );
    }
    
    // Filter by work order number
    if (filter.workOrderNumber) {
      filteredPhotos = filteredPhotos.filter(photo => 
        photo.workOrderNumber === filter.workOrderNumber ||
        // Fallback to title/notes for backwards compatibility
        photo.title.toLowerCase().includes(filter.workOrderNumber.toLowerCase()) || 
        (photo.notes && photo.notes.toLowerCase().includes(filter.workOrderNumber.toLowerCase()))
      );
    }
    
    // New advanced filters
    
    // Filter by project ID
    if (filter.projectId) {
      filteredPhotos = filteredPhotos.filter(photo => 
        photo.projectId === filter.projectId
      );
    }
    
    // Filter by category
    if (filter.category) {
      filteredPhotos = filteredPhotos.filter(photo => 
        photo.category === filter.category
      );
    }
    
    // Filter by equipment ID
    if (filter.equipmentId) {
      filteredPhotos = filteredPhotos.filter(photo => 
        photo.equipmentId === filter.equipmentId ||
        // Fallback to title/notes
        photo.title.toLowerCase().includes(filter.equipmentId.toLowerCase()) || 
        (photo.notes && photo.notes.toLowerCase().includes(filter.equipmentId.toLowerCase()))
      );
    }
    
    // Filter by priority
    if (filter.priority) {
      filteredPhotos = filteredPhotos.filter(photo => 
        photo.priority === filter.priority
      );
    }
    
    // Filter by status
    if (filter.status) {
      filteredPhotos = filteredPhotos.filter(photo => 
        photo.status === filter.status
      );
    }
    
    // Boolean filters
    
    // Filter by presence of coordinates
    if (filter.hasCoordinates === true) {
      filteredPhotos = filteredPhotos.filter(photo => 
        photo.latitude && photo.longitude
      );
    } else if (filter.hasCoordinates === false) {
      filteredPhotos = filteredPhotos.filter(photo => 
        !photo.latitude || !photo.longitude
      );
    }
    
    // Filter by presence of notes
    if (filter.hasNotes === true) {
      filteredPhotos = filteredPhotos.filter(photo => 
        photo.notes && photo.notes.trim() !== ''
      );
    } else if (filter.hasNotes === false) {
      filteredPhotos = filteredPhotos.filter(photo => 
        !photo.notes || photo.notes.trim() === ''
      );
    }
    
    // Filter by presence of tags (requires async operation, handled separately below)
    let hasTags = filter.hasTags;
    
    // Text search (search across multiple fields)
    if (filter.searchText && filter.searchText.trim() !== '') {
      const searchText = filter.searchText.toLowerCase().trim();
      filteredPhotos = filteredPhotos.filter(photo => 
        photo.title.toLowerCase().includes(searchText) ||
        (photo.location && photo.location.toLowerCase().includes(searchText)) ||
        (photo.notes && photo.notes.toLowerCase().includes(searchText)) ||
        (photo.category && photo.category.toLowerCase().includes(searchText)) ||
        (photo.customer && photo.customer.toLowerCase().includes(searchText)) ||
        (photo.employee && photo.employee.toLowerCase().includes(searchText)) ||
        (photo.workOrderNumber && photo.workOrderNumber.toLowerCase().includes(searchText))
      );
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

  // Annotation methods
  async getAnnotationsForPhoto(photoId: number): Promise<Annotation[]> {
    return Array.from(this.annotations.values())
      .filter(annotation => annotation.photoId === photoId);
  }

  async createAnnotation(insertAnnotation: InsertAnnotation): Promise<Annotation> {
    const id = this.currentAnnotationId++;
    const createdAt = new Date();
    const annotation: Annotation = { ...insertAnnotation, id, createdAt };
    this.annotations.set(id, annotation);
    return annotation;
  }

  async updateAnnotation(id: number, data: Partial<InsertAnnotation>): Promise<Annotation | undefined> {
    const annotation = this.annotations.get(id);
    if (!annotation) return undefined;

    const updatedAnnotation = { ...annotation, ...data };
    this.annotations.set(id, updatedAnnotation);
    return updatedAnnotation;
  }

  async deleteAnnotation(id: number): Promise<boolean> {
    if (!this.annotations.has(id)) return false;
    this.annotations.delete(id);
    return true;
  }
}

export const storage = new MemStorage();
