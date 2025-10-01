import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Restaurant, MenuItem, Order, Review } from '../types';
import { apiService } from '../services/apiService';
import { notificationService } from '../services/notificationService';
import { offlineManager } from '../services/offlineManager';
import { storageService } from '../services/storageService';

interface RestaurantContextType {
  restaurants: Restaurant[];
  menuItems: MenuItem[];
  orders: Order[];
  reviews: Review[];
  loading: boolean;
  // Add cart properties
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (menuItemId: string) => void;
  updateCartItemQuantity: (menuItemId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  // Restaurant management
  getRestaurants: () => Promise<Restaurant[]>;
  getMyRestaurants: () => Promise<Restaurant[]>;
  getRestaurantById: (id: string) => Restaurant | null;
  getMenuByRestaurantId: (restaurantId: string) => MenuItem[];
  searchRestaurants: (query: string, filters?: RestaurantFilters) => Restaurant[];
  // Menu management
  getMenuItems: () => Promise<MenuItem[]>;
  getMyMenuItems: () => Promise<MenuItem[]>;
  getMenuItemById: (id: string) => MenuItem | null;
  addMenuItem: (item: Omit<MenuItem, 'id'>) => Promise<MenuItem>;
  updateMenuItem: (itemId: string, updates: Partial<MenuItem>) => Promise<boolean>;
  removeMenuItem: (itemId: string) => Promise<boolean>;
  updateMenuItemPrice: (itemId: string, newPrice: number) => Promise<boolean>;
  toggleMenuItemAvailability: (itemId: string) => Promise<boolean>;
  // Order management
  createOrder: (orderData: Omit<Order, 'id' | 'createdAt'>) => Promise<Order>;
  getUserOrders: (userId: string) => Order[];
  getMyOrders: () => Promise<Order[]>;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<boolean>;
  cancelOrder: (orderId: string) => Promise<boolean>;
  // Review management
  getReviews: (restaurantId: string) => Promise<Review[]>;
  addReview: (reviewData: Omit<Review, 'id' | 'createdAt'>) => Promise<Review>;
  // Admin functions
  addRestaurant: (restaurant: Omit<Restaurant, 'id' | 'createdAt'>) => Promise<Restaurant>;
  updateRestaurant: (restaurantId: string, updates: Partial<Restaurant>) => Promise<boolean>;
}

interface RestaurantFilters {
  cuisine?: string[];
  minRating?: number;
  maxDeliveryTime?: number;
  maxDeliveryFee?: number;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
}

interface CartItem {
  menuItemId: string;
  restaurantId: string;
  name: string;
  price: number;
  quantity: number;
  specialInstructions?: string;
}

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

export const useRestaurant = () => {
  const context = useContext(RestaurantContext);
  if (!context) {
    throw new Error('useRestaurant must be used within a RestaurantProvider');
  }
  return context;
};

interface RestaurantProviderProps {
  children: ReactNode;
}

// Helper function to create sample menu items for testing
const createSampleMenuItems = (restaurants: Restaurant[]): MenuItem[] => {
  const sampleMenuItems: MenuItem[] = [];
  
  restaurants.forEach((restaurant) => {
    if (restaurant.name === 'Santoku Japanese Restaurant') {
      sampleMenuItems.push(
        {
          id: `menu_${restaurant.id}_1`,
          restaurantId: restaurant.id,
          name: 'Chicken Teriyaki Bento',
          description: 'Grilled chicken teriyaki with rice and vegetables',
          price: 55.00,
          category: 'Bento',
          images: [],
          isAvailable: true,
          ingredients: ['Chicken', 'Rice', 'Vegetables', 'Teriyaki Sauce'],
          allergens: ['Soy'],
          preparationTime: '15-20 minutes'
        },
        {
          id: `menu_${restaurant.id}_2`,
          restaurantId: restaurant.id,
          name: 'Salmon Sashimi Set',
          description: 'Fresh salmon sashimi with wasabi and pickled ginger',
          price: 65.00,
          category: 'Sashimi',
          images: [],
          isAvailable: true,
          ingredients: ['Fresh Salmon', 'Wasabi', 'Pickled Ginger', 'Soy Sauce'],
          allergens: ['Fish'],
          preparationTime: '10-15 minutes'
        },
        {
          id: `menu_${restaurant.id}_3`,
          restaurantId: restaurant.id,
          name: 'Miso Ramen',
          description: 'Rich miso broth with noodles, pork, and vegetables',
          price: 48.00,
          category: 'Ramen',
          images: [],
          isAvailable: true,
          ingredients: ['Ramen Noodles', 'Miso Broth', 'Pork', 'Green Onions', 'Egg'],
          allergens: ['Gluten', 'Soy', 'Egg'],
          preparationTime: '12-18 minutes'
        }
      );
    } else if (restaurant.name === 'Buka Restaurant') {
      sampleMenuItems.push(
        {
          id: `menu_${restaurant.id}_1`,
          restaurantId: restaurant.id,
          name: 'Jollof Rice with Grilled Chicken',
          description: 'Our signature jollof rice served with perfectly grilled chicken',
          price: 35.00,
          category: 'Main Course',
          images: [],
          isAvailable: true,
          ingredients: ['Rice', 'Chicken', 'Tomatoes', 'Onions', 'Spices'],
          allergens: [],
          preparationTime: '20-25 minutes'
        },
        {
          id: `menu_${restaurant.id}_2`,
          restaurantId: restaurant.id,
          name: 'Grilled Tilapia with Banku',
          description: 'Fresh tilapia grilled to perfection, served with traditional banku',
          price: 45.00,
          category: 'Main Course',
          images: [],
          isAvailable: true,
          ingredients: ['Tilapia', 'Banku', 'Pepper Sauce', 'Onions'],
          allergens: ['Fish'],
          preparationTime: '25-30 minutes'
        },
        {
          id: `menu_${restaurant.id}_3`,
          restaurantId: restaurant.id,
          name: 'Kelewele with Groundnut Soup',
          description: 'Spicy fried plantain served with rich groundnut soup',
          price: 28.00,
          category: 'Traditional',
          images: [],
          isAvailable: true,
          ingredients: ['Plantain', 'Groundnuts', 'Palm Oil', 'Spices', 'Meat'],
          allergens: ['Nuts'],
          preparationTime: '18-22 minutes'
        },
        {
          id: `menu_${restaurant.id}_4`,
          restaurantId: restaurant.id,
          name: 'Waakye with Stew',
          description: 'Traditional rice and beans served with spicy stew',
          price: 25.00,
          category: 'Traditional',
          images: [],
          isAvailable: true,
          ingredients: ['Rice', 'Beans', 'Stew', 'Gari', 'Boiled Egg'],
          allergens: ['Egg'],
          preparationTime: '15-20 minutes'
        }
      );
    }
  });
  
  return sampleMenuItems;
};

export const RestaurantProvider: React.FC<RestaurantProviderProps> = ({ children }) => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Try to load from backend first
      const backendResponse = await apiService.getRestaurants();
      
      if (backendResponse.success && backendResponse.data) {
        // Use real data from backend
        setRestaurants(backendResponse.data);
        
        // Load menu items for all restaurants
        const allMenuItems: MenuItem[] = [];
        for (const restaurant of backendResponse.data) {
          console.log(`🍕 Loading menu for ${restaurant.name}...`);
          const menuResponse = await apiService.getMenuByRestaurantId(restaurant.id);
          if (menuResponse.success && menuResponse.data) {
            console.log(`   ✅ Found ${menuResponse.data.length} menu items`);
            allMenuItems.push(...menuResponse.data);
          } else {
            console.log(`   ⚠️ No menu items found: ${menuResponse.error}`);
          }
        }
        
        // If no menu items found from backend, add sample menu items for testing
        if (allMenuItems.length === 0 && backendResponse.data.length > 0) {
          console.log('📝 No menu items found from backend, adding sample menu items for testing...');
          const sampleMenuItems = createSampleMenuItems(backendResponse.data);
          allMenuItems.push(...sampleMenuItems);
          console.log(`✅ Added ${sampleMenuItems.length} sample menu items`);
        }
        
        setMenuItems(allMenuItems);
        console.log(`🍽️ Total menu items loaded: ${allMenuItems.length}`);
        
        // Load user orders
        const ordersResponse = await apiService.getUserOrders();
        if (ordersResponse.success && ordersResponse.data) {
          setOrders(ordersResponse.data);
        }
        
        console.log(`✅ Loaded ${backendResponse.data.length} restaurants from backend`);
      } else {
        // If backend returns no data, try to load from offline storage
        console.log('⚠️ Backend returned no data, checking offline storage...');
        const offlineRestaurants = await storageService.getRestaurants();
        const offlineMenuItems = await storageService.getMenuItems();
        const offlineOrders = await storageService.getOrders();
        
        if (offlineRestaurants.length > 0) {
          setRestaurants(offlineRestaurants);
          setMenuItems(offlineMenuItems);
          setOrders(offlineOrders);
          console.log(`✅ Loaded ${offlineRestaurants.length} restaurants from offline storage`);
        } else {
          // Show empty state if no offline data
          setRestaurants([]);
          setMenuItems([]);
          setOrders([]);
          console.log('⚠️ No offline data found, showing empty state');
        }
      }
    } catch (error) {
      console.error('Error loading restaurant data:', error);
      
      // Try to load from offline storage on error
      try {
        const offlineRestaurants = await storageService.getRestaurants();
        const offlineMenuItems = await storageService.getMenuItems();
        const offlineOrders = await storageService.getOrders();
        
        if (offlineRestaurants.length > 0) {
          setRestaurants(offlineRestaurants);
          setMenuItems(offlineMenuItems);
          setOrders(offlineOrders);
          console.log(`✅ Loaded ${offlineRestaurants.length} restaurants from offline storage after error`);
        } else {
          setRestaurants([]);
          setMenuItems([]);
          setOrders([]);
          console.log('⚠️ No offline data found after error, showing empty state');
        }
      } catch (offlineError) {
        console.error('Error loading offline restaurant data:', offlineError);
        setRestaurants([]);
        setMenuItems([]);
        setOrders([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const saveData = async () => {
    try {
      await Promise.all([
        AsyncStorage.setItem('restaurants', JSON.stringify(restaurants)),
        AsyncStorage.setItem('menuItems', JSON.stringify(menuItems)),
        AsyncStorage.setItem('orders', JSON.stringify(orders)),
        AsyncStorage.setItem('cart', JSON.stringify(cart)),
      ]);
    } catch (error) {
      console.error('Error saving restaurant data:', error);
    }
  };

  useEffect(() => {
    if (!loading) {
      saveData();
    }
  }, [restaurants, menuItems, orders, cart, loading]);

  const getRestaurants = async (): Promise<Restaurant[]> => {
    try {
      setLoading(true);
      const response = await apiService.getRestaurants();
      
      if (response.success && response.data) {
        setRestaurants(response.data);
        // Cache locally for offline access
        await AsyncStorage.setItem('restaurants', JSON.stringify(response.data));
        return response.data;
      } else {
        console.error('Failed to fetch restaurants:', response.error);
        // Try to return offline data
        const offlineRestaurants = await storageService.getRestaurants();
        if (offlineRestaurants.length > 0) {
          console.log('✅ Returning offline restaurants data');
          return offlineRestaurants;
        }
        // Return empty array if no data available
        return [];
      }
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      // Try to return offline data
      try {
        const offlineRestaurants = await storageService.getRestaurants();
        if (offlineRestaurants.length > 0) {
          console.log('✅ Returning offline restaurants data after error');
          return offlineRestaurants;
        }
      } catch (offlineError) {
        console.error('Error fetching offline restaurants:', offlineError);
      }
      // Return empty array if API fails and no offline data
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getMyRestaurants = async (): Promise<Restaurant[]> => {
    try {
      setLoading(true);
      const response = await apiService.getMyRestaurants();
      
      if (response.success && response.data) {
        setRestaurants(response.data);
        // Cache locally for offline access
        await AsyncStorage.setItem('restaurants', JSON.stringify(response.data));
        return response.data;
      } else {
        console.error('Failed to fetch my restaurants:', response.error);
        // Try to return offline data
        const offlineRestaurants = await storageService.getRestaurants();
        if (offlineRestaurants.length > 0) {
          console.log('✅ Returning offline restaurants data');
          return offlineRestaurants;
        }
        // Return empty array if no data available
        return [];
      }
    } catch (error) {
      console.error('Error fetching my restaurants:', error);
      // Try to return offline data
      try {
        const offlineRestaurants = await storageService.getRestaurants();
        if (offlineRestaurants.length > 0) {
          console.log('✅ Returning offline restaurants data after error');
          return offlineRestaurants;
        }
      } catch (offlineError) {
        console.error('Error fetching offline restaurants:', offlineError);
      }
      // Return empty array if API fails and no offline data
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getRestaurantById = (id: string): Restaurant | null => {
    return restaurants.find(restaurant => restaurant.id === id) || null;
  };

  const getMenuByRestaurantId = (restaurantId: string): MenuItem[] => {
    const filteredItems = menuItems.filter(item => item.restaurantId === restaurantId);
    console.log(`🍕 Menu items for restaurant ${restaurantId}: ${filteredItems.length}`);
    return filteredItems;
  };

  const searchRestaurants = (query: string, filters?: RestaurantFilters): Restaurant[] => {
    let filteredRestaurants = restaurants.filter(restaurant =>
      restaurant.name.toLowerCase().includes(query.toLowerCase()) ||
      restaurant.address.toLowerCase().includes(query.toLowerCase()) ||
      restaurant.cuisine.some(c => c.toLowerCase().includes(query.toLowerCase()))
    );

    if (filters) {
      if (filters.minRating) {
        filteredRestaurants = filteredRestaurants.filter(restaurant => restaurant.rating >= filters.minRating!);
      }
      if (filters.maxDeliveryFee) {
        filteredRestaurants = filteredRestaurants.filter(restaurant => restaurant.deliveryFee <= filters.maxDeliveryFee!);
      }
      
      if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
        // Filter restaurants based on menu item prices
        filteredRestaurants = filteredRestaurants.filter(restaurant => {
          const restaurantMenu = getMenuByRestaurantId(restaurant.id);
          if (restaurantMenu.length === 0) return false;
          
          // Check if any menu item falls within the price range
          return restaurantMenu.some(item => {
            if (filters.minPrice !== undefined && item.price < filters.minPrice!) return false;
            if (filters.maxPrice !== undefined && item.price > filters.maxPrice!) return false;
            return true;
          });
        });
      }

      if (filters.cuisine && filters.cuisine.length > 0) {
        filteredRestaurants = filteredRestaurants.filter(restaurant =>
          filters.cuisine!.some(cuisine =>
            restaurant.cuisine.some(restaurantCuisine =>
              restaurantCuisine.toLowerCase().includes(cuisine.toLowerCase())
            )
          )
        );
      }
      if (filters.location) {
        filteredRestaurants = filteredRestaurants.filter(restaurant =>
          restaurant.address.toLowerCase().includes(filters.location!.toLowerCase())
        );
      }
    }

    return filteredRestaurants;
  };

  const getMenuItems = async (): Promise<MenuItem[]> => {
    try {
      setLoading(true);
      // This method should not be called without a restaurant ID
      // It's better to use getMenuByRestaurantId instead
      console.warn('getMenuItems called without restaurant ID. Use getMenuByRestaurantId instead.');
      return [];
    } catch (error) {
      console.error('Error fetching menu items:', error);
      // Return empty array if API fails
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getMyMenuItems = async (): Promise<MenuItem[]> => {
    try {
      setLoading(true);
      const response = await apiService.getMyMenuItems();
      
      if (response.success && response.data) {
        setMenuItems(response.data);
        // Cache locally for offline access
        await AsyncStorage.setItem('menuItems', JSON.stringify(response.data));
        return response.data;
      } else {
        console.error('Failed to fetch my menu items:', response.error);
        // Try to return offline data
        const offlineMenuItems = await storageService.getMenuItems();
        if (offlineMenuItems.length > 0) {
          console.log('✅ Returning offline menu items data');
          return offlineMenuItems;
        }
        // Return empty array if no data available
        return [];
      }
    } catch (error) {
      console.error('Error fetching my menu items:', error);
      // Try to return offline data
      try {
        const offlineMenuItems = await storageService.getMenuItems();
        if (offlineMenuItems.length > 0) {
          console.log('✅ Returning offline menu items data after error');
          return offlineMenuItems;
        }
      } catch (offlineError) {
        console.error('Error fetching offline menu items:', offlineError);
      }
      // Return empty array if API fails and no offline data
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getMenuItemById = (id: string): MenuItem | null => {
    return menuItems.find(item => item.id === id) || null;
  };

  const addMenuItem = async (item: Omit<MenuItem, 'id'>): Promise<MenuItem> => {
    try {
      const response = await apiService.createMenuItem(item);
      
      if (response.success && response.data) {
        const newMenuItem = response.data;
        setMenuItems(prev => [...prev, newMenuItem]);
        return newMenuItem;
      } else {
        throw new Error(response.error || 'Failed to create menu item');
      }
    } catch (error) {
      console.error('Error creating menu item:', error);
      // Fallback to local creation
      const newMenuItem: MenuItem = {
        ...item,
        id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };
      setMenuItems(prev => [...prev, newMenuItem]);
      return newMenuItem;
    }
  };

  const updateMenuItem = async (itemId: string, updates: Partial<MenuItem>): Promise<boolean> => {
    setMenuItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, ...updates } : item
      )
    );
    return true;
  };

  const updateMenuItemPrice = async (itemId: string, newPrice: number): Promise<boolean> => {
    try {
      const response = await apiService.updateMenuItem(itemId, { price: newPrice });
      
      if (response.success) {
        setMenuItems(prev =>
          prev.map(item =>
            item.id === itemId ? { ...item, price: newPrice } : item
          )
        );
        return true;
      } else {
        console.error('Failed to update menu item price:', response.error);
        return false;
      }
    } catch (error) {
      console.error('Error updating menu item price:', error);
      // Update locally even if API fails
      setMenuItems(prev =>
        prev.map(item =>
          item.id === itemId ? { ...item, price: newPrice } : item
        )
      );
      return false;
    }
  };

  const toggleMenuItemAvailability = async (itemId: string): Promise<boolean> => {
    try {
      // Get the current menu item to determine the new availability status
      const currentItem = menuItems.find(item => item.id === itemId);
      if (!currentItem) return false;
      
      const newAvailability = !currentItem.isAvailable;
      const response = await apiService.updateMenuItem(itemId, { isAvailable: newAvailability });
      
      if (response.success) {
        setMenuItems(prev =>
          prev.map(item =>
            item.id === itemId ? { ...item, isAvailable: newAvailability } : item
          )
        );
        return true;
      } else {
        console.error('Failed to update menu item availability:', response.error);
        return false;
      }
    } catch (error) {
      console.error('Error updating menu item availability:', error);
      // Update locally even if API fails
      setMenuItems(prev =>
        prev.map(item => {
          if (item.id === itemId) {
            const newAvailability = !item.isAvailable;
            return { ...item, isAvailable: newAvailability };
          }
          return item;
        })
      );
      return false;
    }
  };

  const removeMenuItem = async (itemId: string): Promise<boolean> => {
    setMenuItems(prev => prev.filter(item => item.id !== itemId));
    return true;
  };

  const addToCart = (item: CartItem) => {
    setCart(prev => {
      const existingItem = prev.find(cartItem => cartItem.menuItemId === item.menuItemId);
      if (existingItem) {
        return prev.map(cartItem =>
          cartItem.menuItemId === item.menuItemId
            ? { ...cartItem, quantity: cartItem.quantity + item.quantity }
            : cartItem
        );
      }
      return [...prev, item];
    });
  };

  const removeFromCart = (menuItemId: string) => {
    setCart(prev => prev.filter(item => item.menuItemId !== menuItemId));
  };

  const updateCartItemQuantity = (menuItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(menuItemId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.menuItemId === menuItemId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartTotal = (): number => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const createOrder = async (orderData: Omit<Order, 'id' | 'createdAt'>): Promise<Order> => {
    try {
      setLoading(true);
      const response = await apiService.createOrder({
        ...orderData,
        estimatedDeliveryTime: orderData.estimatedDeliveryTime || new Date(Date.now() + 45 * 60 * 1000) // 45 mins default
      });
      
      if (response.success && response.data) {
        const newOrder = response.data;
        setOrders(prev => [...prev, newOrder]);
        
        // Clear cart after successful order
        clearCart();
        
        // Send order confirmation notification
        await notificationService.scheduleLocalNotification(
          'Order Confirmed!',
          `Your order from ${getRestaurantById(newOrder.restaurantId)?.name || 'restaurant'} has been confirmed.`,
          { orderId: newOrder.id, type: 'order_placed' }
        );
        
        return newOrder;
      } else {
        throw new Error(response.error || 'Failed to create order');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      
      // Check if we're offline
      const isOnline = offlineManager.getNetworkStatus();
      if (!isOnline) {
        // Create local order for offline mode
        const newOrder: Order = {
          ...orderData,
          id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date(),
          status: 'pending',
          paymentStatus: 'pending',
          estimatedDeliveryTime: orderData.estimatedDeliveryTime || new Date(Date.now() + 45 * 60 * 1000)
        };
        setOrders(prev => [...prev, newOrder]);
        
        // Save pending order for sync when online
        await storageService.savePendingOrder({
          ...newOrder,
          synced: false,
          localId: newOrder.id
        });
        
        // Clear cart after successful local order creation
        clearCart();
        
        console.log('💾 Order saved locally for offline mode');
        return newOrder;
      } else {
        // Fallback to local order creation even when online (shouldn't happen)
        const newOrder: Order = {
          ...orderData,
          id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date(),
          status: 'pending',
          paymentStatus: 'pending',
          estimatedDeliveryTime: orderData.estimatedDeliveryTime || new Date(Date.now() + 45 * 60 * 1000)
        };
        setOrders(prev => [...prev, newOrder]);
        
        // Queue for retry when connection is restored
        await storageService.savePendingOrder({
          ...newOrder,
          synced: false,
          localId: newOrder.id
        });
        
        // Clear cart after successful local order creation
        clearCart();
        
        return newOrder;
      }
    } finally {
      setLoading(false);
    }
  };

  const getUserOrders = (userId: string): Order[] => {
    return orders.filter(order => order.userId === userId);
  };

  const getMyOrders = async (): Promise<Order[]> => {
    try {
      setLoading(true);
      const response = await apiService.getMyOrders();
      
      if (response.success && response.data) {
        setOrders(response.data);
        // Cache locally for offline access
        await AsyncStorage.setItem('orders', JSON.stringify(response.data));
        return response.data;
      } else {
        console.error('Failed to fetch my orders:', response.error);
        // Try to return offline data
        const offlineOrders = await storageService.getOrders();
        if (offlineOrders.length > 0) {
          console.log('✅ Returning offline orders data');
          return offlineOrders;
        }
        // Return empty array if no data available
        return [];
      }
    } catch (error) {
      console.error('Error fetching my orders:', error);
      // Try to return offline data
      try {
        const offlineOrders = await storageService.getOrders();
        if (offlineOrders.length > 0) {
          console.log('✅ Returning offline orders data after error');
          return offlineOrders;
        }
      } catch (offlineError) {
        console.error('Error fetching offline orders:', offlineError);
      }
      // Return empty array if API fails and no offline data
      return [];
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']): Promise<boolean> => {
    try {
      const response = await apiService.updateOrderStatus(orderId, status);
      
      if (response.success) {
        setOrders(prev =>
          prev.map(order =>
            order.id === orderId ? { ...order, status } : order
          )
        );
        
        // Send status update notification
        const order = orders.find(o => o.id === orderId);
        if (order) {
          const statusMessages = {
            pending: 'Your order is pending confirmation',
            confirmed: 'Your order has been confirmed and is being prepared',
            preparing: 'Your order is being prepared',
            ready: 'Your order is ready for pickup/delivery',
            picked_up: 'Your order has been picked up by the delivery driver',
            on_the_way: 'Your order is on the way to you',
            delivered: 'Your order has been delivered. Enjoy your meal!',
            cancelled: 'Your order has been cancelled'
          };
          
          await notificationService.scheduleLocalNotification(
            'Order Update',
            statusMessages[status] || `Order status updated to ${status}`,
            { orderId, status, type: 'order_status_update' }
          );
        }
        
        return true;
      } else {
        console.error('Failed to update order status:', response.error);
        return false;
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      
      // Check if we're offline
      const isOnline = offlineManager.getNetworkStatus();
      if (!isOnline) {
        // Update locally even if offline
        setOrders(prev =>
          prev.map(order =>
            order.id === orderId ? { ...order, status } : order
          )
        );
        
        // Save pending status update for sync when online
        const order = orders.find(o => o.id === orderId);
        if (order) {
          await storageService.savePendingOrder({
            ...order,
            status,
            synced: false
          });
        }
        
        console.log('💾 Order status update saved locally for offline mode');
        return true;
      } else {
        // Update locally even if API fails
        setOrders(prev =>
          prev.map(order =>
            order.id === orderId ? { ...order, status } : order
          )
        );
        return false;
      }
    }
  };

  const cancelOrder = async (orderId: string): Promise<boolean> => {
    return updateOrderStatus(orderId, 'cancelled');
  };

  const addRestaurant = async (restaurantData: Omit<Restaurant, 'id' | 'createdAt'>): Promise<Restaurant> => {
    try {
      const response = await apiService.createRestaurant(restaurantData);
      
      if (response.success && response.data) {
        const newRestaurant = response.data;
        setRestaurants(prev => [...prev, newRestaurant]);
        return newRestaurant;
      } else {
        throw new Error(response.error || 'Failed to create restaurant');
      }
    } catch (error) {
      console.error('Error creating restaurant:', error);
      // Fallback to local creation
      const newRestaurant: Restaurant = {
        ...restaurantData,
        id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
      };
      setRestaurants(prev => [...prev, newRestaurant]);
      return newRestaurant;
    }
  };

  const updateRestaurant = async (restaurantId: string, updates: Partial<Restaurant>): Promise<boolean> => {
    try {
      const response = await apiService.updateRestaurant(restaurantId, updates);
      
      if (response.success) {
        setRestaurants(prev =>
          prev.map(restaurant =>
            restaurant.id === restaurantId ? { ...restaurant, ...updates } : restaurant
          )
        );
        return true;
      } else {
        console.error('Failed to update restaurant:', response.error);
        return false;
      }
    } catch (error) {
      console.error('Error updating restaurant:', error);
      // Update locally even if API fails
      setRestaurants(prev =>
        prev.map(restaurant =>
          restaurant.id === restaurantId ? { ...restaurant, ...updates } : restaurant
        )
      );
      return false;
    }
  };

  const getReviews = async (restaurantId: string): Promise<Review[]> => {
    try {
      setLoading(true);
      const response = await apiService.getReviews({ targetId: restaurantId, targetType: 'restaurant' });
      
      if (response.success && response.data) {
        setReviews(response.data.reviews);
        // Cache locally for offline access
        await AsyncStorage.setItem('reviews', JSON.stringify(response.data.reviews));
        return response.data.reviews;
      } else {
        console.error('Failed to fetch reviews:', response.error);
        // Try to return offline data
        const offlineReviews = await storageService.getReviews();
        const restaurantReviews = offlineReviews.filter(review => review.targetId === restaurantId);
        if (restaurantReviews.length > 0) {
          console.log('✅ Returning offline reviews data');
          return restaurantReviews;
        }
        // Return empty array if no data available
        return [];
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      // Try to return offline data
      try {
        const offlineReviews = await storageService.getReviews();
        const restaurantReviews = offlineReviews.filter(review => review.targetId === restaurantId);
        if (restaurantReviews.length > 0) {
          console.log('✅ Returning offline reviews data after error');
          return restaurantReviews;
        }
      } catch (offlineError) {
        console.error('Error fetching offline reviews:', offlineError);
      }
      // Return empty array if API fails and no offline data
      return [];
    } finally {
      setLoading(false);
    }
  };

  const addReview = async (reviewData: Omit<Review, 'id' | 'createdAt'>): Promise<Review> => {
    try {
      const response = await apiService.createReview(reviewData);
      
      if (response.success && response.data) {
        const newReview = response.data;
        setReviews(prev => [...prev, newReview.review]);
        return newReview.review;
      } else {
        throw new Error(response.error || 'Failed to create review');
      }
    } catch (error) {
      console.error('Error creating review:', error);
      
      // Check if we're offline
      const isOnline = offlineManager.getNetworkStatus();
      if (!isOnline) {
        // Create local review for offline mode
        const newReview: Review = {
          ...reviewData,
          id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date(),
        };
        setReviews(prev => [...prev, newReview]);
        
        // Save pending review for sync when online
        await storageService.savePendingReview({
          ...newReview,
          synced: false,
          localId: newReview.id
        });
        
        console.log('💾 Review saved locally for offline mode');
        return newReview;
      } else {
        // Fallback to local creation even when online (shouldn't happen)
        const newReview: Review = {
          ...reviewData,
          id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date(),
        };
        setReviews(prev => [...prev, newReview]);
        
        // Queue for retry when connection is restored
        await storageService.savePendingReview({
          ...newReview,
          synced: false,
          localId: newReview.id
        });
        
        return newReview;
      }
    }
  };

  const value = {
    restaurants,
    menuItems,
    orders,
    reviews,
    loading,
    cart,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    getCartTotal,
    getRestaurants,
    getMyRestaurants,
    getRestaurantById,
    getMenuByRestaurantId,
    searchRestaurants,
    getMenuItems,
    getMyMenuItems,
    getMenuItemById,
    addMenuItem,
    updateMenuItem,
    removeMenuItem,
    updateMenuItemPrice,
    toggleMenuItemAvailability,
    createOrder,
    getUserOrders,
    getMyOrders,
    updateOrderStatus,
    cancelOrder,
    getReviews,
    addReview,
    addRestaurant,
    updateRestaurant,
  };

  return (
    <RestaurantContext.Provider value={value}>
      {children}
    </RestaurantContext.Provider>
  );
};

export type { CartItem, RestaurantFilters };