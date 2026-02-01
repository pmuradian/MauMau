# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MauMau is a **print-on-demand photobook service**. Users design custom photobooks in the browser, then a printing company prints and ships the physical photobooks to customers.

**Core product flow:**
1. User creates/designs a photobook online
2. User places an order (future)
3. Printing partner produces the photobook
4. Photobook is shipped to the user

The current focus is on the **creation experience** - the editor where users design their photobooks.

### Page Formats vs Image Layouts

There are two levels of layout:

1. **Page Format** (photobook size) - Three options planned:
   - A4 Portrait
   - A4 Landscape
   - Square (dimensions TBD)

2. **Image Layouts** (arrangement within a page) - How images are positioned:
   - HorizontalTriplet, VerticalTriplet, etc.
   - Each layout has numbered dropZones for image placement

## Development Commands

### Frontend (from root or frontend/)
```bash
npm run dev              # Start dev server with hot reload (port 5173)
npm run build            # Production build
npm run start            # Serve production build
npm run typecheck        # Generate types and run TypeScript compiler

# Testing
npm test                 # Run tests in watch mode
npm run test:ui          # Open Vitest UI
npm run test:coverage    # Generate coverage report
npx vitest run           # Run tests once without watch
npx vitest run <path>    # Run specific test file
```

### Backend (from backend/)
```bash
npx ts-node main.ts      # Start photobook API server (port 3000)
npx ts-node server.ts    # Start auth API server (port 3001)
```

**Note:** Currently two separate servers. Need to run both for full functionality.

## Architecture Overview

### Core Data Flow

The app uses a **class-based data model** with two primary classes:

- `PageData` (app/photobook/types.ts:3) - Represents a single page with:
  - `pageNumber`: Page index
  - `images`: Dictionary mapping dropZoneIndex → image URL
  - `layout`: LayoutType ('horizontal-triplet', 'vertical-triplet', etc.)

- `PhotobookData` (app/photobook/types.ts:11) - Top-level photobook with:
  - `title`, `description`: Metadata
  - `images[]`: Array of all image URLs
  - `pages[]`: Array of PageData instances

### Image Coordinate System

Images are positioned using **dropZone indices** rather than arbitrary coordinates:

- Each layout has numbered dropZones (0, 1, 2...)
- When an image is dropped, it's assigned to a specific dropZoneIndex
- The backend stores: `{ x, y, width, height, dropZoneIndex }`
- This ensures consistent positioning across different layouts

Example flow:
1. User drops image into second dropZone of HorizontalTriplet layout
2. Frontend calls `uploadImage(photobookId, imageData, { x, y, width, height, dropZoneIndex: 1 })`
3. Backend stores association: dropZoneIndex 1 → image URL
4. When re-rendering, `initialImages` prop maps: `{ 1: imageUrl }`

### Layout System

Five layout components in `app/UserInterface/Layouts.tsx`:

1. **HorizontalTriplet** - 2 images top, 1 wide bottom (3 dropZones)
2. **VerticalTriplet** - 2 images left, 1 large right (3 dropZones)
3. **VerticalArrangement** - 2 images stacked (2 dropZones)
4. **HorizontalArrangement** - 2 images side-by-side (2 dropZones)
5. **SingleImageLayout** - 1 full-page image (1 dropZone)

All layouts:
- Accept `onImageDropped(file, coords, dropZoneIndex)` callback
- Accept `onImageRemoved(dropZoneIndex)` callback
- Accept `initialImages` prop to restore state
- Use `Dropzone` component for image handling

### Authentication Flow

JWT-based auth with React Context (app/contexts/AuthContext.tsx):

1. **Login/Register** - Forms POST to `/api/auth/login` or `/api/auth/register`
2. **Token Storage** - JWT saved to `localStorage.getItem('token')`
3. **Auto-verify** - On app startup, AuthContext calls `/api/auth/me` to validate token
4. **Context API** - `useAuth()` hook provides `{ user, login, logout, isLoading }`

All auth endpoints should be prefixed with `/api/auth/` to distinguish from photobook API.

### Routing

React Router 7 with file-based routes (app/routes.ts):

- Index route → `routes/home.tsx`
- `/login` → `routes/login.tsx`
- `/register` → `routes/register.tsx`
- `/photobook` → `photobook/photobook.tsx`

Routes are SSR-capable but currently run client-side only.

### Backend Architecture

**Framework:** Express.js with TypeScript
**Database:** MongoDB with Mongoose ODM
**Two servers (needs consolidation):**
- Port 3000: Photobook operations (`main.ts`)
- Port 3001: Authentication (`server.ts`)

#### Backend Folder Structure
```
backend/
├── config/database.ts       # MongoDB connection
├── middleware/auth.ts       # JWT auth middleware
├── models/
│   ├── User.ts              # User schema (name, email, password)
│   └── Photobook.ts         # Photobook schema with pages/images
├── routes/auth.ts           # Auth endpoints
├── main.ts                  # Photobook API server
├── server.ts                # Auth API server
├── storage.ts               # In-memory DemoStorage (temporary)
└── pdf-service.ts           # PDF generation with PDFKit
```

#### MongoDB Models

**User** (`models/User.ts`):
- `name`, `email`, `password` (hashed with bcrypt)
- `comparePassword()` method for auth

**Photobook** (`models/Photobook.ts`):
- `userId` (ref to User)
- `title`, `description`
- `pages[]` - Array of Page objects
- `pageOrder[]` - For drag-and-drop reordering
- Methods: `setImage()`, `removeImage()`, `addPage()`, `setPageOrder()`

**Page** (nested in Photobook):
- `pageNumber`, `layout` (LayoutType)
- `images[]` - Array of ImagePlacement objects

**ImagePlacement** (nested in Page):
- `imageData` (base64), `x`, `y`, `width`, `height`, `dropZoneIndex`

#### Current Storage Situation

**Problem:** The API currently uses `DemoStorage` (`storage.ts`) which stores everything in-memory as base64 strings. This means:
- No persistence between server restarts
- All data lost on crash
- Not scalable for production

**Models exist but aren't wired up:** The MongoDB models in `models/` are defined but the API routes in `main.ts` use the in-memory `DemoStorage` instead.

#### API Endpoints

**Photobook Operations (port 3000):**
- `POST /create` - Create new photobook
- `GET /photobook?key={id}` - Fetch photobook data
- `POST /upload?key={id}` - Upload image with coords
- `DELETE /remove-image?key={id}&dropZoneIndex={n}` - Remove image
- `PUT /update-title?key={id}` - Update photobook title
- `GET /generate-pdf?key={id}` - Generate PDF (returns Blob)

**Auth Operations (port 3001):**
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login and get token
- `GET /api/auth/me` - Verify token and get user

The photobook API uses `?key={photobookId}` query params, not path params.

### Styling Architecture

**Tailwind CSS 4.1.4** with custom CSS for specific components:

- Global styles: `app/app.css`
- Photobook-specific: `app/photobook/photobook.css`
- Auth pages: `app/routes/auth.css`
- Layout selector: `app/UserInterface/Styles/layout-selector.css`

**A4 Page Format:**
- `.a4-page` class provides consistent A4 aspect ratio (1:1.414)
- `.main-page` modifier applies 80vh height on main view
- All page components use unified styling from `photobook.css`

### Testing

Vitest with React Testing Library (vitest.config.ts):

- Environment: jsdom
- Setup file: `test/setup.ts`
- Path aliases configured: `networking`, `UserInterface`
- Tests located in `test/` directory mirroring `app/` structure

When writing tests:
- Import using aliases: `import { createPhotobook } from 'networking/NetworkService'`
- Mock fetch for API calls
- Use `@testing-library/react` for component tests

## Key Implementation Patterns

### Adding a New Layout

1. Create layout component in `app/UserInterface/Layouts.tsx`
2. Add layout type to `LayoutType` in `app/UserInterface/LayoutSelector.tsx`
3. Update layout selector modal to include new option
4. Ensure component accepts `onImageDropped`, `onImageRemoved`, `initialImages` props

### Adding a New API Endpoint

1. Add function to `app/networking/NetworkService.ts`
2. Follow existing patterns: proper error handling with `async/await` and error text logging
3. Use query params `?key={photobookId}` for photobook-related endpoints
4. Return typed promises: `Promise<any>` or `Promise<Blob>` for PDFs

### Modifying Photobook State

The photobook component (app/photobook/photobook.tsx) maintains state and syncs with backend:
- Local state updates happen immediately for responsive UI
- Backend syncs happen via NetworkService functions
- Use `viewPhotobook(id)` to fetch latest state from server
- Image URLs from backend are used directly in `<img src={url} />` tags

## Roadmap

### Phase 1: Frontend UI ✓ (Mostly Complete)
- [x] Page reordering (drag & drop)
- [x] Sidebar with page previews
- [x] Layout selector
- [ ] Add/remove page functionality (partial)
- [ ] Page format selection (A4 portrait/landscape, square)

### Phase 2: Backend Persistence (Current Focus)
- [ ] Wire up MongoDB models to API routes (replace DemoStorage)
- [ ] Image storage to filesystem (local dev) with S3-ready interface
- [ ] Link photobooks to authenticated users
- [ ] Consolidate two servers into one
- [ ] Print-ready PDF export with proper specs

### Phase 3: Authentication & Accounts
- [ ] Fix authentication flow
- [ ] Refresh token mechanism (avoid session expiry during editing)
- [ ] User dashboard with saved photobooks
- [ ] Order history

### Phase 4: Order & Checkout (Future)
- [ ] Pricing configuration
- [ ] Payment processing
- [ ] Order management

### Phase 5: Fulfillment (Future)
- [ ] Integration with printing partner
- [ ] Order tracking and shipping notifications

## Future Architecture

### Image Storage
- **AWS S3** for production image storage (scalable, CDN-friendly)
- Local file storage used during development, interface designed to swap in S3 later

### Content Moderation
- **AWS Rekognition** for image recognition to filter adult/inappropriate content
- Validation hook runs before images are saved to storage
