import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema from the original file
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Define Tag schema
export const tags = pgTable("tags", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  aiGenerated: boolean("ai_generated").default(false),
  confidence: json("confidence").default(1.0),
});

export const insertTagSchema = createInsertSchema(tags).omit({
  id: true
});

// Define Photo schema
export const photos = pgTable("photos", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  fileName: text("file_name").notNull(),
  fileType: text("file_type").notNull(),
  fileSize: integer("file_size").notNull(),
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
  latitude: text("latitude"),
  longitude: text("longitude"),
  location: text("location"),
  notes: text("notes"),
  base64Data: text("base64_data").notNull(),
  userId: integer("user_id").references(() => users.id),
  // Additional fields for advanced filtering
  projectId: text("project_id"),
  category: text("category"),
  equipmentId: text("equipment_id"),
  priority: text("priority"),
  status: text("status"),
  customer: text("customer"),
  workOrderNumber: text("work_order_number"),
  employee: text("employee"),
});

export const insertPhotoSchema = createInsertSchema(photos).omit({
  id: true,
  uploadedAt: true,
});

// Define PhotoTag schema for many-to-many relationship
export const photoTags = pgTable("photo_tags", {
  id: serial("id").primaryKey(),
  photoId: integer("photo_id").notNull().references(() => photos.id),
  tagId: integer("tag_id").notNull().references(() => tags.id),
});

export const insertPhotoTagSchema = createInsertSchema(photoTags).omit({
  id: true,
});

// Extended schemas for frontend/API use
export const photoFilterSchema = z.object({
  // Date filtering
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
  // Location filtering
  location: z.string().optional(),
  locationRadius: z.number().optional(),
  // Tag filtering
  tagIds: z.array(z.number()).optional(),
  // Field technician filters
  employee: z.string().optional(),
  customer: z.string().optional(),
  workOrderNumber: z.string().optional(),
  // Additional advanced filtering options
  projectId: z.string().optional(),
  category: z.string().optional(),
  equipmentId: z.string().optional(),
  priority: z.string().optional(),
  status: z.string().optional(),
  // Boolean filters
  hasCoordinates: z.boolean().optional(),
  hasTags: z.boolean().optional(),
  hasNotes: z.boolean().optional(),
  // Text search
  searchText: z.string().optional(),
});

// Type definitions
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertTag = z.infer<typeof insertTagSchema>;
export type Tag = typeof tags.$inferSelect;

export type InsertPhoto = z.infer<typeof insertPhotoSchema>;
export type Photo = typeof photos.$inferSelect;

export type InsertPhotoTag = z.infer<typeof insertPhotoTagSchema>;
export type PhotoTag = typeof photoTags.$inferSelect;

export type PhotoFilter = z.infer<typeof photoFilterSchema>;

// Define Annotation schema for photo annotations with symbols
export const annotations = pgTable("annotations", {
  id: serial("id").primaryKey(),
  photoId: integer("photo_id").notNull().references(() => photos.id),
  symbolType: text("symbol_type").notNull(), // fire_alarm, security, access_control, cctv, electrical, wiring, fire_suppression
  x: integer("x").notNull(), // X position as percentage (0-100)
  y: integer("y").notNull(), // Y position as percentage (0-100)
  note: text("note"), // Optional note for the annotation
  status: text("status"), // ok, issue, warning
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertAnnotationSchema = createInsertSchema(annotations).omit({
  id: true,
  createdAt: true,
});

export type InsertAnnotation = z.infer<typeof insertAnnotationSchema>;
export type Annotation = typeof annotations.$inferSelect;

// Symbol types for field technician annotations
export const ANNOTATION_SYMBOLS = {
  fire_alarm: { name: 'Fire Alarm', icon: '🔔', color: '#ef4444' },
  security: { name: 'Security', icon: '🛡️', color: '#3b82f6' },
  access_control: { name: 'Access Control', icon: '🚪', color: '#8b5cf6' },
  cctv: { name: 'CCTV', icon: '📹', color: '#6366f1' },
  electrical: { name: 'Electrical', icon: '⚡', color: '#f59e0b' },
  wiring: { name: 'Wiring', icon: '🔌', color: '#10b981' },
  fire_suppression: { name: 'Fire Suppression', icon: '🧯', color: '#dc2626' },
} as const;

export type SymbolType = keyof typeof ANNOTATION_SYMBOLS;

// Extended types that combine multiple schemas
export type PhotoWithTags = Photo & {
  tags: Tag[];
};

export type PhotoWithTagsAndAnnotations = PhotoWithTags & {
  annotations: Annotation[];
};
