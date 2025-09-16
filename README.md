# BookBite - Hotel & Restaurant Booking App

BookBite is a mobile application that allows users to discover, book hotels, and order food from restaurants. The app connects users with registered hotel and restaurant managers.

## Features

- User registration and authentication
- Hotel browsing and booking
- Restaurant browsing and food ordering
- Manager dashboard for hotels and restaurants with real statistics
- Real-time booking and order management
- Dark mode support for all screens
- Image upload functionality for managers
- Ghana-specific features (currency, locations, payment methods)

## Setup Instructions

1. Clone the repository
2. Install dependencies: `npm install`
3. Update the backend URL in `src/services/apiService.ts`:
   - Change `'http://UPDATE-THIS-TO-YOUR-ACTUAL-BACKEND-URL/api/v1'` to your actual backend URL
4. Start the development server: `npm start`

## Backend Configuration

This app is designed to work with a separate backend service. Make sure to:

1. Deploy your backend service
2. Update the production API URL in `src/services/apiService.ts`
3. Ensure your backend is accessible from the mobile app

## Development vs Production

- **Development Mode**: Uses mock data when backend is not available
- **Production Mode**: Only uses real data from your backend

## Manager Dashboard Features

- Real-time statistics for hotel managers:
  - Today's check-ins
  - Today's check-outs
  - Current occupancy rate
- Real-time statistics for restaurant managers:
  - Today's orders
  - Today's revenue
  - Active menu items count
- Image upload for hotels, rooms, restaurants, and menu items
- Dark mode toggle for better visibility

## Dark Mode

The app includes a dark mode feature that can be toggled from the manager dashboards. The selected theme is persisted between sessions.

## Ghana-Specific Features

- Ghana Cedis (GHS) currency support
- Ghanaian cities and regions
- Local payment methods (Paystack, PalmPay)
- Ghanaian phone number validation

## Testing

For testing purposes, the app includes mock data that can be used during development.

## Documentation

- [Dashboard Updates](DASHBOARD_UPDATES.md) - Details about real data implementation in manager dashboards
- [Dark Mode Feature](DARK_MODE_FEATURE.md) - Information about the dark mode implementation
- [Image Upload Features](IMAGE_UPLOAD_FEATURES.md) - Documentation for image upload functionality