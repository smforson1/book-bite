import express from 'express';
import { createBooking, getUserBookings, updateBookingStatus, getManagerBookings, getOccupancyStats, getActiveGuests } from '../controllers/bookingController';
import { verifyToken, requireRole } from '../middleware/auth';

const router = express.Router();

// All booking routes require authentication
router.use(verifyToken);

router.post('/', createBooking);
router.get('/user', getUserBookings);
router.get('/manager', requireRole(['MANAGER']), getManagerBookings);
router.get('/manager/occupancy', requireRole(['MANAGER']), getOccupancyStats);
router.get('/manager/active-guests', requireRole(['MANAGER']), getActiveGuests);
router.put('/:id', updateBookingStatus);

export default router;
