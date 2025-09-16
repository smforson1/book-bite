# Dashboard Updates Documentation

## Overview
This document explains the updates made to the manager dashboards to show real data instead of mock figures. The changes ensure that hotel and restaurant managers see accurate statistics based on their actual business data.

## Changes Made

### 1. API Service Updates
Added new methods to `src/services/apiService.ts` to fetch owner-specific data:
- `getMyHotels()`: Fetch hotels owned by the current user
- `getMyRestaurants()`: Fetch restaurants owned by the current user
- `getMyBookings()`: Fetch bookings for hotels owned by the current user
- `getMyOrders()`: Fetch orders for restaurants owned by the current user
- `getMyRooms()`: Fetch rooms for hotels owned by the current user
- `getMyMenuItems()`: Fetch menu items for restaurants owned by the current user

### 2. Context Updates

#### HotelContext
Updated `src/contexts/HotelContext.tsx` to include:
- `getMyHotels()`: Method to fetch owner's hotels
- `getMyBookings()`: Method to fetch owner's bookings
- Integration with new API methods

#### RestaurantContext
Updated `src/contexts/RestaurantContext.tsx` to include:
- `getMyRestaurants()`: Method to fetch owner's restaurants
- `getMyOrders()`: Method to fetch owner's orders
- `getMyMenuItems()`: Method to fetch owner's menu items
- Integration with new API methods

### 3. Dashboard Screen Updates

#### HotelDashboardScreen
Updated `src/screens/hotel/HotelDashboardScreen.tsx` to:
- Fetch real data using `getMyHotels()` and `getMyBookings()`
- Calculate real-time statistics:
  - Today's check-ins
  - Today's check-outs
  - Current occupancy rate
- Display accurate data instead of mock figures
- Added theme toggle support

#### RestaurantDashboardScreen
Updated `src/screens/restaurant/RestaurantDashboardScreen.tsx` to:
- Fetch real data using `getMyRestaurants()`, `getMyOrders()`, and `getMyMenuItems()`
- Calculate real-time statistics:
  - Today's orders
  - Today's revenue
  - Active menu items count
- Display accurate data instead of mock figures
- Added theme toggle support

## Data Calculation Logic

### Hotel Dashboard Statistics

1. **Check-ins**: Count of bookings with check-in date matching today's date and status 'confirmed'
2. **Check-outs**: Count of bookings with check-out date matching today's date and status 'confirmed'
3. **Occupancy Rate**: 
   - Total rooms across all owned hotels
   - Count of rooms with active bookings today
   - Calculation: (Occupied Rooms / Total Rooms) * 100

### Restaurant Dashboard Statistics

1. **Orders**: Count of orders created today with status not 'cancelled'
2. **Revenue**: Sum of total prices of orders created today
3. **Menu Items**: Total count of active menu items

## Implementation Details

### Data Fetching
- Both dashboards fetch data when the component mounts
- Data is refreshed when the screen becomes active
- Loading states are shown during data fetching

### Real-time Updates
- Statistics are recalculated whenever the underlying data changes
- Uses useEffect hooks to monitor data changes

### Error Handling
- Graceful error handling with fallback to empty states
- Console logging for debugging purposes

## Performance Considerations

1. **Batched API Calls**: Multiple API calls are made in parallel using Promise.all()
2. **Memoization**: Statistics calculation is optimized to avoid unnecessary recalculations
3. **Loading States**: User feedback during data fetching

## Testing

### Manual Testing
1. Create test hotel/restaurant accounts
2. Create test bookings/orders
3. Verify dashboard statistics match expected values
4. Test with no data (empty states)
5. Test theme switching functionality

### Edge Cases
1. Hotels/restaurants with no rooms/menu items
2. No bookings/orders for the day
3. Mixed status bookings/orders (confirmed, cancelled, etc.)

## Future Improvements

1. **Caching**: Implement local caching for improved offline experience
2. **Real-time Updates**: Integrate WebSocket for live dashboard updates
3. **Advanced Analytics**: Add more detailed statistics and charts
4. **Export Functionality**: Allow managers to export dashboard data
5. **Custom Date Ranges**: Enable viewing statistics for different time periods

## API Endpoints Used

### Hotel Dashboard
- `GET /api/v1/hotels/owner/my-hotels`
- `GET /api/v1/bookings`

### Restaurant Dashboard
- `GET /api/v1/restaurants/owner/my-restaurants`
- `GET /api/v1/orders`
- `GET /api/v1/menu-items/owner/my-items`

## Dependencies

1. Updated API service with new endpoints
2. Context providers with enhanced methods
3. Theme context for dark mode support
4. Standard React Native components

## Migration Notes

For existing installations:
1. Ensure backend supports the new endpoints
2. Update API service with new methods
3. Update context providers with new methods
4. Replace mock data with real data fetching in dashboard screens