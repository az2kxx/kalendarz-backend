import { Router } from 'express';
import { setAvailability, getAvailability } from './availability.controller';
import { protect, AuthRequest } from '../../middleware/auth.middleware';

const router = Router();

router.use(protect);

router.get('/', (req, res) => getAvailability(req as AuthRequest, res));
router.post('/', (req, res) => setAvailability(req as AuthRequest, res));

export default router;