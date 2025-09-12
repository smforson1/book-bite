import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { storageService } from '../services/storageService';
import { Hotel, Room, Booking } from '../types';

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
    return hotels;
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
    const newBooking: Booking = {
      ...bookingData,
      id: Date.now().toString(),
      createdAt: new Date(),
    };

    setBookings(prev => [...prev, newBooking]);
    return newBooking;
  };

  const getUserBookings = (userId: string): Booking[] => {
    return bookings.filter(booking => booking.userId === userId);
  };

  const updateBookingStatus = async (bookingId: string, status: Booking['status']): Promise<boolean> => {
    setBookings(prev =>
      prev.map(booking =>
        booking.id === bookingId ? { ...booking, status } : booking
      )
    );
    return true;
  };

  const cancelBooking = async (bookingId: string): Promise<boolean> => {
    return updateBookingStatus(bookingId, 'cancelled');
  };

  const addHotel = async (hotelData: Omit<Hotel, 'id' | 'createdAt'>): Promise<Hotel> => {
    const newHotel: Hotel = {
      ...hotelData,
      id: Date.now().toString(),
      createdAt: new Date(),
    };

    setHotels(prev => [...prev, newHotel]);
    return newHotel;
  };

  const updateHotel = async (hotelId: string, updates: Partial<Hotel>): Promise<boolean> => {
    setHotels(prev =>
      prev.map(hotel =>
        hotel.id === hotelId ? { ...hotel, ...updates } : hotel
      )
    );
    return true;
  };

  const addRoom = async (roomData: Omit<Room, 'id'>): Promise<Room> => {
    const newRoom: Room = {
      ...roomData,
      id: Date.now().toString(),
    };

    setRooms(prev => [...prev, newRoom]);
    return newRoom;
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