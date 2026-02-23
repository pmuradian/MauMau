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

### Frontend (from frontend/)
```bash
npm run dev              # Start dev server with hot reload (port 5173)
npm run build            # Production build
npm run start            # Serve production build
npm run typecheck        # Generate types and run TypeScript compiler

# Testing — must be run from frontend/, NOT from the repo root
npm test                 # Run tests in watch mode
npm run test:ui          # Open Vitest UI
npm run test:coverage    # Generate coverage report
npx vitest run           # Run tests once without watch
npx vitest run <path>    # Run specific test file
```

### Backend (from backend/)
```bash
npx ts-node main.ts      # Start API server (port 3000)
npm test                 # Run backend tests (node:test via ts-node)
```

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

### Image Upload Flow

Images are stored in a file storage layer (local filesystem in dev, S3 in production). MongoDB stores only the URL. The upload uses a **3-step presigned URL pattern**:

1. Frontend: `GET /api/upload-url?contentType=image/jpeg` → `{ uploadUrl, finalUrl }`
2. Frontend: `PUT {uploadUrl}` with raw binary (local: to backend; S3: direct to bucket)
3. Frontend: `POST /api/confirm-upload?key={id}` with `{ imageUrl: finalUrl, dropZoneIndex, pageNumber, layout }`

For local dev, `uploadUrl` is `http://localhost:3000/api/local-upload/{uuid}.ext` and `finalUrl` is `http://localhost:3000/uploads/{uuid}.ext`. Images are served as static files from `backend/uploads/`.

For production (S3), `uploadUrl` is a real presigned PUT URL and `finalUrl` is the S3 object URL.

The storage provider is selected via `STORAGE_PROVIDER=local|s3` env var (`backend/storage/index.ts`).

### Image Coordinate System

Images are positioned using **dropZone indices** rather than arbitrary coordinates:

- Each layout has numbered dropZones (0, 1, 2...)
- When an image is dropped, it's assigned to a specific dropZoneIndex
- MongoDB stores: `{ imageUrl, dropZoneIndex }` — no x/y coordinates
- When re-rendering, `initialImages` prop maps: `{ dropZoneIndex: imageUrl }`

### Layout System

Five layout components under `app/UserInterface/PageLayouts/`:

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

Dual-token auth with React Context (app/contexts/AuthContext.tsx):

1. **Login/Register** - Forms POST to `/api/auth/login` or `/api/auth/register`
2. **Access Token** (15min) - JWT saved to `localStorage`, sent in `Authorization` header
3. **Refresh Token** (30 days) - HTTP-only cookie, stored hashed in `RefreshToken` collection
4. **Silent Refresh** - On 401, frontend calls `POST /api/auth/refresh` to get a new access token
5. **Auto-verify** - On app startup, AuthContext calls `/api/auth/me`, falls back to refresh
6. **Context API** - `useAuth()` hook provides `{ user, login, logout, isLoading }`

All auth endpoints should be prefixed with `/api/auth/` to distinguish from photobook API.

Auth constants (access token expiry, refresh token TTL, cookie name) are centralised in `backend/config/auth.ts`.

### Routing

React Router 7 with file-based routes (app/routes.ts):

- Index route → `routes/home.tsx` (user dashboard — list, open, delete, create photobooks)
- `/login` → `routes/login.tsx`
- `/register` → `routes/register.tsx`
- `/photobook` → `photobook/photobook.tsx`

Routes are SSR-capable but currently run client-side only.

### Backend Architecture

**Framework:** Express.js with TypeScript
**Database:** MongoDB with Mongoose ODM
**Single server** on port 3000 (`main.ts`) — serves both auth and photobook APIs

#### Backend Folder Structure
```
backend/
├── config/
│   ├── database.ts           # MongoDB connection
│   └── auth.ts               # Auth constants (JWT_SECRET, token expiry, cookie name)
├── middleware/auth.ts        # JWT auth middleware
├── models/
│   ├── User.ts               # User schema (name, email, password)
│   └── Photobook.ts          # Photobook schema with pages/images + validation constants
├── routes/auth.ts            # Auth endpoints
├── services/
│   └── PhotobookService.ts   # Business logic for photobook operations (incl. file cleanup)
├── storage/
│   ├── IStorageProvider.ts   # Interface: getUploadUrl(), deleteFile(), isValidUrl()
│   ├── LocalStorageProvider.ts # Saves to backend/uploads/, serves via Express static
│   ├── S3StorageProvider.ts  # Stub — TODO: implement with @aws-sdk/s3-request-presigner
│   └── index.ts              # Factory: reads STORAGE_PROVIDER env var, exports singleton
├── utils/
│   └── validation.ts         # validatePageParams(), contentTypeToExtension()
├── uploads/                  # Runtime image storage (local dev only, gitignored)
├── main.ts                   # API server (auth + photobook)
└── pdf-service.ts            # PDF generation with PDFKit
```

#### MongoDB Models

**User** (`models/User.ts`):
- `name`, `email`, `password` (hashed with bcrypt)
- `comparePassword()` method for auth

**Photobook** (`models/Photobook.ts`):
- `userId` (ref to User)
- `title`, `description`
- `pages[]` - Array of Page objects (max 200)
- `pageOrder[]` - For drag-and-drop reordering
- Methods: `setImage()`, `removeImage()`, `addPage()`, `setPageOrder()`
- Exported constants: `MAX_PAGES` (200), `MAX_IMAGES_PER_PAGE` (10), `MAX_DROP_ZONE_INDEX` (9)

**Page** (nested in Photobook):
- `pageNumber` (1–200), `layout` (LayoutType)
- `images[]` - Array of ImagePlacement objects (max 10)

**ImagePlacement** (nested in Page):
- `imageUrl` — URL to the stored image file (local or S3)
- `dropZoneIndex` (0–9)

#### API Endpoints

**All endpoints served from port 3000:**

**Auth:**
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login and get token
- `GET /api/auth/me` - Verify token and get user
- `POST /api/auth/refresh` - Exchange refresh token for new access token

**Image upload (3-step presigned URL flow):**
- `GET /api/upload-url?contentType={mime}` - Get presigned/local upload URL
- `PUT /api/local-upload/:filename` - Receive binary for local dev (authenticated)
- `POST /api/confirm-upload?key={id}` - Store image URL in MongoDB after upload

**Photobook:**
- `POST /api/create` - Create new photobook
- `GET /api/photobook?key={id}` - Fetch photobook data
- `DELETE /api/remove-image?key={id}&dropZoneIndex={n}&pageNumber={n}` - Remove image (also deletes file from storage)
- `PUT /api/update-title?key={id}` - Update photobook title
- `GET /api/photobooks` - List user's photobooks
- `DELETE /api/photobook?key={id}` - Delete photobook (also deletes all image files)
- `POST /api/add-page?key={id}` - Add page
- `PUT /api/page-order?key={id}` - Update page order
- `PUT /api/page-layout?key={id}` - Update page layout
- `GET /api/generate-pdf?key={id}` - Generate PDF (returns Blob)

The photobook API uses `?key={photobookId}` query params, not path params.

#### Security

- **URL validation**: `storageProvider.isValidUrl(url)` is called in `POST /api/confirm-upload` before storing and in `pdf-service.ts` before fetching. Prevents URL injection and SSRF attacks.
- **Path traversal**: `PUT /api/local-upload/:filename` uses `path.basename()` + strict UUID+extension regex (`/^[0-9a-f-]{36}\.(jpg|png|webp|gif|heic|heif)$/`) before writing to disk.
- **Input validation**: `validatePageParams()` in `utils/validation.ts` enforces integer bounds on `pageNumber` (1–200) and `dropZoneIndex` (0–9) on all relevant endpoints.

### Styling Architecture

**Tailwind CSS 4.1.4** with custom CSS for specific components:

- Global styles: `app/app.css`
- Photobook-specific: `app/photobook/photobook.css`
- Auth pages: `app/routes/auth.css`
- Dashboard: `app/routes/home.css`
- Layout selector: `app/UserInterface/Styles/layout-selector.css`

**A4 Page Format:**
- `.a4-page` class provides consistent A4 aspect ratio (1:1.414)
- `.main-page` modifier applies 80vh height on main view
- All page components use unified styling from `photobook.css`

### Testing

**Frontend** — Vitest with React Testing Library (`frontend/vitest.config.ts`):
- Environment: jsdom
- Setup file: `test/setup.ts`
- Path aliases configured: `networking`, `UserInterface`
- Tests located in `test/` directory mirroring `app/` structure
- Import using aliases: `import { createPhotobook } from 'networking/NetworkService'`
- Mock fetch for API calls; use `@testing-library/react` for component tests

**Backend** — Node.js built-in `node:test` runner via ts-node (`backend/npm test`):
- Tests in `backend/test/`
- `api.test.ts` — Photobook model method tests (setImage, removeImage, addPage, setPageOrder, validation guards)
- `storage.test.ts` — LocalStorageProvider.isValidUrl() and filename validation regex tests
- `pdf-service.test.ts` — PDFService.generatePhotobookPDF() tests (no DB needed)

## Key Implementation Patterns

### Adding a New Layout

1. Create layout component in `app/UserInterface/PageLayouts/`
2. Add layout type to `LayoutType` in `app/UserInterface/LayoutSelector.tsx`
3. Update layout selector modal to include new option
4. Ensure component accepts `onImageDropped`, `onImageRemoved`, `initialImages` props

### Adding a New API Endpoint

1. Add function to `app/networking/NetworkService.ts`
2. Follow existing patterns: use `authFetch` + `handleResponse` for silent token refresh
3. Use query params `?key={photobookId}` for photobook-related endpoints
4. Return typed promises: `Promise<any>` or `Promise<Blob>` for PDFs
5. Add validation using `validatePageParams()` from `utils/validation.ts` if endpoint takes `pageNumber`/`dropZoneIndex`

### Image Upload (Frontend)

`PhotobookPage.tsx` `handleDrop` uses the 3-step flow:
1. `getUploadUrl(contentType)` → `{ uploadUrl, finalUrl }`
2. `putFileToBucket(uploadUrl, file.data, contentType)` — uses `authFetch` for local URLs, bare `fetch` for S3
3. `confirmUpload(photobookId, finalUrl, dropZoneIndex, pageNumber, layout)`
4. `onImageUpdated(dropZoneIndex, finalUrl)` — stores finalUrl in local state

### Modifying Photobook State

The photobook component (app/photobook/photobook.tsx) maintains state and syncs with backend:
- Local state updates happen immediately for responsive UI
- Backend syncs happen via NetworkService functions
- Use `viewPhotobook(id)` to fetch latest state from server
- Image URLs from backend are used directly in `<img src={url} />` tags

### Implementing S3 Storage

To wire up S3:
1. Install `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner` in `backend/`
2. Implement `backend/storage/S3StorageProvider.ts` (see TODOs in file)
3. Set env vars: `STORAGE_PROVIDER=s3`, `AWS_BUCKET`, `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`
4. Set `CORS_ORIGIN` to your frontend URL (defaults to `http://localhost:5173`)
4. Configure S3 bucket CORS to allow PUT from your frontend origin

## Roadmap

### Phase 1: Frontend UI ✓ (Mostly Complete)
- [x] Page reordering (drag & drop)
- [x] Sidebar with page previews
- [x] Layout selector
- [ ] Add/remove page functionality (partial)
- [ ] Page format selection (A4 portrait/landscape, square)

### Phase 2: Backend Persistence ✓ (Complete)
- [x] Wire up MongoDB models to API routes (replace DemoStorage)
- [x] Link photobooks to authenticated users
- [x] Simplify image model to use dropZoneIndex only (no coordinates)
- [x] Add auth middleware to all photobook endpoints
- [x] Update frontend NetworkService with auth headers
- [x] Image storage to filesystem (local dev) with S3-ready interface
- [x] Consolidate two servers into one (port 3000 + 3001)
- [x] Delete unused storage.ts file
- [ ] Print-ready PDF export with proper specs
- [ ] Wire up S3StorageProvider for production

### Phase 3: Authentication & Accounts (Partially Complete)
- [x] Refresh token mechanism (avoid session expiry during editing)
- [x] User dashboard with saved photobooks (list, open, delete, create)
- [ ] Fix authentication flow (edge cases)
- [ ] Order history

### Phase 4: Security & Hardening ✓ (Complete)
- [x] URL injection / SSRF prevention (isValidUrl on confirm-upload and pdf-service)
- [x] Path traversal hardening (basename + allowlist regex on local-upload)
- [x] Page and dropzone bounds validation (schema + API layer)

### Phase 5: Order & Checkout (Future)
- [ ] Pricing configuration
- [ ] Payment processing
- [ ] Order management

### Phase 6: Fulfillment (Future)
- [ ] Integration with printing partner
- [ ] Order tracking and shipping notifications

## Future Architecture

### Image Storage
- **AWS S3** for production image storage (scalable, CDN-friendly)
- Local file storage (`backend/uploads/`) used during development
- Interface (`IStorageProvider`) designed to swap providers via env var

### Content Moderation
- **AWS Rekognition** for image recognition to filter adult/inappropriate content
- Validation hook runs before images are saved to storage
