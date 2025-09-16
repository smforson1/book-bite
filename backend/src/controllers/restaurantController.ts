import { Response } from 'express';
import { Restaurant } from '@/models/Restaurant';
import { MenuItem } from '@/models/MenuItem';
import { ApiResponse, AuthenticatedRequest } from '@/types';
import { asyncHandler } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';
import { uploadMultipleImages } from '@/config/cloudinary';

export const createRestaurant = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user!._id;
  const { 
    name, description, address, phone, email, cuisine, 
    deliveryTime, deliveryFee, minimumOrder, region, city, location, operatingHours 
  } = req.body;

  // Check if user is restaurant owner or admin
  if (req.user!.role !== 'restaurant_owner' && req.user!.role !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'Only restaurant owners can create restaurants'
    } as ApiResponse);
    return;
  }

  // Handle image uploads
  let images: string[] = [];
  if (req.files && Array.isArray(req.files)) {
    images = await uploadMultipleImages(req.files, 'restaurants');
  }

  const restaurant = new Restaurant({
    name,
    description,
    address,
    phone,
    email,
    images,
    cuisine: cuisine || [],
    ownerId: userId,
    deliveryTime,
    deliveryFee,
    minimumOrder,
    region,
    city,
    location: {
      type: 'Point',
      coordinates: location.coordinates
    },
    operatingHours: operatingHours || {}
  });

  await restaurant.save();

  logger.info(`New restaurant created: ${name} by user ${req.user!.email}`);

  res.status(201).json({
    success: true,
    message: 'Restaurant created successfully',
    data: { restaurant }
  } as ApiResponse);
});

export const getRestaurants = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

  // Filter by cuisine
  if (req.query.cuisine) {
    const cuisines = (req.query.cuisine as string).split(',');
    filter.cuisine = { $in: cuisines };
  }

  // Filter by rating
  if (req.query.minRating) {
    filter.rating = { $gte: parseFloat(req.query.minRating as string) };
  }

  // Filter by delivery fee
  if (req.query.maxDeliveryFee) {
    filter.deliveryFee = { $lte: parseFloat(req.query.maxDeliveryFee as string) };
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

  const restaurants = await Restaurant.find(filter)
    .populate('ownerId', 'name email phone')
    .sort({ rating: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Restaurant.countDocuments(filter);

  res.status(200).json({
    success: true,
    message: 'Restaurants retrieved successfully',
    data: { restaurants },
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  } as ApiResponse);
});

export const getRestaurantById = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  const restaurant = await Restaurant.findById(id)
    .populate('ownerId', 'name email phone')
    .populate('menuItems');

  if (!restaurant) {
    res.status(404).json({
      success: false,
      message: 'Restaurant not found'
    } as ApiResponse);
    return;
  }

  res.status(200).json({
    success: true,
    message: 'Restaurant retrieved successfully',
    data: { restaurant }
  } as ApiResponse);
});

export const updateRestaurant = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const userId = req.user!._id;

  const restaurant = await Restaurant.findById(id);
  if (!restaurant) {
    res.status(404).json({
      success: false,
      message: 'Restaurant not found'
    } as ApiResponse);
    return;
  }

  // Check ownership or admin role
  if (restaurant.ownerId.toString() !== userId.toString() && req.user!.role !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'Not authorized to update this restaurant'
    } as ApiResponse);
    return;
  }

  // Handle new image uploads
  let newImages: string[] = [];
  if (req.files && Array.isArray(req.files)) {
    newImages = await uploadMultipleImages(req.files, 'restaurants');
  }

  const updateData = { ...req.body };
  if (newImages.length > 0) {
    updateData.images = [...restaurant.images, ...newImages];
  }

  const updatedRestaurant = await Restaurant.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  ).populate('ownerId', 'name email phone');

  logger.info(`Restaurant updated: ${updatedRestaurant!.name} by user ${req.user!.email}`);

  res.status(200).json({
    success: true,
    message: 'Restaurant updated successfully',
    data: { restaurant: updatedRestaurant }
  } as ApiResponse);
});

export const deleteRestaurant = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const userId = req.user!._id;

  const restaurant = await Restaurant.findById(id);
  if (!restaurant) {
    res.status(404).json({
      success: false,
      message: 'Restaurant not found'
    } as ApiResponse);
    return;
  }

  // Check ownership or admin role
  if (restaurant.ownerId.toString() !== userId.toString() && req.user!.role !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'Not authorized to delete this restaurant'
    } as ApiResponse);
    return;
  }

  // Soft delete by setting isActive to false
  await Restaurant.findByIdAndUpdate(id, { isActive: false });

  logger.info(`Restaurant deleted: ${restaurant.name} by user ${req.user!.email}`);

  res.status(200).json({
    success: true,
    message: 'Restaurant deleted successfully'
  } as ApiResponse);
});

export const getMyRestaurants = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user!._id;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const restaurants = await Restaurant.find({ ownerId: userId })
    .populate('menuItems')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Restaurant.countDocuments({ ownerId: userId });

  res.status(200).json({
    success: true,
    message: 'My restaurants retrieved successfully',
    data: { restaurants },
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  } as ApiResponse);
});

export const getRestaurantMenu = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { restaurantId } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  // Check if restaurant exists
  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) {
    res.status(404).json({
      success: false,
      message: 'Restaurant not found'
    } as ApiResponse);
    return;
  }

  const filter: any = { restaurantId };

  // Filter by availability
  if (req.query.available !== undefined) {
    filter.isAvailable = req.query.available === 'true';
  }

  // Filter by category
  if (req.query.category) {
    filter.category = new RegExp(req.query.category as string, 'i');
  }

  // Search by name or description
  if (req.query.q) {
    filter.$text = { $search: req.query.q };
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

  const menuItems = await MenuItem.find(filter)
    .populate('restaurantId', 'name deliveryTime deliveryFee')
    .sort({ category: 1, name: 1 })
    .skip(skip)
    .limit(limit);

  const total = await MenuItem.countDocuments(filter);

  res.status(200).json({
    success: true,
    message: 'Restaurant menu retrieved successfully',
    data: { menuItems },
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  } as ApiResponse);
});

export const getNearbyRestaurants = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

  const restaurants = await Restaurant.find({
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
    message: 'Nearby restaurants retrieved successfully',
    data: { restaurants }
  } as ApiResponse);
});