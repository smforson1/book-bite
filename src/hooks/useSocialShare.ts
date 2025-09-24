import { useCallback } from 'react';
import socialShareService, { ShareContent, ShareOptions } from '../services/socialShareService';

export const useSocialShare = () => {
  const shareText = useCallback(async (content: ShareContent, options?: ShareOptions) => {
    return await socialShareService.shareText(content, options);
  }, []);

  const shareImage = useCallback(async (imageUri: string, options?: ShareOptions) => {
    return await socialShareService.shareImage(imageUri, options);
  }, []);

  const shareTextAndImage = useCallback(async (content: ShareContent, options?: ShareOptions) => {
    return await socialShareService.shareTextAndImage(content, options);
  }, []);

  const shareBooking = useCallback(async (booking: any) => {
    const content = socialShareService.generateBookingShareContent(booking);
    return await shareTextAndImage(content);
  }, [shareTextAndImage]);

  const shareOrder = useCallback(async (order: any) => {
    const content = socialShareService.generateOrderShareContent(order);
    return await shareTextAndImage(content);
  }, [shareTextAndImage]);

  const shareRestaurant = useCallback(async (restaurant: any) => {
    const content = socialShareService.generateRestaurantShareContent(restaurant);
    return await shareTextAndImage(content);
  }, [shareTextAndImage]);

  const shareHotel = useCallback(async (hotel: any) => {
    const content = socialShareService.generateHotelShareContent(hotel);
    return await shareTextAndImage(content);
  }, [shareTextAndImage]);

  return {
    shareText,
    shareImage,
    shareTextAndImage,
    shareBooking,
    shareOrder,
    shareRestaurant,
    shareHotel,
  };
};