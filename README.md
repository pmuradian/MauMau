# MauMau - Photo Book Creator

MauMau is a web application for creating, customizing, and printing photo books. It allows users to upload images, arrange them in various layouts, and prepare them for printing.

## Project Structure

The project is divided into two main parts:

### Frontend
- Built with React + TypeScript + Vite
- Handles UI rendering, image uploads, and layout management
- Located in the `/frontend` directory

### Backend
- TypeScript-based server
- Manages photo book storage and image processing
- Located in the `/backend` directory

## Key Features

- **Image Uploading**: Drag and drop interface for adding images
- **Multiple Layout Options**: Various arrangements including horizontal and vertical layouts
- **Image Metadata**: Tracks image dimensions and positioning
- **Photo Book Management**: Create, view and modify photo books
- **Print Preparation**: Format pages for A4 printing

## Components

- **Dropzone**: Handles image uploads with preview functionality
- **Layouts**: Various layout templates (HorizontalTripplet, VerticalTripplet, etc.)
- **Pages**: Page templates like A4Portrait for standard printing formats
- **NetworkService**: API communication with the backend

## Getting Started

### Prerequisites

- Node.js (v14 or higher recommended)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   # Install backend dependencies
   cd backend
   npm install
   
   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

### Running the Application

#### Backend
```bash
cd backend
node --experimental-transform-types main.ts
```

#### Frontend
```bash
cd frontend
npm run dev
```

## Development

- Frontend runs on Vite's development server
- Backend provides RESTful API endpoints
- Images are stored and processed on the backend

## API Endpoints

- `POST /create` - Create a new photo book
- `GET /photobook` - Retrieve photo book details
- `POST /upload` - Upload an image with metadata
- `POST /addPage` - Add a new page to a photo book

## License

This project is licensed under the terms of the MIT license.