import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { storageService } from '../services/storageService';
import { Hotel, Room, Booking } from '../types';
import { apiService } from '../services/apiService';
import { notificationService } from '../services/notificationService';

interface HotelContextType {
  hotels: Hotel[];
  rooms: Room[];
  bookings: Booking[];
  loading: boolean;
  // Hotel management
  getHotels: () => Promise<Hotel[]>;
  getHotelById: (id: string) => Hotel | null;
  getRoomsByHotelId: (hotelId: string) => Room[];
  searchHotels: (query: string, filters?: HotelFilters) => Hotel[];
  // Booking management
  createBooking: (bookingData: Omit<Booking, 'id' | 'createdAt'>) => Promise<Booking>;
  getUserBookings: (userId: string) => Booking[];
  updateBookingStatus: (bookingId: string, status: Booking['status']) => Promise<boolean>;
  cancelBooking: (bookingId: string) => Promise<boolean>;
  // Admin functions
  addHotel: (hotel: Omit<Hotel, 'id' | 'createdAt'>) => Promise<Hotel>;
  updateHotel: (hotelId: string, updates: Partial<Hotel>) => Promise<boolean>;
  addRoom: (room: Omit<Room, 'id'>) => Promise<Room>;
  updateRoom: (roomId: string, updates: Partial<Room>) => Promise<boolean>;
  updateRoomPrice: (roomId: string, newPrice: number) => Promise<boolean>;
  removeRoom: (roomId: string) => Promise<boolean>;
}

interface HotelFilters {
  minPrice?: number;
  maxPrice?: number;
  amenities?: string[];
  rating?: number;
  location?: string;
}

const HotelContext = createContext<HotelContextType | undefined>(undefined);

export const useHotel = () => {
  const context = useContext(HotelContext);
  if (!context) {
    throw new Error('useHotel must be used within a HotelProvider');
  }
  return context;
};

interface HotelProviderProps {
  children: ReactNode;
}

export const HotelProvider: React.FC<HotelProviderProps> = ({ children }) => {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [storedHotels, storedRooms, storedBookings] = await Promise.all([
        AsyncStorage.getItem('hotels'),
        AsyncStorage.getItem('rooms'),
        AsyncStorage.getItem('bookings'),
      ]);

      if (storedHotels) setHotels(JSON.parse(storedHotels));
      if (storedRooms) setRooms(JSON.parse(storedRooms));
      if (storedBookings) setBookings(JSON.parse(storedBookings));
    } catch (error) {
      console.error('Error loading hotel data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveData = async () => {
    try {
      await Promise.all([
        AsyncStorage.setItem('hotels', JSON.stringify(hotels)),
        AsyncStorage.setItem('rooms', JSON.stringify(rooms)),
        AsyncStorage.setItem('bookings', JSON.stringify(bookings)),
      ]);
    } catch (error) {
      console.error('Error saving hotel data:', error);
    }
  };

  useEffect(() => {
    if (!loading) {
      saveData();
    }
  }, [hotels, rooms, bookings, loading]);

  const getHotels = async (): Promise<Hotel[]> => {
    try {
      setLoading(true);
      const response = await apiService.getHotels();
      
      if (response.success && response.data) {
        setHotels(response.data);
        // Cache locally for offline access
        await AsyncStorage.setItem('hotels', JSON.stringify(response.data));
        return response.data;
      } else {
        console.error('Failed to fetch hotels:', response.error);
        // Return cached data if API fails
        return hotels;
      }
    } catch (error) {
      console.error('Error fetching hotels:', error);
      // Return cached data if API fails
      return hotels;
    } finally {
      setLoading(false);
    }
  };

  const getHotelById = (id: string): Hotel | null => {
    return hotels.find(hotel => hotel.id === id) || null;
  };

  const getRoomsByHotelId = (hotelId: string): Room[] => {
    return rooms.filter(room => room.hotelId === hotelId);
  };

  const searchHotels = (query: string, filters?: HotelFilters): Hotel[] => {
    let filteredHotels = hotels.filter(hotel =>
      hotel.name.toLowerCase().includes(query.toLowerCase()) ||
      hotel.address.toLowerCase().includes(query.toLowerCase())
    );

    if (filters) {
      if (filters.rating) {
        filteredHotels = filteredHotels.filter(hotel => hotel.rating >= filters.rating!);
      }
      if (filters.location) {
        filteredHotels = filteredHotels.filter(hotel =>
          hotel.address.toLowerCase().includes(filters.location!.toLowerCase())
        );
      }
      if (filters.amenities && filters.amenities.length > 0) {
        filteredHotels = filteredHotels.filter(hotel =>
          filters.amenities!.some(amenity =>
            hotel.amenities.some(hotelAmenity =>
              hotelAmenity.toLowerCase().includes(amenity.toLowerCase())
            )
          )
        );
      }
    }

    return filteredHotels;
  };

  const createBooking = async (bookingData: Omit<Booking, 'id' | 'createdAt'>): Promise<Booking> => {
    try {
      setLoading(true);
      const response = await apiService.createBooking(bookingData);
      
      if (response.success && response.data) {
        const newBooking = response.data;
        setBookings(prev => [...prev, newBooking]);
        
        // Send booking confirmation notification
        await notificationService.sendBookingNotification({
          bookingId: newBooking.id,
          userId: newBooking.userId,
          hotelId: newBooking.hotelId,
          type: 'booking_confirmed',
          title: 'Booking Confirmed!',
          message: `Your booking at ${getHotelById(newBooking.hotelId)?.name || 'hotel'} has been confirmed.`,
          data: { bookingId: newBooking.id }
        });
        
        return newBooking;
      } else {
        throw new Error(response.error || 'Failed to create booking');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      // Fallback to local booking creation
      const newBooking: Booking = {
        ...bookingData,
        id: `local_${Date.now()}`,
        createdAt: new Date(),
        status: 'pending'
      };
      setBookings(prev => [...prev, newBooking]);
      
      // Queue for retry when connection is restored
      await AsyncStorage.setItem(`pending_booking_${newBooking.id}`, JSON.stringify(newBooking));
      
      return newBooking;
    } finally {
      setLoading(false);
    }
  };

  const getUserBookings = (userId: string): Booking[] => {
    return bookings.filter(booking => booking.userId === userId);
  };

  const updateBookingStatus = async (bookingId: string, status: Booking['status']): Promise<boolean> => {
    try {
      const response = await apiService.updateBookingStatus(bookingId, status);
      
      if (response.success) {
        setBookings(prev =>
          prev.map(booking =>
            booking.id === bookingId ? { ...booking, status } : booking
          )
        );
        
        // Send status update notification
        const booking = bookings.find(b => b.id === bookingId);
        if (booking) {
          const statusMessages: { [key in Booking['status']]: string } = {
            pending: 'Your booking is pending confirmation',
            confirmed: 'Your booking has been confirmed',
            cancelled: 'Your booking has been cancelled',
            completed: 'Your booking has been completed. Thank you for staying with us!'
          };
          
          await notificationService.sendBookingNotification({
            bookingId,
            userId: booking.userId,
            hotelId: booking.hotelId,
            type: 'booking_status_update',
            title: 'Booking Update',
            message: statusMessages[status] || `Booking status updated to ${status}`,
            data: { bookingId, status }
          });
        }
        
        return true;
      } else {
        console.error('Failed to update booking status:', response.error);
        return false;
      }
    } catch (error) {
      console.error('Error updating booking status:', error);
      // Update locally even if API fails
      setBookings(prev =>
        prev.map(booking =>
          booking.id === bookingId ? { ...booking, status } : booking
        )
      );
      return false;
    }
  };

  const cancelBooking = async (bookingId: string): Promise<boolean> => {
    return updateBookingStatus(bookingId, 'cancelled');
  };

  const addHotel = async (hotelData: Omit<Hotel, 'id' | 'createdAt'>): Promise<Hotel> => {
    try {
      const response = await apiService.createHotel(hotelData);
      
      if (response.success && response.data) {
        const newHotel = response.data;
        setHotels(prev => [...prev, newHotel]);
        return newHotel;
      } else {
        throw new Error(response.error || 'Failed to create hotel');
      }
    } catch (error) {
      console.error('Error creating hotel:', error);
      // Fallback to local creation
      const newHotel: Hotel = {
        ...hotelData,
        id: `local_${Date.now()}`,
        createdAt: new Date(),
      };
      setHotels(prev => [...prev, newHotel]);
      return newHotel;
    }
  };

  const updateHotel = async (hotelId: string, updates: Partial<Hotel>): Promise<boolean> => {
    try {
      const response = await apiService.updateHotel(hotelId, updates);
      
      if (response.success) {
        setHotels(prev =>
          prev.map(hotel =>
            hotel.id === hotelId ? { ...hotel, ...updates } : hotel
          )
        );
        return true;
      } else {
        console.error('Failed to update hotel:', response.error);
        return false;
      }
    } catch (error) {
      console.error('Error updating hotel:', error);
      // Update locally even if API fails
      setHotels(prev =>
        prev.map(hotel =>
          hotel.id === hotelId ? { ...hotel, ...updates } : hotel
        )
      );
      return false;
    }
  };

  const addRoom = async (roomData: Omit<Room, 'id'>): Promise<Room> => {
    try {
      const response = await apiService.createRoom(roomData);
      
      if (response.success && response.data) {
        const newRoom = response.data;
        setRooms(prev => [...prev, newRoom]);
        return newRoom;
      } else {
        throw new Error(response.error || 'Failed to create room');
      }
    } catch (error) {
      console.error('Error creating room:', error);
      // Fallback to local creation
      const newRoom: Room = {
        ...roomData,
        id: `local_${Date.now()}`,
      };
      setRooms(prev => [...prev, newRoom]);
      return newRoom;
    }
  };

  const updateRoom = async (roomId: string, updates: Partial<Room>): Promise<boolean> => {
    setRooms(prev =>
      prev.map(room =>
        room.id === roomId ? { ...room, ...updates } : room
      )
    );
    return true;
  };

  const updateRoomPrice = async (roomId: string, newPrice: number): Promise<boolean> => {
    return updateRoom(roomId, { price: newPrice });
  };

  const removeRoom = async (roomId: string): Promise<boolean> => {
    setRooms(prev => prev.filter(room => room.id !== roomId));
    return true;
  };

  const value: HotelContextType = {
    hotels,
    rooms,
    bookings,
    loading,
    getHotels,
    getHotelById,
    getRoomsByHotelId,
    searchHotels,
    createBooking,
    getUserBookings,
    updateBookingStatus,
    cancelBooking,
    addHotel,
    updateHotel,
    addRoom,
    updateRoom,
    updateRoomPrice,
    removeRoom,
  };

  return (
    <HotelContext.Provider value={value}>
      {children}
    </HotelContext.Provider>
  );
};