import { Response } from 'express';
import { Hotel } from '@/models/Hotel';
import { Room } from '@/models/Room';
import { ApiResponse, AuthenticatedRequest, SearchFilters } from '@/types';
import { asyncHandler } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';
import { uploadMultipleImages } from '@/config/cloudinary';

export const createHotel = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user!._id;
  const { name, description, address, phone, email, amenities, region, city, location } = req.body;

  // Check if user is hotel owner or admin
  if (req.user!.role !== 'hotel_owner' && req.user!.role !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'Only hotel owners can create hotels'
    } as ApiResponse);
    return;
  }

  // Handle image uploads
  let images: string[] = [];
  if (req.files && Array.isArray(req.files)) {
    images = await uploadMultipleImages(req.files, 'hotels');
  }

  const hotel = new Hotel({
    name,
    description,
    address,
    phone,
    email,
    images,
    amenities: amenities || [],
    ownerId: userId,
    region,
    city,
    location: {
      type: 'Point',
      coordinates: location.coordinates
    }
  });

  await hotel.save();

  logger.info(`New hotel created: ${name} by user ${req.user!.email}`);

  res.status(201).json({
    success: true,
    message: 'Hotel created successfully',
    data: { hotel }
  } as ApiResponse);
});

export const getHotels = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  // Build filter object
  const filter: any = { isActive: true };

  // Search by name or description
  if (req.query.q) {
    filter.$text = { $search: req.query.q };
  }

  // Filter by region
  if (req.query.region) {
    filter.region = req.query.region;
  }

  // Filter by city
  if (req.query.city) {
    filter.city = new RegExp(req.query.city as string, 'i');
  }

  // Filter by amenities
  if (req.query.amenities) {
    const amenities = (req.query.amenities as string).split(',');
    filter.amenities = { $in: amenities };
  }

  // Filter by rating
  if (req.query.minRating) {
    filter.rating = { $gte: parseFloat(req.query.minRating as string) };
  }

  // Location-based search
  if (req.query.lat && req.query.lng) {
    const lat = parseFloat(req.query.lat as string);
    const lng = parseFloat(req.query.lng as string);
    const radius = parseFloat(req.query.radius as string) || 10; // Default 10km

    filter.location = {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [lng, lat]
        },
        $maxDistance: radius * 1000 // Convert km to meters
      }
    };
  }

  const hotels = await Hotel.find(filter)
    .populate('ownerId', 'name email phone')
    .sort({ rating: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Hotel.countDocuments(filter);

  res.status(200).json({
    success: true,
    message: 'Hotels retrieved successfully',
    data: { hotels },
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  } as ApiResponse);
});

export const getHotelById = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  const hotel = await Hotel.findById(id)
    .populate('ownerId', 'name email phone')
    .populate('rooms');

  if (!hotel) {
    res.status(404).json({
      success: false,
      message: 'Hotel not found'
    } as ApiResponse);
    return;
  }

  res.status(200).json({
    success: true,
    message: 'Hotel retrieved successfully',
    data: { hotel }
  } as ApiResponse);
});

export const updateHotel = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const userId = req.user!._id;

  const hotel = await Hotel.findById(id);
  if (!hotel) {
    res.status(404).json({
      success: false,
      message: 'Hotel not found'
    } as ApiResponse);
    return;
  }

  // Check ownership or admin role
  if (hotel.ownerId.toString() !== userId.toString() && req.user!.role !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'Not authorized to update this hotel'
    } as ApiResponse);
    return;
  }

  // Handle new image uploads
  let newImages: string[] = [];
  if (req.files && Array.isArray(req.files)) {
    newImages = await uploadMultipleImages(req.files, 'hotels');
  }

  const updateData = { ...req.body };
  if (newImages.length > 0) {
    updateData.images = [...hotel.images, ...newImages];
  }

  const updatedHotel = await Hotel.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  ).populate('ownerId', 'name email phone');

  logger.info(`Hotel updated: ${updatedHotel!.name} by user ${req.user!.email}`);

  res.status(200).json({
    success: true,
    message: 'Hotel updated successfully',
    data: { hotel: updatedHotel }
  } as ApiResponse);
});

export const deleteHotel = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const userId = req.user!._id;

  const hotel = await Hotel.findById(id);
  if (!hotel) {
    res.status(404).json({
      success: false,
      message: 'Hotel not found'
    } as ApiResponse);
    return;
  }

  // Check ownership or admin role
  if (hotel.ownerId.toString() !== userId.toString() && req.user!.role !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'Not authorized to delete this hotel'
    } as ApiResponse);
    return;
  }

  // Soft delete by setting isActive to false
  await Hotel.findByIdAndUpdate(id, { isActive: false });

  logger.info(`Hotel deleted: ${hotel.name} by user ${req.user!.email}`);

  res.status(200).json({
    success: true,
    message: 'Hotel deleted successfully'
  } as ApiResponse);
});

export const getMyHotels = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user!._id;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const hotels = await Hotel.find({ ownerId: userId })
    .populate('rooms')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Hotel.countDocuments({ ownerId: userId });

  res.status(200).json({
    success: true,
    message: 'My hotels retrieved successfully',
    data: { hotels },
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  } as ApiResponse);
});

export const getHotelRooms = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { hotelId } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  // Check if hotel exists
  const hotel = await Hotel.findById(hotelId);
  if (!hotel) {
    res.status(404).json({
      success: false,
      message: 'Hotel not found'
    } as ApiResponse);
    return;
  }

  const filter: any = { hotelId };

  // Filter by availability
  if (req.query.available !== undefined) {
    filter.isAvailable = req.query.available === 'true';
  }

  // Filter by room type
  if (req.query.type) {
    filter.type = req.query.type;
  }

  // Filter by price range
  if (req.query.minPrice || req.query.maxPrice) {
    filter.price = {};
    if (req.query.minPrice) {
      filter.price.$gte = parseFloat(req.query.minPrice as string);
    }
    if (req.query.maxPrice) {
      filter.price.$lte = parseFloat(req.query.maxPrice as string);
    }
  }

  const rooms = await Room.find(filter)
    .populate('hotelId', 'name address')
    .sort({ price: 1 })
    .skip(skip)
    .limit(limit);

  const total = await Room.countDocuments(filter);

  res.status(200).json({
    success: true,
    message: 'Hotel rooms retrieved successfully',
    data: { rooms },
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  } as ApiResponse);
});

export const getNearbyHotels = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { lat, lng } = req.query;
  const radius = parseFloat(req.query.radius as string) || 10; // Default 10km
  const limit = parseInt(req.query.limit as string) || 20;

  if (!lat || !lng) {
    res.status(400).json({
      success: false,
      message: 'Latitude and longitude are required'
    } as ApiResponse);
    return;
  }

  const hotels = await Hotel.find({
    isActive: true,
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [parseFloat(lng as string), parseFloat(lat as string)]
        },
        $maxDistance: radius * 1000 // Convert km to meters
      }
    }
  })
    .populate('ownerId', 'name email phone')
    .limit(limit);

  res.status(200).json({
    success: true,
    message: 'Nearby hotels retrieved successfully',
    data: { hotels }
  } as ApiResponse);
});