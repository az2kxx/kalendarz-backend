import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

import authRoutes from './api/auth/auth.routes';
import availabilityRoutes from './api/availability/availability.routes';
import bookingRoutes from './api/booking/booking.routes';

const app = express();
export const prisma = new PrismaClient();

// Konfiguracja CORS
const allowedOrigins = process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : [];
// Dla ułatwienia pracy lokalnej dodajemy typowe porty frontendu
if (process.env.NODE_ENV !== 'production') {
    allowedOrigins.push('http://localhost:3000'); // np. Create React App
    allowedOrigins.push('http://localhost:5173'); // np. Vite
}

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Zezwalaj na zapytania bez 'origin' (np. Postman) i te z dozwolonej listy
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
};

app.use(cors(corsOptions));
app.use(express.json());

// Główne trasy API
app.get('/api', (req, res) => res.send('CALX API is healthy!'));
app.use('/api/auth', authRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/booking', bookingRoutes);

export default app;