import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

import authRoutes from './api/auth/auth.routes';
import availabilityRoutes from './api/availability/availability.routes';
import bookingRoutes from './api/booking/booking.routes';
import adminRoutes from './api/admin/admin.routes'; 

const app = express();
export const prisma = new PrismaClient();


const allowedOrigins = [
    'http://localhost:5173', 
    'https://kalendarz-frontend.vercel.app' 
];

if (process.env.FRONTEND_URL) {
    allowedOrigins.push(process.env.FRONTEND_URL);
}


const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true 
};

app.use(cors(corsOptions));


app.use(express.json());

app.get('/api', (req, res) => res.send('CALX API is healthy!'));
app.use('/api/auth', authRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/booking', bookingRoutes);
app.use('/api/admin/bookings', adminRoutes);

export default app;