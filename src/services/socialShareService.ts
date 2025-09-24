import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

export interface ShareContent {
  title?: string;
  message: string;
  url?: string;
  imageUri?: string;
}

export interface ShareOptions {
  mimeType?: string;
  dialogTitle?: string;
  excludedActivityTypes?: string[];
}

class SocialShareService {
  /**
   * Share text content
   */
  async shareText(content: ShareContent, options?: ShareOptions): Promise<boolean> {
    try {
      if (!(await Sharing.isAvailableAsync())) {
        throw new Error('Sharing is not available on this device');
      }

      const shareOptions: any = {
        ...options,
        mimeType: 'text/plain',
      };

      // On Android, we need to pass the URL as a separate parameter
      if (Platform.OS === 'android' && content.url) {
        shareOptions.url = content.url;
      }

      await Sharing.shareAsync('text/plain', shareOptions);
      return true;
    } catch (error) {
      console.error('Error sharing text:', error);
      return false;
    }
  }

  /**
   * Share an image
   */
  async shareImage(imageUri: string, options?: ShareOptions): Promise<boolean> {
    try {
      if (!(await Sharing.isAvailableAsync())) {
        throw new Error('Sharing is not available on this device');
      }

      // Check if file exists
      const fileInfo = await FileSystem.getInfoAsync(imageUri);
      if (!fileInfo.exists) {
        throw new Error('Image file does not exist');
      }

      const shareOptions: any = {
        ...options,
        mimeType: 'image/jpeg',
      };

      await Sharing.shareAsync(imageUri, shareOptions);
      return true;
    } catch (error) {
      console.error('Error sharing image:', error);
      return false;
    }
  }

  /**
   * Share both text and image
   */
  async shareTextAndImage(content: ShareContent, options?: ShareOptions): Promise<boolean> {
    try {
      if (!(await Sharing.isAvailableAsync())) {
        throw new Error('Sharing is not available on this device');
      }

      // Create a temporary file with both text and image
      let shareUri = content.imageUri;

      if (content.message && content.imageUri) {
        // For now, we'll share the image with the message as title
        // More sophisticated implementations might create a combined image
        const shareOptions: any = {
          ...options,
          mimeType: 'image/jpeg',
        };

        await Sharing.shareAsync(content.imageUri, shareOptions);
        return true;
      } else if (content.message) {
        return await this.shareText(content, options);
      } else if (content.imageUri) {
        return await this.shareImage(content.imageUri, options);
      }

      return false;
    } catch (error) {
      console.error('Error sharing text and image:', error);
      return false;
    }
  }

  /**
   * Generate shareable content for a booking
   */
  generateBookingShareContent(booking: any): ShareContent {
    return {
      title: 'Check out my booking!',
      message: `I just booked a stay at ${booking.hotelName} from ${booking.checkIn} to ${booking.checkOut}. Book your stay now!`,
      url: `https://bookbite.example.com/hotels/${booking.hotelId}`,
    };
  }

  /**
   * Generate shareable content for an order
   */
  generateOrderShareContent(order: any): ShareContent {
    return {
      title: 'Check out my order!',
      message: `I just ordered delicious food from ${order.restaurantName}. Try it now!`,
      url: `https://bookbite.example.com/restaurants/${order.restaurantId}`,
    };
  }

  /**
   * Generate shareable content for a restaurant
   */
  generateRestaurantShareContent(restaurant: any): ShareContent {
    return {
      title: 'Check out this restaurant!',
      message: `I recommend ${restaurant.name} for delicious food. Try it now!`,
      url: `https://bookbite.example.com/restaurants/${restaurant.id}`,
    };
  }

  /**
   * Generate shareable content for a hotel
   */
  generateHotelShareContent(hotel: any): ShareContent {
    return {
      title: 'Check out this hotel!',
      message: `I recommend ${hotel.name} for a great stay. Book now!`,
      url: `https://bookbite.example.com/hotels/${hotel.id}`,
    };
  }
}

export default new SocialShareService();