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
exports.verifyPayment = void 0;
const client_1 = require("@prisma/client");
const axios_1 = __importDefault(require("axios"));
const crypto_1 = __importDefault(require("crypto"));
const notificationService_1 = require("../services/notificationService");
const prisma = new client_1.PrismaClient();
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || 'sk_test_xxxxxx'; // Replace with env var
const verifyPayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g;
    try {
        const { reference, email, amount, metadata } = req.body;
        // metadata should contain: { purpose: 'ACCESS_KEY' | 'BOOKING' | 'ORDER', userId: string, bookingId?: string, orderId?: string }
        // 1. Verify Payment with Paystack
        const verifyResponse = yield axios_1.default.get(`https://api.paystack.co/transaction/verify/${reference}`, {
            headers: {
                Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`
            }
        });
        const data = verifyResponse.data.data;
        if (data.status !== 'success') {
            res.status(400).json({ message: 'Payment verification failed' });
            return;
        }
        const purpose = (metadata === null || metadata === void 0 ? void 0 : metadata.purpose) || 'ACCESS_KEY'; // Default for backward compatibility if needed, though Access Key flow should send it.
        const userId = metadata === null || metadata === void 0 ? void 0 : metadata.userId;
        // 2. Create Payment Record
        const payment = yield prisma.payment.create({
            data: {
                reference,
                amount: data.amount / 100, // Paystack amount is in kobo/cents
                currency: data.currency,
                status: data.status,
                purpose,
                userId: userId, // Assuming userId is passed or we can find it via email if strictly needed, but ID is safer
                metadata: data.metadata || {},
            }
        });
        // 3. Handle specific purpose logic
        let responseData = { message: 'Payment verified successfully' };
        if (purpose === 'ACCESS_KEY') {
            // Existing logic: Generate Code
            const code = crypto_1.default.randomBytes(8).toString('hex').toUpperCase();
            yield prisma.activationCode.create({
                data: {
                    code,
                    price: amount,
                    generatedBy: 'SYSTEM_PAYMENT',
                    isUsed: false
                }
            });
            responseData = Object.assign(Object.assign({}, responseData), { code });
        }
        else if (purpose === 'BOOKING' && metadata.bookingId) {
            // Update Booking & Credit Wallet
            const booking = yield prisma.booking.update({
                where: { id: metadata.bookingId },
                data: {
                    status: 'CONFIRMED',
                    paymentId: payment.id
                },
                include: { business: { include: { manager: true } } }
            });
            // Credit Wallet
            if ((_b = (_a = booking.business) === null || _a === void 0 ? void 0 : _a.manager) === null || _b === void 0 ? void 0 : _b.id) {
                const managerId = booking.business.manager.id;
                // Upsert wallet just in case
                let wallet = yield prisma.wallet.findUnique({ where: { managerId } });
                if (!wallet) {
                    wallet = yield prisma.wallet.create({ data: { managerId } });
                }
                yield prisma.$transaction([
                    prisma.wallet.update({
                        where: { id: wallet.id },
                        data: { balance: { increment: payment.amount } }
                    }),
                    prisma.walletTransaction.create({
                        data: {
                            walletId: wallet.id,
                            amount: payment.amount,
                            type: 'CREDIT',
                            status: 'SUCCESS',
                            reference: payment.reference,
                            description: `Booking Revenue #${booking.id.slice(0, 8)}...`
                        }
                    })
                ]);
            }
        }
        else if (purpose === 'ORDER' && metadata.orderId) {
            // Update Order & Credit Wallet
            const order = yield prisma.order.update({
                where: { id: metadata.orderId },
                data: {
                    status: 'CONFIRMED', // Or whatever initial paid status is
                    paymentId: payment.id
                },
                include: { business: { include: { manager: { include: { user: true } } } } }
            });
            // Credit Wallet
            if ((_d = (_c = order.business) === null || _c === void 0 ? void 0 : _c.manager) === null || _d === void 0 ? void 0 : _d.id) {
                const managerId = order.business.manager.id;
                // Upsert wallet
                let wallet = yield prisma.wallet.findUnique({ where: { managerId } });
                if (!wallet) {
                    wallet = yield prisma.wallet.create({ data: { managerId } });
                }
                yield prisma.$transaction([
                    prisma.wallet.update({
                        where: { id: wallet.id },
                        data: { balance: { increment: payment.amount } }
                    }),
                    prisma.walletTransaction.create({
                        data: {
                            walletId: wallet.id,
                            amount: payment.amount,
                            type: 'CREDIT',
                            status: 'SUCCESS',
                            reference: payment.reference,
                            description: `Order Revenue #${order.id.slice(0, 8)}...`
                        }
                    })
                ]);
                // Send Notification to Manager
                if ((_g = (_f = (_e = order.business) === null || _e === void 0 ? void 0 : _e.manager) === null || _f === void 0 ? void 0 : _f.user) === null || _g === void 0 ? void 0 : _g.pushToken) {
                    yield (0, notificationService_1.sendPushNotification)(order.business.manager.user.pushToken, 'New Order Received! 🍔', `Order #${order.id.slice(0, 5)} has been paid and confirmed.`);
                }
            }
        }
        res.status(200).json(responseData);
    }
    catch (error) {
        console.error('Payment verification error', error);
        res.status(500).json({ message: 'Internal server error processing payment' });
    }
});
exports.verifyPayment = verifyPayment;
