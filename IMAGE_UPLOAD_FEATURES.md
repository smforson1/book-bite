# Image Upload Features for Managers

This document outlines the image upload functionality implemented for hotel and restaurant managers to upload images of their services.

## Features Implemented

### 1. Custom Hook: `useImageUpload`
- **Location**: `src/hooks/useImageUpload.ts`
- **Purpose**: Provides a reusable hook for handling image uploads
- **Features**:
  - Take photos directly from camera
  - Select images from device gallery
  - Upload single or multiple images
  - Progress tracking
  - Error handling
  - Ghana-optimized settings (compression, retry logic)

### 2. Reusable Component: `ImageUpload`
- **Location**: `src/components/ImageUpload.tsx`
- **Purpose**: UI component for image upload functionality
- **Features**:
  - Camera and gallery buttons
  - Image preview with remove functionality
  - Progress indicators
  - Error display
  - Configurable options (max images, multiple selection)
  - Clear all images option
  - Helpful hints for users

### 3. Updated Management Screens

#### Hotel Room Management
- **Location**: `src/screens/hotel/HotelRoomManagementScreen.tsx`
- **Features**:
  - Image upload for each room type
  - Preview of uploaded room images
  - Support for multiple images per room (up to 5)
  - Integration with room creation/editing flow

#### Restaurant Menu Management
- **Location**: `src/screens/restaurant/RestaurantMenuManagementScreen.tsx`
- **Features**:
  - Image upload for each menu item
  - Preview of uploaded menu item images
  - Support for multiple images per item (up to 3)
  - Integration with menu item creation/editing flow

#### Hotel Profile
- **Location**: `src/screens/hotel/HotelProfileScreen.tsx`
- **Features**:
  - Image upload for hotel branding and exterior
  - Preview of uploaded hotel images
  - Support for multiple images (up to 10)
  - Horizontal scrolling image gallery

#### Restaurant Profile
- **Location**: `src/screens/restaurant/RestaurantProfileScreen.tsx`
- **Features**:
  - Image upload for restaurant branding and interior
  - Preview of uploaded restaurant images
  - Support for multiple images (up to 10)
  - Horizontal scrolling image gallery

## Technical Implementation Details

### Image Processing
- Automatic image compression for Ghana's internet conditions
- Resize images to appropriate dimensions
- JPEG format optimization
- File size limits (5MB maximum)

### Upload Process
- Direct upload to backend via API service
- Progress tracking
- Retry mechanism with exponential backoff
- Error handling and user feedback

### Ghana-Specific Optimizations
- Reduced image quality settings for slower connections
- Limited concurrent uploads (2 max)
- Extended retry delays for unstable connections
- Connection quality detection and adaptive settings

## Usage Instructions

### For Hotel Managers
1. Navigate to "Room Management" in the hotel dashboard
2. Add or edit a room
3. Use the "Room Images" section to upload photos
4. Take new photos or select from gallery
5. Review uploaded images before saving

### For Restaurant Managers
1. Navigate to "Menu Management" in the restaurant dashboard
2. Add or edit a menu item
3. Use the "Item Images" section to upload photos
4. Take new photos or select from gallery
5. Review uploaded images before saving

### For Both Types of Managers
1. Navigate to your profile screen
2. Use the "Upload Hotel Photos" or "Upload Restaurant Photos" section
3. Upload branding, exterior/interior, and promotional images
4. Manage your image gallery with preview and removal options

## Backend Integration
The image upload service integrates with the existing API service:
- Uses the same authentication tokens
- Uploads directly to configured storage
- Returns URLs for use in the application
- Handles errors gracefully with user feedback

## Future Enhancements
- Image cropping and editing tools
- Drag and drop support for web version
- Video upload support
- Image moderation and filtering
- CDN integration for optimized delivery