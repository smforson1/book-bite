import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Restaurant, MenuItem, Order, OrderItem } from '../types';

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
    } catch (error) {
      console.error('Error loading restaurant data:', error);
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
    return restaurants;
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
    const newOrder: Order = {
      ...orderData,
      id: Date.now().toString(),
      createdAt: new Date(),
    };

    setOrders(prev => [...prev, newOrder]);
    return newOrder;
  };

  const getUserOrders = (userId: string): Order[] => {
    return orders.filter(order => order.userId === userId);
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']): Promise<boolean> => {
    setOrders(prev =>
      prev.map(order =>
        order.id === orderId ? { ...order, status } : order
      )
    );
    return true;
  };

  const cancelOrder = async (orderId: string): Promise<boolean> => {
    return updateOrderStatus(orderId, 'cancelled');
  };

  const addRestaurant = async (restaurantData: Omit<Restaurant, 'id' | 'createdAt'>): Promise<Restaurant> => {
    const newRestaurant: Restaurant = {
      ...restaurantData,
      id: Date.now().toString(),
      createdAt: new Date(),
    };

    setRestaurants(prev => [...prev, newRestaurant]);
    return newRestaurant;
  };

  const updateRestaurant = async (restaurantId: string, updates: Partial<Restaurant>): Promise<boolean> => {
    setRestaurants(prev =>
      prev.map(restaurant =>
        restaurant.id === restaurantId ? { ...restaurant, ...updates } : restaurant
      )
    );
    return true;
  };

  const addMenuItem = async (menuItemData: Omit<MenuItem, 'id'>): Promise<MenuItem> => {
    const newMenuItem: MenuItem = {
      ...menuItemData,
      id: Date.now().toString(),
    };

    setMenuItems(prev => [...prev, newMenuItem]);
    return newMenuItem;
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