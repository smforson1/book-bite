// Ghana-specific promotion and discount service for BookBite
// Integrates with mobile money networks, cultural holidays, and local preferences

import AsyncStorage from '@react-native-async-storage/async-storage';
import { ghanaSMSService } from './ghanaSMSService';
import { ghanaAnalyticsService } from './ghanaAnalyticsService';

// Interfaces
export interface GhanaPromotion {
  id: string;
  title: string;
  description: string;
  type: 'percentage' | 'fixed_amount' | 'free_delivery' | 'mobile_money_bonus';
  discountValue: number;
  minimumOrderAmount?: number;
  maximumDiscountAmount?: number;
  promoCode: string;
  applicablePaymentMethods: ('mobile_money' | 'paystack' | 'palmpay' | 'cash')[];
  applicableNetworks?: ('MTN' | 'Vodafone' | 'AirtelTigo')[];
  applicableCities: string[];
  applicableRegions: string[];
  startDate: Date;
  endDate: Date;
  timeRestrictions?: {
    startTime: string; // HH:MM format
    endTime: string; // HH:MM format
    daysOfWeek: number[]; // 0-6, Sunday to Saturday
  };
  maxUsagePerUser: number;
  maxTotalUsage: number;
  currentUsage: number;
  targetAudience: 'new_users' | 'returning_users' | 'all';
  minUserOrderCount?: number;
  maxUserOrderCount?: number;
  isActive: boolean;
  isFeatured: boolean;
  backgroundColor: string;
  textColor: string;
  culturalTheme?: 'independence_day' | 'farmers_day' | 'republic_day' | 'easter' | 'christmas';
  localLanguageTitle?: {
    [language: string]: string;
  };
}

export interface PromoUsage {
  id: string;
  userId: string;
  promoId: string;
  orderId: string;
  discountAmount: number;
  originalAmount: number;
  finalAmount: number;
  usedAt: Date;
  paymentMethod: string;
  city: string;
}

export interface GhanaHoliday {
  name: string;
  date: Date;
  type: 'national' | 'religious' | 'cultural';
  promoSuggestion: string;
}

class GhanaPromotionService {
  private promotions: GhanaPromotion[] = [];
  private usageHistory: PromoUsage[] = [];
  private isInitialized = false;

  // Ghana cultural holidays and celebrations for promotional campaigns
  private ghanaHolidays: GhanaHoliday[] = [
    {
      name: 'Independence Day',
      date: new Date(new Date().getFullYear(), 2, 6), // March 6
      type: 'national',
      promoSuggestion: 'Celebrate Ghana\'s independence with 63% off your order!'
    },
    {
      name: 'Republic Day',
      date: new Date(new Date().getFullYear(), 6, 1), // July 1
      type: 'national',
      promoSuggestion: 'Republic Day special: Free delivery on all orders!'
    },
    {
      name: 'Farmers Day',
      date: new Date(new Date().getFullYear(), 11, 2), // First Friday in December
      type: 'national',
      promoSuggestion: 'Honor our farmers with fresh local dishes at discounted prices!'
    }
  ];

  constructor() {
    this.initializeService();
  }

  private async initializeService(): Promise<void> {
    try {
      await this.loadStoredPromotions();
      await this.loadUsageHistory();
      this.createDefaultPromotions();
      this.isInitialized = true;
      console.log('Ghana Promotion Service initialized');
    } catch (error) {
      console.error('Failed to initialize promotion service:', error);
    }
  }

  // Create Ghana-specific default promotions
  private createDefaultPromotions(): void {
    const defaultPromotions: Omit<GhanaPromotion, 'id'>[] = [
      {
        title: 'Welcome to BookBite Ghana!',
        description: 'Get 20% off your first order. Use mobile money and save more!',
        type: 'percentage',
        discountValue: 20,
        minimumOrderAmount: 25,
        maximumDiscountAmount: 20,
        promoCode: 'WELCOME20',
        applicablePaymentMethods: ['mobile_money', 'paystack', 'palmpay'],
        applicableNetworks: ['MTN', 'Vodafone', 'AirtelTigo'],
        applicableCities: ['Accra', 'Kumasi', 'Takoradi', 'Cape Coast', 'Tamale'],
        applicableRegions: ['Greater Accra', 'Ashanti', 'Western', 'Central', 'Northern'],
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        maxUsagePerUser: 1,
        maxTotalUsage: 1000,
        currentUsage: 0,
        targetAudience: 'new_users',
        isActive: true,
        isFeatured: true,
        backgroundColor: '#FF6B35',
        textColor: '#FFFFFF',
        localLanguageTitle: {
          'twi': 'Akwaaba BookBite Ghana!',
          'ga': 'Welcome to BookBite Ghana!'
        }
      },
      {
        title: 'Mobile Money Monday',
        description: 'Pay with mobile money and get 15% off every Monday!',
        type: 'percentage',
        discountValue: 15,
        minimumOrderAmount: 30,
        promoCode: 'MOMO15',
        applicablePaymentMethods: ['mobile_money'],
        applicableNetworks: ['MTN', 'Vodafone', 'AirtelTigo'],
        applicableCities: ['Accra', 'Kumasi', 'Takoradi', 'Cape Coast'],
        applicableRegions: ['Greater Accra', 'Ashanti', 'Western', 'Central'],
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        timeRestrictions: {
          startTime: '00:00',
          endTime: '23:59',
          daysOfWeek: [1] // Monday
        },
        maxUsagePerUser: 4, // Once per month
        maxTotalUsage: 10000,
        currentUsage: 0,
        targetAudience: 'all',
        isActive: true,
        isFeatured: true,
        backgroundColor: '#FFD700',
        textColor: '#000000'
      }
    ];

    // Add default promotions if not already exists
    defaultPromotions.forEach(promoData => {
      const exists = this.promotions.find(p => p.promoCode === promoData.promoCode);
      if (!exists) {
        const promo: GhanaPromotion = {
          ...promoData,
          id: `promo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        };
        this.promotions.push(promo);
      }
    });
  }

  // Get applicable promotions for user and order
  async getApplicablePromotions({
    userId,
    orderAmount,
    paymentMethod,
    network,
    city,
    region,
    userOrderCount = 0
  }: {
    userId: string;
    orderAmount: number;
    paymentMethod: string;
    network?: string;
    city: string;
    region: string;
    userOrderCount?: number;
  }): Promise<GhanaPromotion[]> {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const applicable = this.promotions.filter(promo => {
      // Basic checks
      if (!promo.isActive) return false;
      if (now < promo.startDate || now > promo.endDate) return false;
      if (promo.currentUsage >= promo.maxTotalUsage) return false;
      if (promo.minimumOrderAmount && orderAmount < promo.minimumOrderAmount) return false;
      
      // Payment method check
      if (!promo.applicablePaymentMethods.includes(paymentMethod as any)) return false;
      
      // Network check for mobile money
      if (paymentMethod === 'mobile_money' && promo.applicableNetworks && network) {
        if (!promo.applicableNetworks.includes(network as any)) return false;
      }
      
      // Location checks
      if (!promo.applicableCities.includes(city) && !promo.applicableRegions.includes(region)) {
        return false;
      }
      
      // Time restrictions
      if (promo.timeRestrictions) {
        const { startTime, endTime, daysOfWeek } = promo.timeRestrictions;
        if (!daysOfWeek.includes(dayOfWeek)) return false;
        if (currentTime < startTime || currentTime > endTime) return false;
      }
      
      // User targeting
      if (promo.targetAudience === 'new_users' && userOrderCount > 0) return false;
      if (promo.targetAudience === 'returning_users' && userOrderCount === 0) return false;
      if (promo.minUserOrderCount && userOrderCount < promo.minUserOrderCount) return false;
      if (promo.maxUserOrderCount && userOrderCount > promo.maxUserOrderCount) return false;
      
      // User usage limit
      const userUsage = this.getUserPromoUsage(userId, promo.id);
      if (userUsage >= promo.maxUsagePerUser) return false;
      
      return true;
    });
    
    // Sort by discount value (highest first) and featured status
    return applicable.sort((a, b) => {
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      return b.discountValue - a.discountValue;
    });
  }

  // Apply promotion to order
  async applyPromotion({
    promoId,
    userId,
    orderId,
    originalAmount,
    paymentMethod,
    city
  }: {
    promoId: string;
    userId: string;
    orderId: string;
    originalAmount: number;
    paymentMethod: string;
    city: string;
  }): Promise<{
    success: boolean;
    discountAmount: number;
    finalAmount: number;
    error?: string;
  }> {
    try {
      const promo = this.promotions.find(p => p.id === promoId);
      if (!promo) {
        return { success: false, discountAmount: 0, finalAmount: originalAmount, error: 'Promotion not found' };
      }
      
      // Calculate discount
      let discountAmount = 0;
      
      switch (promo.type) {
        case 'percentage':
          discountAmount = (originalAmount * promo.discountValue) / 100;
          if (promo.maximumDiscountAmount) {
            discountAmount = Math.min(discountAmount, promo.maximumDiscountAmount);
          }
          break;
          
        case 'fixed_amount':
          discountAmount = promo.discountValue;
          break;
          
        case 'free_delivery':
          discountAmount = 10; // Assume GHS 10 delivery fee
          break;
          
        case 'mobile_money_bonus':
          if (paymentMethod === 'mobile_money') {
            discountAmount = promo.discountValue;
          }
          break;
      }
      
      // Ensure discount doesn't exceed order amount
      discountAmount = Math.min(discountAmount, originalAmount - 1); // Leave at least GHS 1
      const finalAmount = originalAmount - discountAmount;
      
      // Record usage
      const usage: PromoUsage = {
        id: `usage_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        promoId,
        orderId,
        discountAmount,
        originalAmount,
        finalAmount,
        usedAt: new Date(),
        paymentMethod,
        city
      };
      
      this.usageHistory.push(usage);
      
      // Update promotion usage count
      promo.currentUsage++;
      
      // Save changes
      await this.savePromotions();
      await this.saveUsageHistory();
      
      return {
        success: true,
        discountAmount,
        finalAmount
      };
    } catch (error) {
      console.error('Error applying promotion:', error);
      return {
        success: false,
        discountAmount: 0,
        finalAmount: originalAmount,
        error: 'Failed to apply promotion'
      };
    }
  }

  // Validate promo code
  async validatePromoCode(code: string, context: {
    userId: string;
    orderAmount: number;
    paymentMethod: string;
    network?: string;
    city: string;
    region: string;
    userOrderCount?: number;
  }): Promise<{
    valid: boolean;
    promotion?: GhanaPromotion;
    error?: string;
  }> {
    const promo = this.promotions.find(p => p.promoCode.toLowerCase() === code.toLowerCase());
    
    if (!promo) {
      return { valid: false, error: 'Invalid promo code' };
    }
    
    const applicable = await this.getApplicablePromotions(context);
    const isApplicable = applicable.find(p => p.id === promo.id);
    
    if (!isApplicable) {
      return { valid: false, error: 'Promo code is not applicable to this order' };
    }
    
    return { valid: true, promotion: promo };
  }

  // Get user's promotion usage count for a specific promotion
  private getUserPromoUsage(userId: string, promoId: string): number {
    return this.usageHistory.filter(usage => 
      usage.userId === userId && usage.promoId === promoId
    ).length;
  }

  // Get all active promotions
  getActivePromotions(): GhanaPromotion[] {
    const now = new Date();
    return this.promotions.filter(promo => 
      promo.isActive && 
      now >= promo.startDate && 
      now <= promo.endDate &&
      promo.currentUsage < promo.maxTotalUsage
    );
  }

  // Get featured promotions
  getFeaturedPromotions(): GhanaPromotion[] {
    return this.getActivePromotions().filter(promo => promo.isFeatured);
  }

  // Storage methods
  private async loadStoredPromotions(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('ghana_promotions');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.promotions = parsed.map((promo: any) => ({
          ...promo,
          startDate: new Date(promo.startDate),
          endDate: new Date(promo.endDate)
        }));
      }
    } catch (error) {
      console.error('Error loading promotions:', error);
      this.promotions = [];
    }
  }

  private async savePromotions(): Promise<void> {
    try {
      await AsyncStorage.setItem('ghana_promotions', JSON.stringify(this.promotions));
    } catch (error) {
      console.error('Error saving promotions:', error);
    }
  }

  private async loadUsageHistory(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('promo_usage_history');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.usageHistory = parsed.map((usage: any) => ({
          ...usage,
          usedAt: new Date(usage.usedAt)
        }));
      }
    } catch (error) {
      console.error('Error loading usage history:', error);
      this.usageHistory = [];
    }
  }

  private async saveUsageHistory(): Promise<void> {
    try {
      // Keep only last 10,000 usage records
      if (this.usageHistory.length > 10000) {
        this.usageHistory = this.usageHistory.slice(-10000);
      }
      await AsyncStorage.setItem('promo_usage_history', JSON.stringify(this.usageHistory));
    } catch (error) {
      console.error('Error saving usage history:', error);
    }
  }
}

// Export singleton instance
export const ghanaPromotionService = new GhanaPromotionService();
export default ghanaPromotionService;