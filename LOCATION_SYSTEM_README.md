# Enhanced Location System for BookBite

This document describes the enhanced location system implemented for the BookBite food delivery app, providing precise GPS-based delivery with comprehensive address management.

## Features

### 🎯 Precise Location Services
- **GPS Coordinates**: Uses exact latitude/longitude for accurate delivery
- **Current Location**: One-tap access to user's current location
- **Location Accuracy**: Displays accuracy levels and validation
- **Ghana-Specific**: Optimized for Ghana with region detection

### 🗺️ Interactive Maps
- **Map Selection**: Tap-to-select location on interactive map
- **Visual Confirmation**: See exact delivery location with markers
- **Address Search**: Search for locations by name or address

### 📍 Comprehensive Address Management
- **Detailed Forms**: Street address, apartment, floor, building name
- **Delivery Instructions**: Special instructions for delivery partners
- **Contact Information**: Phone number for delivery coordination
- **Saved Locations**: Save frequently used addresses (Home, Work, etc.)

### 🚚 Smart Delivery Features
- **Distance Calculation**: Accurate distance-based delivery fees
- **Time Estimation**: Real-time delivery time calculation
- **Location Validation**: Ensures addresses are within service area

## Components

### LocationService (`src/services/locationService.ts`)
Core service handling all location-related functionality:

```typescript
import { locationService } from '../services/locationService';

// Get current location
const location = await locationService.getCurrentLocation();

// Calculate distance between two points
const distance = locationService.calculateDistance(coord1, coord2);

// Geocode address to coordinates
const coordinates = await locationService.geocodeAddress("Accra, Ghana");
```

### LocationPicker (`src/components/LocationPicker.tsx`)
Interactive component for location selection:

```tsx
import LocationPicker from '../components/LocationPicker';

<LocationPicker
  onLocationSelect={(location) => setSelectedLocation(location)}
  placeholder="Select delivery location"
  showSavedLocations={true}
  allowCurrentLocation={true}
  allowMapSelection={true}
/>
```

### AddressInput (`src/components/AddressInput.tsx`)
Comprehensive address form with GPS integration:

```tsx
import AddressInput from '../components/AddressInput';

<AddressInput
  onAddressSelect={(address) => setDeliveryAddress(address)}
  placeholder="Where should we deliver your order?"
  required={true}
/>
```

### EnhancedOrderScreen (`src/screens/user/EnhancedOrderScreen.tsx`)
Complete order flow with location integration:

```tsx
// Navigate to enhanced order screen
navigation.navigate('EnhancedOrder', {
  restaurantId: restaurant.id,
  items: orderItems,
  totalAmount: cartTotal,
});
```

## Integration Guide

### 1. Basic Location Selection
For simple location picking:

```tsx
import LocationPicker from '../components/LocationPicker';

const [selectedLocation, setSelectedLocation] = useState(null);

<LocationPicker
  onLocationSelect={setSelectedLocation}
  placeholder="Choose location"
/>
```

### 2. Complete Address Form
For detailed delivery addresses:

```tsx
import AddressInput from '../components/AddressInput';

const [deliveryAddress, setDeliveryAddress] = useState(null);

<AddressInput
  onAddressSelect={setDeliveryAddress}
  required={true}
/>
```

### 3. Distance-Based Pricing
Calculate delivery fees based on distance:

```tsx
import { locationService } from '../services/locationService';

const calculateDeliveryFee = (restaurantCoords, deliveryCoords) => {
  const distance = locationService.calculateDistance(restaurantCoords, deliveryCoords);
  const baseFee = 5; // GHS 5 base fee
  const distanceFee = Math.max(0, (distance - 2) * 2); // GHS 2 per km after 2km
  return baseFee + distanceFee;
};
```

## Data Structures

### UserLocation
```typescript
interface UserLocation {
  coordinates: {
    latitude: number;
    longitude: number;
  };
  address: {
    formattedAddress?: string;
    street?: string;
    city?: string;
    region?: string;
    country?: string;
  };
  accuracy?: number;
  timestamp: number;
}
```

### DeliveryAddress
```typescript
interface DeliveryAddress {
  coordinates: {
    latitude: number;
    longitude: number;
  };
  formattedAddress: string;
  streetAddress?: string;
  apartmentNumber?: string;
  floor?: string;
  buildingName?: string;
  landmark?: string;
  deliveryInstructions?: string;
  contactPhone?: string;
  label?: string;
}
```

## Backend Integration

The system integrates with the backend Order model:

```typescript
// Order creation with location data
const orderData = {
  userId: user.id,
  restaurantId,
  items: orderItems,
  deliveryAddress: address.formattedAddress,
  deliveryCoordinates: address.coordinates,
  deliveryDetails: {
    streetAddress: address.streetAddress,
    apartmentNumber: address.apartmentNumber,
    floor: address.floor,
    buildingName: address.buildingName,
    landmark: address.landmark,
    contactPhone: address.contactPhone,
    label: address.label || 'Other',
  },
  deliveryInstructions: address.deliveryInstructions,
  totalPrice: totalAmount + deliveryFee,
  estimatedDeliveryTime: calculatedTime,
};
```

## Permissions

The system requires location permissions:

```json
// app.json
{
  "expo": {
    "plugins": [
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermission": "Allow BookBite to use your location for accurate food delivery."
        }
      ]
    ]
  }
}
```

## Dependencies

Required packages (already included):

```json
{
  "expo-location": "^19.0.7",
  "react-native-maps": "^1.26.1"
}
```

## Usage Examples

### Restaurant Detail Screen Integration
The RestaurantDetailScreen has been updated to use the enhanced order flow:

```tsx
// Old: Direct order placement
const handleOrder = async () => {
  // ... create order directly
};

// New: Navigate to enhanced order screen
const handleOrder = () => {
  navigation.navigate('EnhancedOrder', {
    restaurantId: restaurant.id,
    items: orderItems,
    totalAmount: cartTotal,
  });
};
```

### Location-Aware Features
- **Nearby Restaurants**: Filter restaurants by distance
- **Delivery Zones**: Validate if delivery is available to location
- **Real-time Tracking**: Use GPS coordinates for order tracking
- **Smart Suggestions**: Suggest restaurants based on location

## Best Practices

1. **Always Request Permissions**: Check location permissions before using location services
2. **Handle Errors Gracefully**: Provide fallbacks when location services fail
3. **Cache Locations**: Store frequently used locations for better UX
4. **Validate Coordinates**: Ensure coordinates are within service area
5. **Provide Context**: Explain why location access is needed

## Troubleshooting

### Common Issues

1. **Location Permission Denied**
   - Guide users to app settings to enable location
   - Provide manual address entry as fallback

2. **GPS Accuracy Issues**
   - Display accuracy information to users
   - Allow manual adjustment of location pin

3. **Network Issues**
   - Cache last known location
   - Provide offline address entry

4. **Service Area Validation**
   - Check if coordinates are within Ghana
   - Validate against delivery zones

## Future Enhancements

- **Address Autocomplete**: Integration with Google Places API
- **Delivery Zones**: Visual representation of service areas
- **Location History**: Track and suggest previous delivery locations
- **Real-time Tracking**: Live order tracking with GPS
- **Geofencing**: Automatic location detection for frequent locations