import jwt, { SignOptions } from 'jsonwebtoken';
import { IUser } from '@/types';

export interface JwtPayload {
    userId: string;
    email: string;
    role: string;
}

export const generateAccessToken = (user: IUser): string => {
    const payload: JwtPayload = {
        userId: user._id,
        email: user.email,
        role: user.role
    };

    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined in environment variables');
    }

    const options: SignOptions = {
        expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any
    };

    return jwt.sign(payload, process.env.JWT_SECRET, options);
};

export const generateRefreshToken = (user: IUser): string => {
    const payload: JwtPayload = {
        userId: user._id,
        email: user.email,
        role: user.role
    };

    if (!process.env.JWT_REFRESH_SECRET) {
        throw new Error('JWT_REFRESH_SECRET is not defined in environment variables');
    }

    const options: SignOptions = {
        expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '30d') as any
    };

    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, options);
};

export const verifyAccessToken = (token: string): JwtPayload => {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined in environment variables');
    }

    return jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;
};

export const verifyRefreshToken = (token: string): JwtPayload => {
    if (!process.env.JWT_REFRESH_SECRET) {
        throw new Error('JWT_REFRESH_SECRET is not defined in environment variables');
    }

    return jwt.verify(token, process.env.JWT_REFRESH_SECRET) as JwtPayload;
};

export const generateTokens = (user: IUser) => {
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    return {
        accessToken,
        refreshToken,
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    };
};