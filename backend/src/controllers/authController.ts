import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

// Helper to generate token
const generateToken = (userId: string, role: string) => {
    return jwt.sign({ userId, role }, process.env.JWT_SECRET as string, { expiresIn: '7d' });
};

export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password, name, phone } = req.body;

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            res.status(400).json({ message: 'User already exists' });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                phone,
                role: 'USER',
            },
        });

        const token = generateToken(user.id, user.role);
        res.status(201).json({ token, user: { id: user.id, email: user.email, role: user.role } });
    } catch (error) {
        res.status(500).json({ message: 'Error registering user', error });
    }
};

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            res.status(400).json({ message: 'Invalid credentials' });
            return;
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(400).json({ message: 'Invalid credentials' });
            return;
        }

        const token = generateToken(user.id, user.role);
        res.status(200).json({ token, user: { id: user.id, email: user.email, role: user.role } });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error });
    }
};

// Manager Registration with Activation Code
export const registerManager = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password, name, phone, activationCode } = req.body;

        // Validate Activation Code
        const code = await prisma.activationCode.findUnique({ where: { code: activationCode } });
        if (!code || code.isUsed) {
            res.status(400).json({ message: 'Invalid or used activation code' });
            return;
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            res.status(400).json({ message: 'User already exists' });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Transaction to create user, manager profile, and mark code as used
        const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            const user = await tx.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    name,
                    phone,
                    role: 'MANAGER',
                    managerProfile: {
                        create: {} // Create empty manager profile linked to user
                    }
                },
            });

            await tx.activationCode.update({
                where: { id: code.id },
                data: { isUsed: true, usedBy: user.id },
            });

            return user;
        });

        const token = generateToken(result.id, result.role);
        res.status(201).json({ token, user: { id: result.id, email: result.email, role: result.role } });
    } catch (error) {
        res.status(500).json({ message: 'Error registering manager', error });
    }
};
