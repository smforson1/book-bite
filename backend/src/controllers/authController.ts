import { Request, Response } from 'express';
import { User } from '@/models/User';
import { generateTokens, verifyRefreshToken } from '@/utils/jwt';
import { ApiResponse, AuthenticatedRequest } from '@/types';
import { asyncHandler } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';

export const register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email, password, name, role, phone } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(400).json({
      success: false,
      message: 'User with this email already exists'
    } as ApiResponse);
    return;
  }

  // Create new user
  const user = new User({
    email,
    password,
    name,
    role: role || 'user',
    phone
  });

  await user.save();

  // Generate tokens
  const tokens = generateTokens(user);

  logger.info(`New user registered: ${email} with role: ${role || 'user'}`);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        emailVerified: user.emailVerified
      },
      ...tokens
    }
  } as ApiResponse);
});

export const login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  // Find user and include password for comparison
  const user = await User.findOne({ email }).select('+password');
  
  if (!user || !user.isActive) {
    res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    } as ApiResponse);
    return;
  }

  // Check password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    } as ApiResponse);
    return;
  }

  // Generate tokens
  const tokens = generateTokens(user);

  logger.info(`User logged in: ${email}`);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        emailVerified: user.emailVerified
      },
      ...tokens
    }
  } as ApiResponse);
});

export const refreshToken = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    res.status(400).json({
      success: false,
      message: 'Refresh token is required'
    } as ApiResponse);
    return;
  }

  try {
    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    
    // Find user
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      } as ApiResponse);
      return;
    }

    // Generate new tokens
    const tokens = generateTokens(user);

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: tokens
    } as ApiResponse);
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired refresh token'
    } as ApiResponse);
  }
});

export const logout = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  // In a production app, you might want to blacklist the token
  // For now, we'll just return a success response
  
  logger.info(`User logged out: ${req.user?.email}`);

  res.status(200).json({
    success: true,
    message: 'Logout successful'
  } as ApiResponse);
});

export const getProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const user = req.user!;

  res.status(200).json({
    success: true,
    message: 'Profile retrieved successfully',
    data: {
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt
      }
    }
  } as ApiResponse);
});

export const updateProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { name, phone } = req.body;
  const userId = req.user!._id;

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { 
      ...(name && { name }),
      ...(phone && { phone })
    },
    { new: true, runValidators: true }
  );

  if (!updatedUser) {
    res.status(404).json({
      success: false,
      message: 'User not found'
    } as ApiResponse);
    return;
  }

  logger.info(`User profile updated: ${updatedUser.email}`);

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: {
        id: updatedUser._id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        phone: updatedUser.phone,
        avatar: updatedUser.avatar,
        emailVerified: updatedUser.emailVerified
      }
    }
  } as ApiResponse);
});

export const changePassword = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user!._id;

  // Get user with password
  const user = await User.findById(userId).select('+password');
  if (!user) {
    res.status(404).json({
      success: false,
      message: 'User not found'
    } as ApiResponse);
    return;
  }

  // Verify current password
  const isCurrentPasswordValid = await user.comparePassword(currentPassword);
  if (!isCurrentPasswordValid) {
    res.status(400).json({
      success: false,
      message: 'Current password is incorrect'
    } as ApiResponse);
    return;
  }

  // Update password
  user.password = newPassword;
  await user.save();

  logger.info(`Password changed for user: ${user.email}`);

  res.status(200).json({
    success: true,
    message: 'Password changed successfully'
  } as ApiResponse);
});