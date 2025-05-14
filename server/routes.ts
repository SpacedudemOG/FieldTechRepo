import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { z } from "zod";
import { storage } from "./storage";
import { extractGPSInfo } from "./services/exif";
import { analyzeImage } from "./services/openai";
import { processFieldTechnicianPhoto, suggestDomainSpecificTags } from "./services/anthropic";
import { 
  insertPhotoSchema, 
  insertTagSchema, 
  photoFilterSchema 
} from "@shared/schema";

// Configure multer for in-memory storage
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

export async function registerRoutes(app: Express): Promise<Server> {
  // API prefix
  const apiRouter = express.Router();
  app.use('/api', apiRouter);

  // Get all photos with tags
  apiRouter.get('/photos', async (req: Request, res: Response) => {
    try {
      const photos = await storage.getAllPhotos();
      res.json(photos);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch photos" });
    }
  });

  // Get a single photo by ID
  apiRouter.get('/photos/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const photo = await storage.getPhoto(id);
      
      if (!photo) {
        return res.status(404).json({ message: "Photo not found" });
      }
      
      res.json(photo);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch photo" });
    }
  });

  // Upload a new photo
  apiRouter.post('/photos', upload.single('photo'), async (req: Request, res: Response) => {
    try {
      // Validate form data
      if (!req.file) {
        return res.status(400).json({ message: "No photo provided" });
      }

      // Extract EXIF data for GPS coordinates
      const gpsInfo = await extractGPSInfo(req.file.buffer);

      // Convert file to base64 for storage
      const base64Data = req.file.buffer.toString('base64');
      
      // Prepare photo data
      const photoData = {
        title: req.body.title || 'Untitled Photo',
        fileName: req.file.originalname,
        fileType: req.file.mimetype,
        fileSize: req.file.size,
        base64Data,
        latitude: gpsInfo.latitude,
        longitude: gpsInfo.longitude,
        location: gpsInfo.location,
        notes: req.body.notes,
        userId: req.body.userId ? parseInt(req.body.userId) : undefined
      };

      // Validate data using schema
      const validatedData = insertPhotoSchema.parse(photoData);
      
      // Create photo record
      const photo = await storage.createPhoto(validatedData);
      
      // If tags were provided, add them
      if (req.body.tags) {
        const tags = JSON.parse(req.body.tags);
        for (const tagName of tags) {
          // Check if tag exists
          let tag = await storage.getTagByName(tagName);
          
          // Create tag if it doesn't exist
          if (!tag) {
            tag = await storage.createTag({ name: tagName, aiGenerated: false });
          }
          
          // Associate tag with photo
          await storage.addTagToPhoto(photo.id, tag.id);
        }
      }

      // Get AI tag suggestions if OpenAI API key is available
      if (process.env.OPENAI_API_KEY) {
        try {
          const suggestedTags = await analyzeImage(base64Data);
          
          // Add AI-generated tags
          for (const tagName of suggestedTags) {
            let tag = await storage.getTagByName(tagName);
            if (!tag) {
              tag = await storage.createTag({ name: tagName, aiGenerated: true });
            }
            await storage.addTagToPhoto(photo.id, tag.id);
          }
        } catch (aiError) {
          console.error("AI tagging error:", aiError);
          // Continue with upload even if AI tagging fails
        }
      }

      // Return the complete photo with its tags
      const photoWithTags = await storage.getPhoto(photo.id);
      res.status(201).json(photoWithTags);
    } catch (error) {
      console.error("Photo upload error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid photo data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to upload photo" });
    }
  });

  // Update a photo
  apiRouter.patch('/photos/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const photoData = req.body;

      const updatedPhoto = await storage.updatePhoto(id, photoData);
      
      if (!updatedPhoto) {
        return res.status(404).json({ message: "Photo not found" });
      }
      
      // Return the complete photo with its tags
      const photoWithTags = await storage.getPhoto(id);
      res.json(photoWithTags);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid photo data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update photo" });
    }
  });

  // Delete a photo
  apiRouter.delete('/photos/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deletePhoto(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Photo not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete photo" });
    }
  });

  // Filter photos
  apiRouter.post('/photos/filter', async (req: Request, res: Response) => {
    try {
      const filterParams = photoFilterSchema.parse(req.body);
      const filteredPhotos = await storage.filterPhotos(filterParams);
      res.json(filteredPhotos);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid filter parameters", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to filter photos" });
    }
  });

  // Get all tags
  apiRouter.get('/tags', async (req: Request, res: Response) => {
    try {
      const tags = await storage.getAllTags();
      res.json(tags);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tags" });
    }
  });

  // Create a new tag
  apiRouter.post('/tags', async (req: Request, res: Response) => {
    try {
      const tagData = insertTagSchema.parse(req.body);
      
      // Check if tag already exists
      const existingTag = await storage.getTagByName(tagData.name);
      if (existingTag) {
        return res.status(409).json({ message: "Tag already exists", tag: existingTag });
      }
      
      const tag = await storage.createTag(tagData);
      res.status(201).json(tag);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid tag data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create tag" });
    }
  });

  // Add a tag to a photo
  apiRouter.post('/photos/:photoId/tags/:tagId', async (req: Request, res: Response) => {
    try {
      const photoId = parseInt(req.params.photoId);
      const tagId = parseInt(req.params.tagId);
      
      // Check if photo exists
      const photo = await storage.getPhoto(photoId);
      if (!photo) {
        return res.status(404).json({ message: "Photo not found" });
      }
      
      // Check if tag exists
      const tag = await storage.getTag(tagId);
      if (!tag) {
        return res.status(404).json({ message: "Tag not found" });
      }
      
      const photoTag = await storage.addTagToPhoto(photoId, tagId);
      res.status(201).json(photoTag);
    } catch (error) {
      res.status(500).json({ message: "Failed to add tag to photo" });
    }
  });

  // Remove a tag from a photo
  apiRouter.delete('/photos/:photoId/tags/:tagId', async (req: Request, res: Response) => {
    try {
      const photoId = parseInt(req.params.photoId);
      const tagId = parseInt(req.params.tagId);
      
      const removed = await storage.removeTagFromPhoto(photoId, tagId);
      
      if (!removed) {
        return res.status(404).json({ message: "Tag not found on photo" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to remove tag from photo" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
