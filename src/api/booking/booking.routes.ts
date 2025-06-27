import { Router } from 'express';
import { getAvailableSlots, createBooking } from './booking.controller';
import { validateBooking } from '../../utils/validation';

const router = Router();

router.get('/:userId/slots', getAvailableSlots);
router.post('/:userId/book', validateBooking, createBooking);

export default router;