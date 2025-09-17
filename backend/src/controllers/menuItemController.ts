import { Response } from 'express';
import { MenuItem } from '@/models/MenuItem';
import { Restaurant } from '@/models/Restaurant';
import { ApiResponse, AuthenticatedRequest } from '@/types';
import { asyncHandler } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';
import { uploadMultipleImages } from '@/config/cloudinary';
import { getSocketService } from '@/services/socketService';

export const createMenuItem = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user!._id;
  const { 
    restaurantId, name, description, price, category, 
    ingredients, allergens, preparationTime, nutritionalInfo 
  } = req.body;

  // Check if restaurant exists and user owns it
  const restaurant = await Restaurant.findById(restaurantId);
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
      message: 'Not authorized to add menu items to this restaurant'
    } as ApiResponse);
    return;
  }

  // Handle image uploads
  let images: string[] = [];
  if (req.files && Array.isArray(req.files)) {
    images = await uploadMultipleImages(req.files, 'menu-items');
  }

  const menuItem = new MenuItem({
    restaurantId,
    name,
    description,
    price,
    category,
    images,
    ingredients: ingredients || [],
    allergens: allergens || [],
    preparationTime,
    nutritionalInfo
  });

  await menuItem.save();

  // Populate restaurant information
  await menuItem.populate('restaurantId', 'name deliveryTime deliveryFee');

  logger.info(`New menu item created: ${name} for restaurant ${restaurant.name} by user ${req.user!.email}`);

  res.status(201).json({
    success: true,
    message: 'Menu item created successfully',
    data: { menuItem }
  } as ApiResponse);
});

export const getMenuItemById = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  const menuItem = await MenuItem.findById(id)
    .populate('restaurantId', 'name deliveryTime deliveryFee address phone');

  if (!menuItem) {
    res.status(404).json({
      success: false,
      message: 'Menu item not found'
    } as ApiResponse);
    return;
  }

  res.status(200).json({
    success: true,
    message: 'Menu item retrieved successfully',
    data: { menuItem }
  } as ApiResponse);
});

export const updateMenuItem = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  const menuItem = await MenuItem.findById(id).populate('restaurantId');
  if (!menuItem) {
    res.status(404).json({
      success: false,
      message: 'Menu item not found'
    } as ApiResponse);
    return;
  }

  const restaurant = menuItem.restaurantId as any;

  // Check ownership or admin role
  if (restaurant.ownerId.toString() !== req.user!._id.toString() && req.user!.role !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'Not authorized to update this menu item'
    } as ApiResponse);
    return;
  }

  // Handle new image uploads
  let newImages: string[] = [];
  if (req.files && Array.isArray(req.files)) {
    newImages = await uploadMultipleImages(req.files, 'menu-items');
  }

  const updateData = { ...req.body };
  if (newImages.length > 0) {
    updateData.images = [...menuItem.images, ...newImages];
  }

  const updatedMenuItem = await MenuItem.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  ).populate('restaurantId', 'name deliveryTime deliveryFee');

  // Emit menu update if availability changed
  if (updateData.isAvailable !== undefined && updateData.isAvailable !== menuItem.isAvailable) {
    try {
      const socketService = getSocketService();
      socketService.emitMenuUpdate(restaurant._id.toString(), id, updateData.isAvailable);
    } catch (error) {
      logger.warn('Failed to emit menu update:', error);
    }
  }

  logger.info(`Menu item updated: ${updatedMenuItem!.name} by user ${req.user!.email}`);

  res.status(200).json({
    success: true,
    message: 'Menu item updated successfully',
    data: { menuItem: updatedMenuItem }
  } as ApiResponse);
});

export const deleteMenuItem = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  const menuItem = await MenuItem.findById(id).populate('restaurantId');
  if (!menuItem) {
    res.status(404).json({
      success: false,
      message: 'Menu item not found'
    } as ApiResponse);
    return;
  }

  const restaurant = menuItem.restaurantId as any;

  // Check ownership or admin role
  if (restaurant.ownerId.toString() !== req.user!._id.toString() && req.user!.role !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'Not authorized to delete this menu item'
    } as ApiResponse);
    return;
  }

  await MenuItem.findByIdAndDelete(id);

  logger.info(`Menu item deleted: ${menuItem.name} by user ${req.user!.email}`);

  res.status(200).json({
    success: true,
    message: 'Menu item deleted successfully'
  } as ApiResponse);
});

export const getMyMenuItems = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user!._id;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  // First get restaurants owned by the user
  const restaurants = await Restaurant.find({ ownerId: userId }).select('_id');
  const restaurantIds = restaurants.map(restaurant => restaurant._id);

  const menuItems = await MenuItem.find({ restaurantId: { $in: restaurantIds } })
    .populate('restaurantId', 'name address')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await MenuItem.countDocuments({ restaurantId: { $in: restaurantIds } });

  res.status(200).json({
    success: true,
    message: 'My menu items retrieved successfully',
    data: { menuItems },
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  } as ApiResponse);
});

export const updateMenuItemAvailability = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { isAvailable } = req.body;

  const menuItem = await MenuItem.findById(id).populate('restaurantId');
  if (!menuItem) {
    res.status(404).json({
      success: false,
      message: 'Menu item not found'
    } as ApiResponse);
    return;
  }

  const restaurant = menuItem.restaurantId as any;

  // Check ownership or admin role
  if (restaurant.ownerId.toString() !== req.user!._id.toString() && req.user!.role !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'Not authorized to update this menu item'
    } as ApiResponse);
    return;
  }

  const updatedMenuItem = await MenuItem.findByIdAndUpdate(
    id,
    { isAvailable },
    { new: true }
  ).populate('restaurantId', 'name address');

  // Emit menu update
  try {
    const socketService = getSocketService();
    socketService.emitMenuUpdate(restaurant._id.toString(), id, isAvailable);
  } catch (error) {
    logger.warn('Failed to emit menu update:', error);
  }

  logger.info(`Menu item availability updated: ${menuItem.name} - ${isAvailable ? 'Available' : 'Unavailable'} by user ${req.user!.email}`);

  res.status(200).json({
    success: true,
    message: 'Menu item availability updated successfully',
    data: { menuItem: updatedMenuItem }
  } as ApiResponse);
});