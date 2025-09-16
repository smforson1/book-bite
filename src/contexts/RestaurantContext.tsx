import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Restaurant, MenuItem, Order, OrderItem } from '../types';
import { apiService } from '../services/apiService';
import { notificationService } from '../services/notificationService';

interface RestaurantContextType {
  restaurants: Restaurant[];
  menuItems: MenuItem[];
  orders: Order[];
  cart: CartItem[];
  loading: boolean;
  // Restaurant management
  getRestaurants: () => Promise<Restaurant[]>;
  getRestaurantById: (id: string) => Restaurant | null;
  getMenuByRestaurantId: (restaurantId: string) => MenuItem[];
  getMenuItemById: (id: string) => MenuItem | null;
  searchRestaurants: (query: string, filters?: RestaurantFilters) => Restaurant[];
  // Cart management
  addToCart: (item: CartItem) => void;
  removeFromCart: (menuItemId: string) => void;
  updateCartItemQuantity: (menuItemId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  // Order management
  createOrder: (orderData: Omit<Order, 'id' | 'createdAt'>) => Promise<Order>;
  getUserOrders: (userId: string) => Order[];
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<boolean>;
  cancelOrder: (orderId: string) => Promise<boolean>;
  // Admin functions
  addRestaurant: (restaurant: Omit<Restaurant, 'id' | 'createdAt'>) => Promise<Restaurant>;
  updateRestaurant: (restaurantId: string, updates: Partial<Restaurant>) => Promise<boolean>;
  addMenuItem: (menuItem: Omit<MenuItem, 'id'>) => Promise<MenuItem>;
  updateMenuItem: (menuItemId: string, updates: Partial<MenuItem>) => Promise<boolean>;
  updateMenuItemPrice: (menuItemId: string, newPrice: number) => Promise<boolean>;
  toggleMenuItemAvailability: (menuItemId: string) => Promise<boolean>;
}

interface RestaurantFilters {
  cuisine?: string[];
  minRating?: number;
  maxDeliveryTime?: number;
  maxDeliveryFee?: number;
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

export const RestaurantProvider: React.FC<RestaurantProviderProps> = ({ children }) => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
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
          const menuResponse = await apiService.getMenuByRestaurantId(restaurant.id);
          if (menuResponse.success && menuResponse.data) {
            allMenuItems.push(...menuResponse.data);
          }
        }
        setMenuItems(allMenuItems);
        
        // Load user orders
        const ordersResponse = await apiService.getUserOrders();
        if (ordersResponse.success && ordersResponse.data) {
          setOrders(ordersResponse.data);
        }
        
        console.log(`✅ Loaded ${backendResponse.data.length} restaurants from backend`);
      } else {
        // Fallback to stored data if backend fails
        console.log('⚠️ Backend unavailable, loading stored data...');
        const [storedRestaurants, storedMenuItems, storedOrders, storedCart] = await Promise.all([
          AsyncStorage.getItem('restaurants'),
          AsyncStorage.getItem('menuItems'),
          AsyncStorage.getItem('orders'),
          AsyncStorage.getItem('cart'),
        ]);

        if (storedRestaurants) setRestaurants(JSON.parse(storedRestaurants));
        if (storedMenuItems) setMenuItems(JSON.parse(storedMenuItems));
        if (storedOrders) setOrders(JSON.parse(storedOrders));
        if (storedCart) setCart(JSON.parse(storedCart));
      }
    } catch (error) {
      console.error('Error loading restaurant data:', error);
      
      // Fallback to stored data on error
      try {
        const [storedRestaurants, storedMenuItems, storedOrders, storedCart] = await Promise.all([
          AsyncStorage.getItem('restaurants'),
          AsyncStorage.getItem('menuItems'),
          AsyncStorage.getItem('orders'),
          AsyncStorage.getItem('cart'),
        ]);

        if (storedRestaurants) setRestaurants(JSON.parse(storedRestaurants));
        if (storedMenuItems) setMenuItems(JSON.parse(storedMenuItems));
        if (storedOrders) setOrders(JSON.parse(storedOrders));
        if (storedCart) setCart(JSON.parse(storedCart));
      } catch (fallbackError) {
        console.error('Error loading fallback data:', fallbackError);
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
        // Return cached data if API fails
        return restaurants;
      }
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      // Return cached data if API fails
      return restaurants;
    } finally {
      setLoading(false);
    }
  };

  const getRestaurantById = (id: string): Restaurant | null => {
    return restaurants.find(restaurant => restaurant.id === id) || null;
  };

  const getMenuByRestaurantId = (restaurantId: string): MenuItem[] => {
    return menuItems.filter(item => item.restaurantId === restaurantId);
  };

  const getMenuItemById = (id: string): MenuItem | null => {
    return menuItems.find(item => item.id === id) || null;
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
        await notificationService.sendOrderNotification({
          orderId: newOrder.id,
          userId: newOrder.userId,
          restaurantId: newOrder.restaurantId,
          type: 'order_placed',
          title: 'Order Confirmed!',
          message: `Your order from ${getRestaurantById(newOrder.restaurantId)?.name || 'restaurant'} has been confirmed.`,
          data: { orderId: newOrder.id }
        });
        
        return newOrder;
      } else {
        throw new Error(response.error || 'Failed to create order');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      // Fallback to local order creation
      const newOrder: Order = {
        ...orderData,
        id: `local_${Date.now()}`,
        createdAt: new Date(),
        status: 'pending'
      };
      setOrders(prev => [...prev, newOrder]);
      
      // Queue for retry when connection is restored
      await AsyncStorage.setItem(`pending_order_${newOrder.id}`, JSON.stringify(newOrder));
      
      return newOrder;
    } finally {
      setLoading(false);
    }
  };

  const getUserOrders = (userId: string): Order[] => {
    return orders.filter(order => order.userId === userId);
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
          
          await notificationService.sendOrderNotification({
            orderId,
            userId: order.userId,
            restaurantId: order.restaurantId,
            type: 'order_status_update',
            title: 'Order Update',
            message: statusMessages[status] || `Order status updated to ${status}`,
            data: { orderId, status }
          });
        }
        
        return true;
      } else {
        console.error('Failed to update order status:', response.error);
        return false;
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      // Update locally even if API fails
      setOrders(prev =>
        prev.map(order =>
          order.id === orderId ? { ...order, status } : order
        )
      );
      return false;
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
        id: `local_${Date.now()}`,
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

  const addMenuItem = async (menuItemData: Omit<MenuItem, 'id'>): Promise<MenuItem> => {
    try {
      const response = await apiService.createMenuItem(menuItemData);
      
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
        ...menuItemData,
        id: `local_${Date.now()}`,
      };
      setMenuItems(prev => [...prev, newMenuItem]);
      return newMenuItem;
    }
  };

  const updateMenuItem = async (menuItemId: string, updates: Partial<MenuItem>): Promise<boolean> => {
    setMenuItems(prev =>
      prev.map(item =>
        item.id === menuItemId ? { ...item, ...updates } : item
      )
    );
    return true;
  };

  const updateMenuItemPrice = async (menuItemId: string, newPrice: number): Promise<boolean> => {
    return updateMenuItem(menuItemId, { price: newPrice });
  };

  const toggleMenuItemAvailability = async (menuItemId: string): Promise<boolean> => {
    const menuItem = menuItems.find(item => item.id === menuItemId);
    if (!menuItem) return false;
    return updateMenuItem(menuItemId, { isAvailable: !menuItem.isAvailable });
  };

  const value: RestaurantContextType = {
    restaurants,
    menuItems,
    orders,
    cart,
    loading,
    getRestaurants,
    getRestaurantById,
    getMenuByRestaurantId,
    getMenuItemById,
    searchRestaurants,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    getCartTotal,
    createOrder,
    getUserOrders,
    updateOrderStatus,
    cancelOrder,
    addRestaurant,
    updateRestaurant,
    addMenuItem,
    updateMenuItem,
    updateMenuItemPrice,
    toggleMenuItemAvailability,
  };

  return (
    <RestaurantContext.Provider value={value}>
      {children}
    </RestaurantContext.Provider>
  );
};

export type { CartItem, RestaurantFilters };