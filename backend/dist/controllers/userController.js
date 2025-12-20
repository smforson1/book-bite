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
exports.updatePushToken = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Update Push Token
const updatePushToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const { pushToken } = req.body;
        if (!pushToken) {
            res.status(400).json({ message: 'Push token is required' });
            return;
        }
        yield prisma.user.update({
            where: { id: userId },
            data: { pushToken }
        });
        res.status(200).json({ message: 'Push token updated successfully' });
    }
    catch (error) {
        console.error('Update Push Token Error', error);
        res.status(500).json({ message: 'Error updating push token', error });
    }
});
exports.updatePushToken = updatePushToken;
