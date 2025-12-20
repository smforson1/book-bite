"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const businessRoutes_1 = __importDefault(require("./routes/businessRoutes"));
const roomRoutes_1 = __importDefault(require("./routes/roomRoutes"));
const menuRoutes_1 = __importDefault(require("./routes/menuRoutes"));
const bookingRoutes_1 = __importDefault(require("./routes/bookingRoutes"));
const orderRoutes_1 = __importDefault(require("./routes/orderRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const paymentRoutes_1 = __importDefault(require("./routes/paymentRoutes"));
const walletRoutes_1 = __importDefault(require("./routes/walletRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
app.use('/api/auth', authRoutes_1.default);
app.use('/api/admin', adminRoutes_1.default);
app.use('/api/business', businessRoutes_1.default);
app.use('/api/payment', paymentRoutes_1.default);
app.use('/api/rooms', roomRoutes_1.default);
app.use('/api/menu-items', menuRoutes_1.default);
app.use('/api/bookings', bookingRoutes_1.default);
app.use('/api/orders', orderRoutes_1.default);
app.use('/api/wallet', walletRoutes_1.default);
app.use('/api/user', userRoutes_1.default);
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
