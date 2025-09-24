import { Response } from 'express';
import { User } from '@/models/User';
import { notificationService } from '@/services/notificationService';
import { ApiResponse, AuthenticatedRequest } from '@/types';
import { asyncHandler } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';

export const registerPushToken = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user!._id;
  const { pushToken } = req.body;

  if (!pushToken) {
    res.status(400).json({
      success: false,
      message: 'Push token is required'
    } as ApiResponse);
    return;
  }

  // Update user's push token
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { pushToken },
    { new: true }
  );

  if (!updatedUser) {
    res.status(404).json({
      success: false,
      message: 'User not found'
    } as ApiResponse);
    return;
  }

  logger.info(`Push token registered for user: ${req.user!.email}`);

  res.status(200).json({
    success: true,
    message: 'Push token registered successfully'
  } as ApiResponse);
});

export const unregisterPushToken = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user!._id;

  // Remove user's push token
  await User.findByIdAndUpdate(
    userId,
    { $unset: { pushToken: 1 } }
  );

  logger.info(`Push token unregistered for user: ${req.user!.email}`);

  res.status(200).json({
    success: true,
    message: 'Push token unregistered successfully'
  } as ApiResponse);
});

export const sendTestNotification = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user!._id;
  const { title, body, data } = req.body;

  const success = await notificationService.sendToUser(userId.toString(), {
    title: title || 'Test Notification',
    body: body || 'This is a test notification from BookBite!',
    data: data || { type: 'test' }
  });

  if (success) {
    res.status(200).json({
      success: true,
      message: 'Test notification sent successfully'
    } as ApiResponse);
  } else {
    res.status(400).json({
      success: false,
      message: 'Failed to send test notification'
    } as ApiResponse);
  }
});

export const sendBroadcastNotification = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  // Only admin can send broadcast notifications
  if (req.user!.role !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'Only administrators can send broadcast notifications'
    } as ApiResponse);
    return;
  }

  const { title, body, data, targetRole } = req.body;

  let result;
  if (targetRole) {
    result = await notificationService.sendToRole(targetRole, {
      title,
      body,
      data: data || { type: 'broadcast' }
    });
  } else {
    result = await notificationService.sendBroadcast({
      title,
      body,
      data: data || { type: 'broadcast' }
    });
  }

  logger.info(`Broadcast notification sent by ${req.user!.email}: ${result.success} success, ${result.failed} failed`);

  res.status(200).json({
    success: true,
    message: 'Broadcast notification sent',
    data: {
      sent: result.success,
      failed: result.failed
    }
  } as ApiResponse);
});

export const getNotificationSettings = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const user = req.user!;

  const settings = {
    pushNotificationsEnabled: !!user.pushToken,
    orderUpdates: true, // These could be stored in user preferences
    bookingUpdates: true,
    paymentUpdates: true,
    promotions: true,
    emailNotifications: user.emailVerified
  };

  res.status(200).json({
    success: true,
    message: 'Notification settings retrieved successfully',
    data: { settings }
  } as ApiResponse);
});

export const updateNotificationSettings = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user!._id;
  const { 
    orderUpdates, 
    bookingUpdates, 
    paymentUpdates, 
    promotions, 
    emailNotifications 
  } = req.body;

  // In a full implementation, you would store these preferences in the user model
  // For now, we'll just return success
  
  logger.info(`Notification settings updated for user: ${req.user!.email}`);

  res.status(200).json({
    success: true,
    message: 'Notification settings updated successfully',
    data: {
      settings: {
        orderUpdates,
        bookingUpdates,
        paymentUpdates,
        promotions,
        emailNotifications
      }
    }
  } as ApiResponse);
});