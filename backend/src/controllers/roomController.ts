import { Response } from 'express';
import { Room } from '@/models/Room';
import { Hotel } from '@/models/Hotel';
import { ApiResponse, AuthenticatedRequest } from '@/types';
import { asyncHandler } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';
import { uploadMultipleImages } from '@/config/cloudinary';
import { getSocketService } from '@/services/socketService';

export const createRoom = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { hotelId, name, description, price, capacity, amenities, roomNumber, type } = req.body;

  // Check if hotel exists and user owns it
  const hotel = await Hotel.findById(hotelId);
  if (!hotel) {
    res.status(404).json({
      success: false,
      message: 'Hotel not found'
    } as ApiResponse);
    return;
  }

  // Check ownership or admin role
  if (hotel.ownerId.toString() !== req.user!._id.toString() && req.user!.role !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'Not authorized to add rooms to this hotel'
    } as ApiResponse);
    return;
  }

  // Check if room number already exists in this hotel
  const existingRoom = await Room.findOne({ hotelId, roomNumber });
  if (existingRoom) {
    res.status(400).json({
      success: false,
      message: 'Room number already exists in this hotel'
    } as ApiResponse);
    return;
  }

  // Handle image uploads
  let images: string[] = [];
  if (req.files && Array.isArray(req.files)) {
    images = await uploadMultipleImages(req.files, 'rooms');
  }

  const room = new Room({
    hotelId,
    name,
    description,
    price,
    capacity,
    amenities: amenities || [],
    images,
    roomNumber,
    type
  });

  await room.save();

  // Populate hotel information
  await room.populate('hotelId', 'name address');

  logger.info(`New room created: ${name} in hotel ${hotel.name} by user ${req.user!.email}`);

  res.status(201).json({
    success: true,
    message: 'Room created successfully',
    data: { room }
  } as ApiResponse);
});

export const getRoomById = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  const room = await Room.findById(id)
    .populate('hotelId', 'name address phone email images amenities rating');

  if (!room) {
    res.status(404).json({
      success: false,
      message: 'Room not found'
    } as ApiResponse);
    return;
  }

  res.status(200).json({
    success: true,
    message: 'Room retrieved successfully',
    data: { room }
  } as ApiResponse);
});

export const updateRoom = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  const room = await Room.findById(id).populate('hotelId');
  if (!room) {
    res.status(404).json({
      success: false,
      message: 'Room not found'
    } as ApiResponse);
    return;
  }

  const hotel = room.hotelId as any;

  // Check ownership or admin role
  if (hotel.ownerId.toString() !== req.user!._id.toString() && req.user!.role !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'Not authorized to update this room'
    } as ApiResponse);
    return;
  }

  // Handle new image uploads
  let newImages: string[] = [];
  if (req.files && Array.isArray(req.files)) {
    newImages = await uploadMultipleImages(req.files, 'rooms');
  }

  const updateData = { ...req.body };
  if (newImages.length > 0) {
    updateData.images = [...room.images, ...newImages];
  }

  // Check if room number is being changed and if it conflicts
  if (updateData.roomNumber && updateData.roomNumber !== room.roomNumber) {
    const existingRoom = await Room.findOne({ 
      hotelId: room.hotelId, 
      roomNumber: updateData.roomNumber,
      _id: { $ne: id }
    });
    
    if (existingRoom) {
      res.status(400).json({
        success: false,
        message: 'Room number already exists in this hotel'
      } as ApiResponse);
      return;
    }
  }

  const updatedRoom = await Room.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  ).populate('hotelId', 'name address');

  // Emit room update if availability changed
  if (updateData.isAvailable !== undefined && updateData.isAvailable !== room.isAvailable) {
    try {
      const socketService = getSocketService();
      socketService.emitRoomUpdate(room.hotelId.toString(), id, updateData.isAvailable);
    } catch (error) {
      logger.warn('Failed to emit room update:', error);
    }
  }

  logger.info(`Room updated: ${updatedRoom!.name} by user ${req.user!.email}`);

  res.status(200).json({
    success: true,
    message: 'Room updated successfully',
    data: { room: updatedRoom }
  } as ApiResponse);
});

export const deleteRoom = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  const room = await Room.findById(id).populate('hotelId');
  if (!room) {
    res.status(404).json({
      success: false,
      message: 'Room not found'
    } as ApiResponse);
    return;
  }

  const hotel = room.hotelId as any;

  // Check ownership or admin role
  if (hotel.ownerId.toString() !== req.user!._id.toString() && req.user!.role !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'Not authorized to delete this room'
    } as ApiResponse);
    return;
  }

  await Room.findByIdAndDelete(id);

  logger.info(`Room deleted: ${room.name} by user ${req.user!.email}`);

  res.status(200).json({
    success: true,
    message: 'Room deleted successfully'
  } as ApiResponse);
});

export const getMyRooms = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user!._id;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  // First get hotels owned by the user
  const hotels = await Hotel.find({ ownerId: userId }).select('_id');
  const hotelIds = hotels.map(hotel => hotel._id);

  const rooms = await Room.find({ hotelId: { $in: hotelIds } })
    .populate('hotelId', 'name address')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Room.countDocuments({ hotelId: { $in: hotelIds } });

  res.status(200).json({
    success: true,
    message: 'My rooms retrieved successfully',
    data: { rooms },
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  } as ApiResponse);
});

export const checkRoomAvailability = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { checkIn, checkOut } = req.query;

  if (!checkIn || !checkOut) {
    res.status(400).json({
      success: false,
      message: 'Check-in and check-out dates are required'
    } as ApiResponse);
    return;
  }

  const room = await Room.findById(id);
  if (!room) {
    res.status(404).json({
      success: false,
      message: 'Room not found'
    } as ApiResponse);
    return;
  }

  // Check if room is generally available
  if (!room.isAvailable) {
    res.status(200).json({
      success: true,
      message: 'Room availability checked',
      data: { 
        available: false,
        reason: 'Room is currently unavailable'
      }
    } as ApiResponse);
    return;
  }

  // Import Booking model here to avoid circular dependency
  const { Booking } = await import('@/models/Booking');

  const checkInDate = new Date(checkIn as string);
  const checkOutDate = new Date(checkOut as string);

  // Check for overlapping bookings
  const overlappingBooking = await Booking.findOne({
    roomId: id,
    status: { $in: ['pending', 'confirmed'] },
    $or: [
      {
        checkIn: { $lt: checkOutDate },
        checkOut: { $gt: checkInDate }
      }
    ]
  });

  const isAvailable = !overlappingBooking;

  res.status(200).json({
    success: true,
    message: 'Room availability checked',
    data: { 
      available: isAvailable,
      reason: isAvailable ? null : 'Room is already booked for the selected dates'
    }
  } as ApiResponse);
});

export const updateRoomAvailability = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { isAvailable } = req.body;

  const room = await Room.findById(id).populate('hotelId');
  if (!room) {
    res.status(404).json({
      success: false,
      message: 'Room not found'
    } as ApiResponse);
    return;
  }

  const hotel = room.hotelId as any;

  // Check ownership or admin role
  if (hotel.ownerId.toString() !== req.user!._id.toString() && req.user!.role !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'Not authorized to update this room'
    } as ApiResponse);
    return;
  }

  const updatedRoom = await Room.findByIdAndUpdate(
    id,
    { isAvailable },
    { new: true }
  ).populate('hotelId', 'name address');

  // Emit room update
  try {
    const socketService = getSocketService();
    socketService.emitRoomUpdate(room.hotelId.toString(), id, isAvailable);
  } catch (error) {
    logger.warn('Failed to emit room update:', error);
  }

  logger.info(`Room availability updated: ${room.name} - ${isAvailable ? 'Available' : 'Unavailable'} by user ${req.user!.email}`);

  res.status(200).json({
    success: true,
    message: 'Room availability updated successfully',
    data: { room: updatedRoom }
  } as ApiResponse);
});