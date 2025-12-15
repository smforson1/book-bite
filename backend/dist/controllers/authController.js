"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerManager = exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Helper to generate token
const generateToken = (userId, role) => {
    return jsonwebtoken_1.default.sign({ userId, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
};
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password, name, phone } = req.body;
        const existingUser = yield prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            res.status(400).json({ message: 'User already exists' });
            return;
        }
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const user = yield prisma.user.create({
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
    }
    catch (error) {
        res.status(500).json({ message: 'Error registering user', error });
    }
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const user = yield prisma.user.findUnique({ where: { email } });
        if (!user) {
            res.status(400).json({ message: 'Invalid credentials' });
            return;
        }
        const isMatch = yield bcrypt_1.default.compare(password, user.password);
        if (!isMatch) {
            res.status(400).json({ message: 'Invalid credentials' });
            return;
        }
        const token = generateToken(user.id, user.role);
        res.status(200).json({ token, user: { id: user.id, email: user.email, role: user.role } });
    }
    catch (error) {
        res.status(500).json({ message: 'Error logging in', error });
    }
});
exports.login = login;
// Manager Registration with Activation Code
const registerManager = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password, name, phone, activationCode } = req.body;
        // Validate Activation Code
        const code = yield prisma.activationCode.findUnique({ where: { code: activationCode } });
        if (!code || code.isUsed) {
            res.status(400).json({ message: 'Invalid or used activation code' });
            return;
        }
        const existingUser = yield prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            res.status(400).json({ message: 'User already exists' });
            return;
        }
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        // Transaction to create user, manager profile, and mark code as used
        const result = yield prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            const user = yield tx.user.create({
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
            yield tx.activationCode.update({
                where: { id: code.id },
                data: { isUsed: true, usedBy: user.id },
            });
            return user;
        }));
        const token = generateToken(result.id, result.role);
        res.status(201).json({ token, user: { id: result.id, email: result.email, role: result.role } });
    }
    catch (error) {
        res.status(500).json({ message: 'Error registering manager', error });
    }
});
exports.registerManager = registerManager;
