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
Object.defineProperty(exports, "__esModule", { value: true });
exports.processPayout = exports.getAdminPayouts = exports.requestPayout = exports.getWallet = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Get Wallet Details
const getWallet = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        // Find manager profile for this user
        const manager = yield prisma.managerProfile.findUnique({
            where: { userId },
        });
        if (!manager) {
            res.status(404).json({ message: 'Manager profile not found' });
            return;
        }
        // Find or create wallet
        let wallet = yield prisma.wallet.findUnique({
            where: { managerId: manager.id },
            include: {
                transactions: {
                    orderBy: { createdAt: 'desc' },
                    take: 20 // Recent transactions
                }
            }
        });
        if (!wallet) {
            wallet = yield prisma.wallet.create({
                data: { managerId: manager.id },
                include: { transactions: true }
            });
        }
        res.status(200).json(wallet);
    }
    catch (error) {
        console.error('Get Wallet Error', error);
        res.status(500).json({ message: 'Error fetching wallet', error });
    }
});
exports.getWallet = getWallet;
// Request Payout
const requestPayout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const { amount } = req.body;
        const manager = yield prisma.managerProfile.findUnique({ where: { userId } });
        if (!manager) {
            res.status(404).json({ message: 'Manager not found' });
            return;
        }
        const wallet = yield prisma.wallet.findUnique({ where: { managerId: manager.id } });
        if (!wallet || Number(wallet.balance) < amount) {
            res.status(400).json({ message: 'Insufficient balance' });
            return;
        }
        // Create Debit Transaction (Pending)
        // In real app, we'd also create a PayoutRequest record for Admin to review. 
        // For now, we'll deduct and mark as PENDING withdrawal.
        yield prisma.$transaction([
            prisma.wallet.update({
                where: { id: wallet.id },
                data: { balance: { decrement: amount } }
            }),
            prisma.walletTransaction.create({
                data: {
                    walletId: wallet.id,
                    amount: amount,
                    type: 'DEBIT',
                    status: 'PENDING', // Waiting admin approval
                    description: 'Payout Request',
                }
            })
        ]);
        res.status(200).json({ message: 'Payout requested successfully' });
    }
    catch (error) {
        console.error('Payout Request Error', error);
        res.status(500).json({ message: 'Error requesting payout', error });
    }
});
exports.requestPayout = requestPayout;
// Admin: Get All Payouts
const getAdminPayouts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const payouts = yield prisma.walletTransaction.findMany({
            where: { type: 'DEBIT', description: 'Payout Request' }, // Filter logic
            include: {
                wallet: {
                    include: {
                        manager: {
                            include: {
                                user: {
                                    select: { name: true, email: true }
                                },
                                business: {
                                    select: { name: true }
                                }
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json(payouts);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching payouts', error });
    }
});
exports.getAdminPayouts = getAdminPayouts;
// Admin: Process Payout
const processPayout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { status, rejectionReason } = req.body; // status: SUCCESS or FAILED
        const transaction = yield prisma.walletTransaction.findUnique({
            where: { id },
            include: { wallet: true }
        });
        if (!transaction) {
            res.status(404).json({ message: 'Transaction not found' });
            return;
        }
        if (transaction.status !== 'PENDING') {
            res.status(400).json({ message: 'Transaction is not pending' });
            return;
        }
        if (status === 'SUCCESS') {
            // Confirm Payout
            yield prisma.walletTransaction.update({
                where: { id },
                data: { status: 'SUCCESS' }
            });
            // Here you would trigger external bank transfer logic
        }
        else if (status === 'FAILED') {
            // Reject Payout - Refund Wallet
            yield prisma.$transaction([
                prisma.walletTransaction.update({
                    where: { id },
                    data: {
                        status: 'FAILED',
                        description: transaction.description + (rejectionReason ? ` - Rejected: ${rejectionReason}` : ' - Rejected')
                    }
                }),
                prisma.wallet.update({
                    where: { id: transaction.walletId },
                    data: { balance: { increment: transaction.amount } }
                })
            ]);
        }
        else {
            res.status(400).json({ message: 'Invalid status' });
            return;
        }
        res.status(200).json({ message: `Payout ${status === 'SUCCESS' ? 'approved' : 'rejected'} successfully` });
    }
    catch (error) {
        console.error('Process Payout Error', error);
        res.status(500).json({ message: 'Error processing payout', error });
    }
});
exports.processPayout = processPayout;
