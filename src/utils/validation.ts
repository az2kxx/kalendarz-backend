import { body } from 'express-validator';

export const validateRegister = [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('name').notEmpty().withMessage('Name is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
];

export const validateLogin = [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
];

export const validateBooking = [
  body('startTime').isISO8601().toDate().withMessage('Valid start time in ISO8601 format is required'),
  body('guestName').notEmpty().withMessage('Guest name is required'),
  body('guestEmail').isEmail().withMessage('Valid guest email is required'),
];