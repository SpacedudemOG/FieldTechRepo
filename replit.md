# FieldVision - Field Technician Photo Repository

## Overview

FieldVision is a comprehensive photo repository system designed for field technicians to capture, organize, and analyze photos from job sites. The application combines GPS data extraction, interactive map visualization, AI-powered image analysis, and intelligent photo recommendations to help field teams document and manage their work efficiently.

The system enables technicians to upload photos with automatic GPS coordinate extraction, receive AI-generated tags describing equipment and conditions, annotate images with safety symbols, and discover related photos through smart recommendation algorithms. Built as a full-stack TypeScript application, it features a React frontend with mapping capabilities and an Express backend with AI integrations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack**: The frontend is built with React 18, TypeScript, and Vite as the build tool. It uses Wouter for lightweight client-side routing instead of React Router.

**UI Framework**: Implements shadcn/ui component library with Radix UI primitives and Tailwind CSS for styling. The design system follows a "new-york" style with customizable CSS variables for theming support (light/dark modes).

**State Management**: Uses TanStack Query (React Query) v5 for server state management, caching, and data synchronization. No global client state management library is used; component-level state with hooks handles local UI state.

**Map Integration**: Originally designed for Google Maps via `@react-google-maps/api`, with fallback implementations using Mapbox GL and Leaflet for static map display. The map context providers (`MapContext`, `SimpleMapContext`) abstract the map library to allow switching implementations.

**Responsive Design**: Mobile-first approach with dedicated mobile navigation components and adaptive layouts that transform between desktop and mobile views. Uses Tailwind's responsive utilities extensively.

### Backend Architecture

**Framework**: Express.js server running on Node.js with TypeScript. Uses ESM modules throughout.

**API Structure**: RESTful API with `/api` prefix for all endpoints. Routes organized in `server/routes.ts` with clean separation of concerns.

**File Upload**: Multer middleware configured for in-memory storage with 10MB file size limits. Photos are stored as base64-encoded strings in the database rather than on disk.

**Error Handling**: Centralized error middleware that normalizes error responses and returns JSON with status codes.

**Development Tooling**: Vite integration for HMR in development, with custom middleware setup in `server/vite.ts`. Production builds serve static files from dist directory.

### Data Storage

**Database**: PostgreSQL accessed via Neon serverless driver (`@neondatabase/serverless`). Configuration managed through `DATABASE_URL` environment variable.

**ORM**: Drizzle ORM for type-safe database operations and schema management. Schema definitions in `shared/schema.ts` use Drizzle's table builders.

**Schema Design**:
- **users**: Basic user authentication (id, username, password)
- **photos**: Core entity storing photo metadata, base64 image data, GPS coordinates, and field-specific attributes (projectId, equipmentId, workOrderNumber, customer, priority, status, category)
- **tags**: Tag definitions with AI-generated flag and confidence scores
- **photoTags**: Many-to-many junction table linking photos to tags
- **annotations**: Photo annotations with symbol types (fire, safety, electrical hazards, etc.) and coordinate positions

**Data Access Pattern**: Storage interface (`IStorage`) defines all database operations. Includes `MemStorage` in-memory implementation for testing and development. Type-safe operations using Zod schemas for validation.

### AI Integrations

**Anthropic Claude**: Primary AI service using Claude 3.7 Sonnet for domain-specific image analysis. Provides field technician equipment recognition with context about HVAC systems, electrical panels, safety equipment, and common maintenance scenarios. Generates tags with confidence scores based on equipment type, condition, and maintenance context.

**OpenAI GPT-4o**: Secondary AI service for general image analysis and tag suggestions. Used for visual object detection and environment classification. Falls back to mock suggestions when API key unavailable.

**Implementation Pattern**: Heavy AI operations performed server-side via `/api/photos/analyze` endpoints. Client sends base64 image data; server manages API calls and returns structured results. This keeps API keys secure and reduces client bundle size.

### External Dependencies

**Third-Party Services**:
- **Neon Database**: Serverless PostgreSQL hosting, accessed via `@neondatabase/serverless` driver
- **Anthropic API**: Claude 3.7 Sonnet for domain-specific image analysis (requires `ANTHROPIC_API_KEY`)
- **OpenAI API**: GPT-4o for general image recognition (requires `OPENAI_API_KEY`)
- **Google Maps API**: Primary mapping service (requires API key from `/api/map-key` endpoint)
- **Mapbox**: Fallback mapping service using Mapbox GL JS v2.15.0
- **Leaflet**: Alternative static map implementation with OpenStreetMap tiles

**Key Libraries**:
- **@tanstack/react-query**: Server state management and caching
- **drizzle-orm** & **drizzle-kit**: Database ORM and migrations
- **zod**: Runtime type validation and schema parsing
- **multer**: Multipart form data and file upload handling
- **exif-reader**: GPS data extraction from image metadata (currently using mock data)
- **react-helmet**: Document head management for SEO
- **date-fns**: Date formatting and manipulation
- **recharts**: Data visualization for dashboard analytics

**Authentication**: Basic user schema present but no active authentication middleware implemented. System operates without session management or protected routes currently.

**Build & Deployment**:
- Development: `tsx` for TypeScript execution, Vite dev server with HMR
- Production: Vite builds client to `dist/public`, esbuild bundles server to `dist/index.js`
- Database migrations: Drizzle Kit push command (`npm run db:push`)

**Recommendation Engine**: Custom similarity algorithm in `recommendationService.ts` calculates photo similarity based on location proximity (haversine distance), shared tags, matching metadata fields (employee, customer, project), and temporal proximity. Returns categorized photo groups and similar photo suggestions.

**File Organization**: Monorepo structure with `client/`, `server/`, and `shared/` directories. Path aliases configured in TypeScript and Vite for clean imports (`@/`, `@shared/`, `@assets/`).