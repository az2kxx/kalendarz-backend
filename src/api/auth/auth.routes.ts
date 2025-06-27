import { Router } from 'express';
import { register, login } from './auth.controller';
import { validateRegister, validateLogin } from '../../utils/validation';

const router = Router();
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
export default router;