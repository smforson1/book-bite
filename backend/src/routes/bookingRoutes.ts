import express from 'express';
import { createBooking, getUserBookings, updateBookingStatus } from '../controllers/bookingController';
import { verifyToken } from '../middleware/auth';

const router = express.Router();

// All booking routes require authentication
router.use(verifyToken);

router.post('/', createBooking);
router.get('/user', getUserBookings);
router.put('/:id', updateBookingStatus);

export default router;
