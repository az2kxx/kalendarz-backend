import { Router } from 'express';
import { getMyBookings, updateBooking, cancelBooking } from './admin.controller';
import { protect, AuthRequest } from '../../middleware/auth.middleware';

const router = Router();

router.use(protect);

router.get('/', (req, res) => getMyBookings(req as AuthRequest, res));
router.put('/:bookingId', (req, res) => updateBooking(req as AuthRequest, res));
router.delete('/:bookingId', (req, res) => cancelBooking(req as AuthRequest, res));

export default router;