import { locationService, LocationCoordinates } from './locationService';

export interface LocationBasedPromotion {
  id: string;
  title: string;
  description: string;
  discountType: 'percentage' | 'fixed' | 'free_delivery';
  discountValue: number;
  minOrderAmount?: number;
  validUntil: Date;
  targetLocations: {
    type: 'radius' | 'region' | 'city';
    coordinates?: LocationCoordinates;
    radius?: number; // in kilometers
    regions?: string[];
    cities?: string[];
  };
  restaurantIds?: string[]; // If specific to certain restaurants
  maxUses?: number;
  currentUses: number;
  isActive: boolean;
}

class LocationBasedPromotionService {
  private promotions: LocationBasedPromotion[] = [
    {
      id: '1',
      title: '🎉 New Area Special!',
      description: 'Get 20% off your first order in this area',
      discountType: 'percentage',
      discountValue: 20,
      minOrderAmount: 30,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      targetLocations: {
        type: 'radius',
        coordinates: { latitude: 5.6037, longitude: -0.1870 }, // Accra center
        radius: 10,
      },
      maxUses: 100,
      currentUses: 0,
      isActive: true,
    },
    {
      id: '2',
      title: '🚚 Free Delivery Friday',
      description: 'Free delivery for orders over GH₵25 in Greater Accra',
      discountType: 'free_delivery',
      discountValue: 0,
      minOrderAmount: 25,
      validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      targetLocations: {
        type: 'region',
        regions: ['Greater Accra'],
      },
      isActive: true,
      currentUses: 0,
    },
    {
      id: '3',
      title: '🌟 University Special',
      description: 'GH₵5 off for students near universities',
      discountType: 'fixed',
      discountValue: 5,
      minOrderAmount: 20,
      validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
      targetLocations: {
        type: 'radius',
        coordinates: { latitude: 5.6508, longitude: -0.1870 }, // University of Ghana area
        radius: 3,
      },
      isActive: true,
      currentUses: 0,
    },
  ];

  // Get promotions available for a specific location
  async getPromotionsForLocation(userLocation: LocationCoordinates): Promise<LocationBasedPromotion[]> {
    const availablePromotions: LocationBasedPromotion[] = [];

    for (const promotion of this.promotions) {
      if (!promotion.isActive || new Date() > promotion.validUntil) {
        continue;
      }

      if (promotion.maxUses && promotion.currentUses >= promotion.maxUses) {
        continue;
      }

      if (await this.isLocationEligible(userLocation, promotion.targetLocations)) {
        availablePromotions.push(promotion);
      }
    }

    return availablePromotions.sort((a, b) => b.discountValue - a.discountValue);
  }

  // Check if a location is eligible for a promotion
  private async isLocationEligible(
    userLocation: LocationCoordinates,
    targetLocation: LocationBasedPromotion['targetLocations']
  ): Promise<boolean> {
    switch (targetLocation.type) {
      case 'radius':
        if (!targetLocation.coordinates || !targetLocation.radius) return false;
        const distance = locationService.calculateDistance(userLocation, targetLocation.coordinates);
        return distance <= targetLocation.radius;

      case 'region':
        if (!targetLocation.regions) return false;
        const userRegion = locationService.getGhanaRegion(userLocation);
        return targetLocation.regions.includes(userRegion);

      case 'city':
        if (!targetLocation.cities) return false;
        // For demo purposes, we'll use reverse geocoding to get city
        try {
          const address = await locationService.reverseGeocode(userLocation);
          const userCity = address.city || '';
          return targetLocation.cities.some(city => 
            userCity.toLowerCase().includes(city.toLowerCase())
          );
        } catch (error) {
          return false;
        }

      default:
        return false;
    }
  }

  // Apply a promotion to an order
  applyPromotion(
    promotion: LocationBasedPromotion,
    orderAmount: number,
    deliveryFee: number
  ): { discount: number; newTotal: number; freeDelivery: boolean } {
    let discount = 0;
    let freeDelivery = false;

    if (promotion.minOrderAmount && orderAmount < promotion.minOrderAmount) {
      return { discount: 0, newTotal: orderAmount + deliveryFee, freeDelivery: false };
    }

    switch (promotion.discountType) {
      case 'percentage':
        discount = (orderAmount * promotion.discountValue) / 100;
        break;

      case 'fixed':
        discount = promotion.discountValue;
        break;

      case 'free_delivery':
        freeDelivery = true;
        discount = deliveryFee;
        break;
    }

    // Ensure discount doesn't exceed order amount
    discount = Math.min(discount, orderAmount + (freeDelivery ? deliveryFee : 0));

    const newTotal = orderAmount + deliveryFee - discount;

    return {
      discount,
      newTotal: Math.max(0, newTotal),
      freeDelivery,
    };
  }

  // Mark a promotion as used
  async usePromotion(promotionId: string): Promise<boolean> {
    const promotion = this.promotions.find(p => p.id === promotionId);
    if (!promotion) return false;

    if (promotion.maxUses && promotion.currentUses >= promotion.maxUses) {
      return false;
    }

    promotion.currentUses++;
    return true;
  }

  // Get promotion by ID
  getPromotionById(promotionId: string): LocationBasedPromotion | null {
    return this.promotions.find(p => p.id === promotionId) || null;
  }

  // Calculate savings message
  getSavingsMessage(promotion: LocationBasedPromotion, orderAmount: number): string {
    if (promotion.minOrderAmount && orderAmount < promotion.minOrderAmount) {
      const needed = promotion.minOrderAmount - orderAmount;
      return `Add GH₵${needed.toFixed(2)} more to unlock this offer`;
    }

    switch (promotion.discountType) {
      case 'percentage':
        const percentageDiscount = (orderAmount * promotion.discountValue) / 100;
        return `Save GH₵${percentageDiscount.toFixed(2)} (${promotion.discountValue}% off)`;

      case 'fixed':
        return `Save GH₵${promotion.discountValue.toFixed(2)}`;

      case 'free_delivery':
        return 'Free delivery on this order!';

      default:
        return 'Special offer available';
    }
  }

  // Get nearby promotion hotspots
  async getNearbyPromotionHotspots(userLocation: LocationCoordinates, radiusKm: number = 5): Promise<{
    location: LocationCoordinates;
    promotions: LocationBasedPromotion[];
    distance: number;
  }[]> {
    const hotspots: { location: LocationCoordinates; promotions: LocationBasedPromotion[]; distance: number; }[] = [];

    for (const promotion of this.promotions) {
      if (!promotion.isActive || !promotion.targetLocations.coordinates) continue;

      const distance = locationService.calculateDistance(userLocation, promotion.targetLocations.coordinates);
      
      if (distance <= radiusKm) {
        const existingHotspot = hotspots.find(h => 
          locationService.calculateDistance(h.location, promotion.targetLocations.coordinates!) < 0.5
        );

        if (existingHotspot) {
          existingHotspot.promotions.push(promotion);
        } else {
          hotspots.push({
            location: promotion.targetLocations.coordinates,
            promotions: [promotion],
            distance,
          });
        }
      }
    }

    return hotspots.sort((a, b) => a.distance - b.distance);
  }
}

export const locationBasedPromotionService = new LocationBasedPromotionService();