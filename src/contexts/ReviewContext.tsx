import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Review, ReviewSummary } from '../types';
import { useAuth } from './AuthContext';
import { useHotel } from './HotelContext';
import { useRestaurant } from './RestaurantContext';

interface ReviewContextType {
  reviews: Review[];
  loading: boolean;
  // Review management
  getReviewsByTarget: (targetId: string, targetType: 'hotel' | 'restaurant') => Review[];
  getReviewById: (reviewId: string) => Review | null;
  getUserReview: (userId: string, targetId: string, targetType: 'hotel' | 'restaurant') => Review | null;
  getReviewSummary: (targetId: string, targetType: 'hotel' | 'restaurant') => ReviewSummary;
  // Review actions
  createReview: (reviewData: Omit<Review, 'id' | 'createdAt' | 'helpful'>) => Promise<Review>;
  updateReview: (reviewId: string, updates: Partial<Review>) => Promise<boolean>;
  deleteReview: (reviewId: string) => Promise<boolean>;
  markReviewHelpful: (reviewId: string) => Promise<boolean>;
  // Verification
  canUserReview: (userId: string, targetId: string, targetType: 'hotel' | 'restaurant') => boolean;
}

const ReviewContext = createContext<ReviewContextType | undefined>(undefined);

export const useReview = () => {
  const context = useContext(ReviewContext);
  if (!context) {
    throw new Error('useReview must be used within a ReviewProvider');
  }
  return context;
};

interface ReviewProviderProps {
  children: ReactNode;
}

export const ReviewProvider: React.FC<ReviewProviderProps> = ({ children }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { bookings } = useHotel();
  const { orders } = useRestaurant();

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const storedReviews = await AsyncStorage.getItem('reviews');
      if (storedReviews) {
        const parsedReviews = JSON.parse(storedReviews).map((review: any) => ({
          ...review,
          createdAt: new Date(review.createdAt),
          updatedAt: review.updatedAt ? new Date(review.updatedAt) : undefined,
        }));
        setReviews(parsedReviews);
      } else {
        // Initialize with some mock reviews
        const mockReviews = generateMockReviews();
        setReviews(mockReviews);
        await AsyncStorage.setItem('reviews', JSON.stringify(mockReviews));
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveReviews = async (reviewsToSave: Review[]) => {
    try {
      await AsyncStorage.setItem('reviews', JSON.stringify(reviewsToSave));
    } catch (error) {
      console.error('Error saving reviews:', error);
    }
  };

  const generateMockReviews = (): Review[] => {
    const mockReviews: Review[] = [
      {
        id: '1',
        userId: 'user1',
        targetId: 'hotel1',
        targetType: 'hotel',
        rating: 5,
        title: 'Amazing stay!',
        comment: 'The hotel exceeded all my expectations. The staff was incredibly friendly and the rooms were spotless. The location is perfect for exploring the city.',
        isVerified: true,
        helpful: 15,
        createdAt: new Date('2024-01-15'),
      },
      {
        id: '2',
        userId: 'user2',
        targetId: 'hotel1',
        targetType: 'hotel',
        rating: 4,
        title: 'Great value for money',
        comment: 'Good hotel with excellent amenities. The breakfast was delicious and the wifi was fast. Only minor issue was the air conditioning was a bit noisy.',
        isVerified: true,
        helpful: 8,
        createdAt: new Date('2024-01-10'),
      },
      {
        id: '3',
        userId: 'user3',
        targetId: 'restaurant1',
        targetType: 'restaurant',
        rating: 5,
        title: 'Delicious food!',
        comment: 'The pasta was absolutely divine and the service was quick. Will definitely order again!',
        isVerified: true,
        helpful: 12,
        createdAt: new Date('2024-01-20'),
      },
      {
        id: '4',
        userId: 'user4',
        targetId: 'restaurant1',
        targetType: 'restaurant',
        rating: 3,
        title: 'Average experience',
        comment: 'Food was okay but took longer than expected to arrive. The portions were good though.',
        isVerified: true,
        helpful: 3,
        createdAt: new Date('2024-01-18'),
      },
    ];
    return mockReviews;
  };

  const getReviewsByTarget = (targetId: string, targetType: 'hotel' | 'restaurant'): Review[] => {
    return reviews
      .filter(review => review.targetId === targetId && review.targetType === targetType)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const getReviewById = (reviewId: string): Review | null => {
    return reviews.find(review => review.id === reviewId) || null;
  };

  const getUserReview = (userId: string, targetId: string, targetType: 'hotel' | 'restaurant'): Review | null => {
    return reviews.find(
      review => review.userId === userId && review.targetId === targetId && review.targetType === targetType
    ) || null;
  };

  const getReviewSummary = (targetId: string, targetType: 'hotel' | 'restaurant'): ReviewSummary => {
    const targetReviews = getReviewsByTarget(targetId, targetType);
    
    if (targetReviews.length === 0) {
      return {
        targetId,
        targetType,
        averageRating: 0,
        totalReviews: 0,
        ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        recentReviews: [],
      };
    }

    const totalRating = targetReviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / targetReviews.length;

    const ratingBreakdown = targetReviews.reduce(
      (breakdown, review) => {
        breakdown[review.rating as keyof typeof breakdown]++;
        return breakdown;
      },
      { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    );

    return {
      targetId,
      targetType,
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: targetReviews.length,
      ratingBreakdown,
      recentReviews: targetReviews.slice(0, 5),
    };
  };

  const canUserReview = (userId: string, targetId: string, targetType: 'hotel' | 'restaurant'): boolean => {
    // Check if user already has a review for this target
    const existingReview = getUserReview(userId, targetId, targetType);
    if (existingReview) return false;

    // Check if user has completed bookings/orders for this target
    if (targetType === 'hotel') {
      return bookings.some(
        booking => 
          booking.userId === userId && 
          booking.hotelId === targetId && 
          booking.status === 'completed'
      );
    } else {
      return orders.some(
        order => 
          order.userId === userId && 
          order.restaurantId === targetId && 
          order.status === 'delivered'
      );
    }
  };

  const createReview = async (reviewData: Omit<Review, 'id' | 'createdAt' | 'helpful'>): Promise<Review> => {
    const newReview: Review = {
      ...reviewData,
      id: Date.now().toString(),
      createdAt: new Date(),
      helpful: 0,
    };

    const updatedReviews = [...reviews, newReview];
    setReviews(updatedReviews);
    await saveReviews(updatedReviews);
    return newReview;
  };

  const updateReview = async (reviewId: string, updates: Partial<Review>): Promise<boolean> => {
    const updatedReviews = reviews.map(review =>
      review.id === reviewId 
        ? { ...review, ...updates, updatedAt: new Date() }
        : review
    );
    
    setReviews(updatedReviews);
    await saveReviews(updatedReviews);
    return true;
  };

  const deleteReview = async (reviewId: string): Promise<boolean> => {
    const updatedReviews = reviews.filter(review => review.id !== reviewId);
    setReviews(updatedReviews);
    await saveReviews(updatedReviews);
    return true;
  };

  const markReviewHelpful = async (reviewId: string): Promise<boolean> => {
    const updatedReviews = reviews.map(review =>
      review.id === reviewId 
        ? { ...review, helpful: review.helpful + 1 }
        : review
    );
    
    setReviews(updatedReviews);
    await saveReviews(updatedReviews);
    return true;
  };

  const value: ReviewContextType = {
    reviews,
    loading,
    getReviewsByTarget,
    getReviewById,
    getUserReview,
    getReviewSummary,
    createReview,
    updateReview,
    deleteReview,
    markReviewHelpful,
    canUserReview,
  };

  return (
    <ReviewContext.Provider value={value}>
      {children}
    </ReviewContext.Provider>
  );
};