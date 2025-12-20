import express from 'express';
import { createBooking, getUserBookings, updateBookingStatus, getManagerBookings } from '../controllers/bookingController';
import { verifyToken, requireRole } from '../middleware/auth';

const router = express.Router();

// All booking routes require authentication
router.use(verifyToken);

router.post('/', createBooking);
router.get('/user', getUserBookings);
router.get('/manager', requireRole(['MANAGER']), getManagerBookings);
router.put('/:id', updateBookingStatus);

export default router;
