import { Response } from 'express';
import { Booking } from '@/models/Booking';
import { Room } from '@/models/Room';
import { Hotel } from '@/models/Hotel';
import { ApiResponse, AuthenticatedRequest } from '@/types';
import { asyncHandler } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';
import { getSocketService } from '@/services/socketService';

export const createBooking = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user!._id;
  const { roomId, checkIn, checkOut, guests, specialRequests } = req.body;

  // Get room and hotel information
  const room = await Room.findById(roomId).populate('hotelId');
  if (!room) {
    res.status(404).json({
      success: false,
      message: 'Room not found'
    } as ApiResponse);
    return;
  }

  if (!room.isAvailable) {
    res.status(400).json({
      success: false,
      message: 'Room is not available'
    } as ApiResponse);
    return;
  }

  const hotel = room.hotelId as any;
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  // Validate dates
  if (checkInDate >= checkOutDate) {
    res.status(400).json({
      success: false,
      message: 'Check-out date must be after check-in date'
    } as ApiResponse);
    return;
  }

  if (checkInDate < new Date()) {
    res.status(400).json({
      success: false,
      message: 'Check-in date cannot be in the past'
    } as ApiResponse);
    return;
  }

  // Check for overlapping bookings
  const overlappingBooking = await Booking.findOne({
    roomId,
    status: { $in: ['pending', 'confirmed'] },
    $or: [
      {
        checkIn: { $lt: checkOutDate },
        checkOut: { $gt: checkInDate }
      }
    ]
  });

  if (overlappingBooking) {
    res.status(400).json({
      success: false,
      message: 'Room is already booked for the selected dates'
    } as ApiResponse);
    return;
  }

  // Check capacity
  if (guests > room.capacity) {
    res.status(400).json({
      success: false,
      message: `Room capacity is ${room.capacity} guests`
    } as ApiResponse);
    return;
  }

  // Calculate total price
  const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
  const totalPrice = nights * room.price;

  const booking = new Booking({
    userId,
    roomId,
    hotelId: hotel._id,
    checkIn: checkInDate,
    checkOut: checkOutDate,
    guests,
    totalPrice,
    specialRequests
  });

  await booking.save();

  // Populate booking data
  await booking.populate([
    { path: 'userId', select: 'name email phone' },
    { path: 'roomId', select: 'name roomNumber type images' },
    { path: 'hotelId', select: 'name address phone email' }
  ]);

  // Emit booking update
  try {
    const socketService = getSocketService();
    socketService.emitBookingUpdate(booking._id.toString(), booking.status);
    socketService.sendNotificationToUser(
      userId.toString(),
      'Booking Created',
      `Your booking at ${hotel.name} has been created successfully`,
      'success'
    );
  } catch (error) {
    logger.warn('Failed to emit booking update:', error);
  }

  logger.info(`New booking created: ${booking._id} by user ${req.user!.email}`);

  res.status(201).json({
    success: true,
    message: 'Booking created successfully',
    data: { booking }
  } as ApiResponse);
});

export const getBookings = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  let filter: any = {};

  // If not admin, only show user's bookings or bookings for their hotels
  if (req.user!.role !== 'admin') {
    if (req.user!.role === 'hotel_owner') {
      // Get hotels owned by the user
      const hotels = await Hotel.find({ ownerId: req.user!._id }).select('_id');
      const hotelIds = hotels.map(hotel => hotel._id);
      filter = {
        $or: [
          { userId: req.user!._id },
          { hotelId: { $in: hotelIds } }
        ]
      };
    } else {
      filter.userId = req.user!._id;
    }
  }

  // Filter by status
  if (req.query.status) {
    filter.status = req.query.status;
  }

  // Filter by date range
  if (req.query.startDate || req.query.endDate) {
    filter.checkIn = {};
    if (req.query.startDate) {
      filter.checkIn.$gte = new Date(req.query.startDate as string);
    }
    if (req.query.endDate) {
      filter.checkIn.$lte = new Date(req.query.endDate as string);
    }
  }

  const bookings = await Booking.find(filter)
    .populate('userId', 'name email phone')
    .populate('roomId', 'name roomNumber type images')
    .populate('hotelId', 'name address phone email images')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Booking.countDocuments(filter);

  res.status(200).json({
    success: true,
    message: 'Bookings retrieved successfully',
    data: { bookings },
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  } as ApiResponse);
});

export const getBookingById = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  const booking = await Booking.findById(id)
    .populate('userId', 'name email phone')
    .populate('roomId', 'name roomNumber type images amenities')
    .populate('hotelId', 'name address phone email images amenities');

  if (!booking) {
    res.status(404).json({
      success: false,
      message: 'Booking not found'
    } as ApiResponse);
    return;
  }

  // Check access permissions
  const hotel = booking.hotelId as any;
  const canAccess = req.user!.role === 'admin' ||
                   booking.userId.toString() === req.user!._id.toString() ||
                   (req.user!.role === 'hotel_owner' && hotel.ownerId.toString() === req.user!._id.toString());

  if (!canAccess) {
    res.status(403).json({
      success: false,
      message: 'Not authorized to view this booking'
    } as ApiResponse);
    return;
  }

  res.status(200).json({
    success: true,
    message: 'Booking retrieved successfully',
    data: { booking }
  } as ApiResponse);
});

export const updateBookingStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { status } = req.body;

  const booking = await Booking.findById(id).populate('hotelId');
  if (!booking) {
    res.status(404).json({
      success: false,
      message: 'Booking not found'
    } as ApiResponse);
    return;
  }

  const hotel = booking.hotelId as any;

  // Check permissions - only hotel owner or admin can update status
  const canUpdate = req.user!.role === 'admin' ||
                   (req.user!.role === 'hotel_owner' && hotel.ownerId.toString() === req.user!._id.toString());

  if (!canUpdate) {
    res.status(403).json({
      success: false,
      message: 'Not authorized to update this booking'
    } as ApiResponse);
    return;
  }

  // Validate status transitions
  const validTransitions: { [key: string]: string[] } = {
    'pending': ['confirmed', 'cancelled'],
    'confirmed': ['completed', 'cancelled'],
    'cancelled': [], // Cannot change from cancelled
    'completed': [] // Cannot change from completed
  };

  if (!validTransitions[booking.status].includes(status)) {
    res.status(400).json({
      success: false,
      message: `Cannot change booking status from ${booking.status} to ${status}`
    } as ApiResponse);
    return;
  }

  const updatedBooking = await Booking.findByIdAndUpdate(
    id,
    { status },
    { new: true }
  ).populate([
    { path: 'userId', select: 'name email phone' },
    { path: 'roomId', select: 'name roomNumber type' },
    { path: 'hotelId', select: 'name address' }
  ]);

  // Emit booking update
  try {
    const socketService = getSocketService();
    socketService.emitBookingUpdate(id, status);
    
    // Send notification to user
    let notificationMessage = '';
    switch (status) {
      case 'confirmed':
        notificationMessage = `Your booking at ${hotel.name} has been confirmed`;
        break;
      case 'cancelled':
        notificationMessage = `Your booking at ${hotel.name} has been cancelled`;
        break;
      case 'completed':
        notificationMessage = `Your stay at ${hotel.name} is complete. Thank you!`;
        break;
    }
    
    if (notificationMessage) {
      socketService.sendNotificationToUser(
        booking.userId.toString(),
        'Booking Update',
        notificationMessage,
        status === 'cancelled' ? 'warning' : 'info'
      );
    }
  } catch (error) {
    logger.warn('Failed to emit booking update:', error);
  }

  logger.info(`Booking status updated: ${id} to ${status} by user ${req.user!.email}`);

  res.status(200).json({
    success: true,
    message: 'Booking status updated successfully',
    data: { booking: updatedBooking }
  } as ApiResponse);
});

export const cancelBooking = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  const booking = await Booking.findById(id);
  if (!booking) {
    res.status(404).json({
      success: false,
      message: 'Booking not found'
    } as ApiResponse);
    return;
  }

  // Check if user owns the booking
  if (booking.userId.toString() !== req.user!._id.toString() && req.user!.role !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'Not authorized to cancel this booking'
    } as ApiResponse);
    return;
  }

  // Check if booking can be cancelled
  if (booking.status === 'cancelled' || booking.status === 'completed') {
    res.status(400).json({
      success: false,
      message: `Cannot cancel booking with status: ${booking.status}`
    } as ApiResponse);
    return;
  }

  // Check cancellation policy (e.g., cannot cancel within 24 hours of check-in)
  const now = new Date();
  const checkInDate = new Date(booking.checkIn);
  const hoursUntilCheckIn = (checkInDate.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (hoursUntilCheckIn < 24) {
    res.status(400).json({
      success: false,
      message: 'Cannot cancel booking within 24 hours of check-in'
    } as ApiResponse);
    return;
  }

  const updatedBooking = await Booking.findByIdAndUpdate(
    id,
    { status: 'cancelled' },
    { new: true }
  ).populate([
    { path: 'userId', select: 'name email phone' },
    { path: 'roomId', select: 'name roomNumber type' },
    { path: 'hotelId', select: 'name address' }
  ]);

  // Emit booking update
  try {
    const socketService = getSocketService();
    socketService.emitBookingUpdate(id, 'cancelled');
    socketService.sendNotificationToUser(
      booking.userId.toString(),
      'Booking Cancelled',
      'Your booking has been cancelled successfully',
      'info'
    );
  } catch (error) {
    logger.warn('Failed to emit booking update:', error);
  }

  logger.info(`Booking cancelled: ${id} by user ${req.user!.email}`);

  res.status(200).json({
    success: true,
    message: 'Booking cancelled successfully',
    data: { booking: updatedBooking }
  } as ApiResponse);
});

export const getUserBookings = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user!._id;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const filter: any = { userId };

  // Filter by status
  if (req.query.status) {
    filter.status = req.query.status;
  }

  const bookings = await Booking.find(filter)
    .populate('roomId', 'name roomNumber type images')
    .populate('hotelId', 'name address phone email images')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Booking.countDocuments(filter);

  res.status(200).json({
    success: true,
    message: 'User bookings retrieved successfully',
    data: { bookings },
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  } as ApiResponse);
});