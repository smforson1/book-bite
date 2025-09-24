import { Response } from 'express';
import { Order } from '@/models/Order';
import { MenuItem } from '@/models/MenuItem';
import { Restaurant } from '@/models/Restaurant';
import { ApiResponse, AuthenticatedRequest } from '@/types';
import { asyncHandler } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';
import { getSocketService } from '@/services/socketService';
import { notificationService, NotificationService } from '@/services/notificationService';

export const createOrder = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user!._id;
  const { 
    restaurantId, 
    items, 
    deliveryAddress, 
    deliveryCoordinates, 
    deliveryInstructions 
  } = req.body;

  // Validate restaurant exists and is active
  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant || !restaurant.isActive) {
    res.status(404).json({
      success: false,
      message: 'Restaurant not found or inactive'
    } as ApiResponse);
    return;
  }

  // Validate menu items and calculate total
  let totalPrice = 0;
  const validatedItems = [];

  for (const item of items) {
    const menuItem = await MenuItem.findById(item.menuItemId);
    if (!menuItem || !menuItem.isAvailable) {
      res.status(400).json({
        success: false,
        message: `Menu item ${item.menuItemId} is not available`
      } as ApiResponse);
      return;
    }

    if (menuItem.restaurantId.toString() !== restaurantId) {
      res.status(400).json({
        success: false,
        message: 'All items must be from the same restaurant'
      } as ApiResponse);
      return;
    }

    const itemTotal = menuItem.price * item.quantity;
    totalPrice += itemTotal;

    validatedItems.push({
      menuItemId: item.menuItemId,
      quantity: item.quantity,
      price: menuItem.price,
      specialInstructions: item.specialInstructions
    });
  }

  // Add delivery fee
  totalPrice += restaurant.deliveryFee;

  // Check minimum order amount
  if (totalPrice < restaurant.minimumOrder) {
    res.status(400).json({
      success: false,
      message: `Minimum order amount is GH₵${restaurant.minimumOrder.toFixed(2)}`
    } as ApiResponse);
    return;
  }

  // Calculate estimated delivery time
  const now = new Date();
  const deliveryTimeMinutes = parseInt(restaurant.deliveryTime.match(/\d+/)?.[0] || '30');
  const estimatedDeliveryTime = new Date(now.getTime() + deliveryTimeMinutes * 60000);

  const order = new Order({
    userId,
    restaurantId,
    items: validatedItems,
    totalPrice,
    deliveryAddress,
    deliveryCoordinates,
    deliveryInstructions,
    estimatedDeliveryTime
  });

  await order.save();

  // Populate order data
  await order.populate([
    { path: 'userId', select: 'name email phone' },
    { path: 'restaurantId', select: 'name address phone email deliveryFee' },
    { path: 'items.menuItemId', select: 'name price images' }
  ]);

  // Emit order update and send push notifications
  try {
    const socketService = getSocketService();
    socketService.emitOrderUpdate(order._id.toString(), order.status, order.estimatedDeliveryTime);
    socketService.sendNotificationToUser(
      userId.toString(),
      'Order Placed',
      `Your order from ${restaurant.name} has been placed successfully`,
      'success'
    );

    // Send push notification to user
    await notificationService.sendToUser(userId.toString(), {
      title: 'Order Placed! 🛒',
      body: `Your order from ${restaurant.name} has been placed successfully`,
      data: { type: 'order_update', orderId: order._id.toString(), status: 'pending' },
      channelId: 'orders'
    });

    // Notify restaurant owner
    socketService.sendNotificationToUser(
      restaurant.ownerId.toString(),
      'New Order',
      `New order received from ${req.user!.name}`,
      'info'
    );

    // Send push notification to restaurant owner
    await notificationService.sendToUser(restaurant.ownerId.toString(), {
      title: 'New Order! 📋',
      body: `New order received from ${req.user!.name}`,
      data: { type: 'new_order', orderId: order._id.toString() },
      channelId: 'orders'
    });
  } catch (error) {
    logger.warn('Failed to emit order update:', error);
  }

  logger.info(`New order created: ${order._id} by user ${req.user!.email}`);

  res.status(201).json({
    success: true,
    message: 'Order created successfully',
    data: { order }
  } as ApiResponse);
});

export const getOrders = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  let filter: any = {};

  // If not admin, only show user's orders or orders for their restaurants
  if (req.user!.role !== 'admin') {
    if (req.user!.role === 'restaurant_owner') {
      // Get restaurants owned by the user
      const restaurants = await Restaurant.find({ ownerId: req.user!._id }).select('_id');
      const restaurantIds = restaurants.map(restaurant => restaurant._id);
      filter = {
        $or: [
          { userId: req.user!._id },
          { restaurantId: { $in: restaurantIds } }
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
    filter.createdAt = {};
    if (req.query.startDate) {
      filter.createdAt.$gte = new Date(req.query.startDate as string);
    }
    if (req.query.endDate) {
      filter.createdAt.$lte = new Date(req.query.endDate as string);
    }
  }

  const orders = await Order.find(filter)
    .populate('userId', 'name email phone')
    .populate('restaurantId', 'name address phone email images deliveryFee')
    .populate('items.menuItemId', 'name price images')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Order.countDocuments(filter);

  res.status(200).json({
    success: true,
    message: 'Orders retrieved successfully',
    data: { orders },
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  } as ApiResponse);
});

export const getOrderById = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  const order = await Order.findById(id)
    .populate('userId', 'name email phone')
    .populate('restaurantId', 'name address phone email images deliveryFee')
    .populate('items.menuItemId', 'name price images description')
    .populate('driverId', 'name phone');

  if (!order) {
    res.status(404).json({
      success: false,
      message: 'Order not found'
    } as ApiResponse);
    return;
  }

  // Check access permissions
  const restaurant = order.restaurantId as any;
  const canAccess = req.user!.role === 'admin' ||
                   order.userId.toString() === req.user!._id.toString() ||
                   (req.user!.role === 'restaurant_owner' && restaurant.ownerId.toString() === req.user!._id.toString());

  if (!canAccess) {
    res.status(403).json({
      success: false,
      message: 'Not authorized to view this order'
    } as ApiResponse);
    return;
  }

  res.status(200).json({
    success: true,
    message: 'Order retrieved successfully',
    data: { order }
  } as ApiResponse);
});

export const updateOrderStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { status } = req.body;

  const order = await Order.findById(id).populate('restaurantId');
  if (!order) {
    res.status(404).json({
      success: false,
      message: 'Order not found'
    } as ApiResponse);
    return;
  }

  const restaurant = order.restaurantId as any;

  // Check permissions - only restaurant owner or admin can update status
  const canUpdate = req.user!.role === 'admin' ||
                   (req.user!.role === 'restaurant_owner' && restaurant.ownerId.toString() === req.user!._id.toString());

  if (!canUpdate) {
    res.status(403).json({
      success: false,
      message: 'Not authorized to update this order'
    } as ApiResponse);
    return;
  }

  // Validate status transitions
  const validTransitions: { [key: string]: string[] } = {
    'pending': ['confirmed', 'cancelled'],
    'confirmed': ['preparing', 'cancelled'],
    'preparing': ['ready', 'cancelled'],
    'ready': ['picked_up', 'cancelled'],
    'picked_up': ['on_the_way'],
    'on_the_way': ['delivered'],
    'delivered': [], // Cannot change from delivered
    'cancelled': [] // Cannot change from cancelled
  };

  if (!validTransitions[order.status].includes(status)) {
    res.status(400).json({
      success: false,
      message: `Cannot change order status from ${order.status} to ${status}`
    } as ApiResponse);
    return;
  }

  // Update actual delivery time if delivered
  const updateData: any = { status };
  if (status === 'delivered') {
    updateData.actualDeliveryTime = new Date();
  }

  const updatedOrder = await Order.findByIdAndUpdate(
    id,
    updateData,
    { new: true }
  ).populate([
    { path: 'userId', select: 'name email phone' },
    { path: 'restaurantId', select: 'name address' },
    { path: 'items.menuItemId', select: 'name price' }
  ]);

  // Emit order update and send push notifications
  try {
    const socketService = getSocketService();
    socketService.emitOrderUpdate(id, status, updatedOrder!.estimatedDeliveryTime);
    
    // Send notification to user
    let notificationMessage = '';
    let pushNotification;
    
    switch (status) {
      case 'confirmed':
        notificationMessage = `Your order from ${restaurant.name} has been confirmed`;
        pushNotification = NotificationService.templates.orderConfirmed(restaurant.name);
        break;
      case 'preparing':
        notificationMessage = `Your order is being prepared`;
        pushNotification = {
          title: 'Order Being Prepared! 👨‍🍳',
          body: 'Your order is being prepared with care',
          data: { type: 'order_update', orderId: id, status },
          channelId: 'orders'
        };
        break;
      case 'ready':
        notificationMessage = `Your order is ready for pickup`;
        pushNotification = NotificationService.templates.orderReady(restaurant.name);
        break;
      case 'picked_up':
        notificationMessage = `Your order has been picked up and is on the way`;
        pushNotification = {
          title: 'Order On The Way! 🚗',
          body: 'Your order has been picked up and is on the way',
          data: { type: 'order_update', orderId: id, status },
          channelId: 'orders'
        };
        break;
      case 'on_the_way':
        notificationMessage = `Your order is on the way`;
        pushNotification = {
          title: 'Order On The Way! 🚗',
          body: 'Your order is on the way to you',
          data: { type: 'order_update', orderId: id, status },
          channelId: 'orders'
        };
        break;
      case 'delivered':
        notificationMessage = `Your order has been delivered. Enjoy your meal!`;
        pushNotification = NotificationService.templates.orderDelivered();
        break;
      case 'cancelled':
        notificationMessage = `Your order from ${restaurant.name} has been cancelled`;
        pushNotification = {
          title: 'Order Cancelled ❌',
          body: `Your order from ${restaurant.name} has been cancelled`,
          data: { type: 'order_update', orderId: id, status },
          channelId: 'orders'
        };
        break;
    }
    
    if (notificationMessage) {
      socketService.sendNotificationToUser(
        order.userId.toString(),
        'Order Update',
        notificationMessage,
        status === 'cancelled' ? 'warning' : status === 'delivered' ? 'success' : 'info'
      );

      // Send push notification
      if (pushNotification) {
        await notificationService.sendToUser(order.userId.toString(), pushNotification);
      }
    }
  } catch (error) {
    logger.warn('Failed to emit order update:', error);
  }

  logger.info(`Order status updated: ${id} to ${status} by user ${req.user!.email}`);

  res.status(200).json({
    success: true,
    message: 'Order status updated successfully',
    data: { order: updatedOrder }
  } as ApiResponse);
});

export const cancelOrder = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  const order = await Order.findById(id);
  if (!order) {
    res.status(404).json({
      success: false,
      message: 'Order not found'
    } as ApiResponse);
    return;
  }

  // Check if user owns the order
  if (order.userId.toString() !== req.user!._id.toString() && req.user!.role !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'Not authorized to cancel this order'
    } as ApiResponse);
    return;
  }

  // Check if order can be cancelled
  if (order.status === 'cancelled' || order.status === 'delivered') {
    res.status(400).json({
      success: false,
      message: `Cannot cancel order with status: ${order.status}`
    } as ApiResponse);
    return;
  }

  // Check cancellation policy (e.g., cannot cancel after preparing)
  if (['preparing', 'ready', 'picked_up', 'on_the_way'].includes(order.status)) {
    res.status(400).json({
      success: false,
      message: 'Cannot cancel order that is already being prepared or delivered'
    } as ApiResponse);
    return;
  }

  const updatedOrder = await Order.findByIdAndUpdate(
    id,
    { status: 'cancelled' },
    { new: true }
  ).populate([
    { path: 'userId', select: 'name email phone' },
    { path: 'restaurantId', select: 'name address' },
    { path: 'items.menuItemId', select: 'name price' }
  ]);

  // Emit order update
  try {
    const socketService = getSocketService();
    socketService.emitOrderUpdate(id, 'cancelled');
    socketService.sendNotificationToUser(
      order.userId.toString(),
      'Order Cancelled',
      'Your order has been cancelled successfully',
      'info'
    );
  } catch (error) {
    logger.warn('Failed to emit order update:', error);
  }

  logger.info(`Order cancelled: ${id} by user ${req.user!.email}`);

  res.status(200).json({
    success: true,
    message: 'Order cancelled successfully',
    data: { order: updatedOrder }
  } as ApiResponse);
});

export const getUserOrders = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user!._id;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const filter: any = { userId };

  // Filter by status
  if (req.query.status) {
    filter.status = req.query.status;
  }

  const orders = await Order.find(filter)
    .populate('restaurantId', 'name address phone email images deliveryFee')
    .populate('items.menuItemId', 'name price images')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Order.countDocuments(filter);

  res.status(200).json({
    success: true,
    message: 'User orders retrieved successfully',
    data: { orders },
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  } as ApiResponse);
});

export const getRestaurantOrders = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const ownerId = req.user!._id;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  // Get restaurants owned by the user
  const restaurants = await Restaurant.find({ ownerId }).select('_id');
  const restaurantIds = restaurants.map(restaurant => restaurant._id);

  const filter: any = { restaurantId: { $in: restaurantIds } };

  // Filter by status
  if (req.query.status) {
    filter.status = req.query.status;
  }

  const orders = await Order.find(filter)
    .populate('userId', 'name email phone')
    .populate('restaurantId', 'name address')
    .populate('items.menuItemId', 'name price images')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Order.countDocuments(filter);

  res.status(200).json({
    success: true,
    message: 'Restaurant orders retrieved successfully',
    data: { orders },
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  } as ApiResponse);
});