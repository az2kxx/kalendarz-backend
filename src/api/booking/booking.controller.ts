import { Request, Response } from 'express';
import { prisma } from '../../app';
import { validationResult } from 'express-validator';
import { sendBookingConfirmationEmail } from '../../services/email.service';

// Funkcja do znajdowania wolnych slotów - CORE LOGIC
export const getAvailableSlots = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { date } = req.query; // Oczekiwany format YYYY-MM-DD

  if (!date || typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ message: 'Valid date query parameter in YYYY-MM-DD format is required.' });
  }

  try {
    const requestedDate = new Date(date + 'T00:00:00.000Z'); // Używamy UTC
    const dayOfWeek = requestedDate.getUTCDay();

    // 1. Znajdź reguły dostępności dla tego dnia tygodnia
    const availability = await prisma.availability.findFirst({
      where: { userId, dayOfWeek },
    });

    if (!availability) {
      return res.json([]); // Brak dostępności w ten dzień
    }

    // 2. Znajdź wszystkie rezerwacje na ten dzień
    const startOfDay = new Date(date + 'T00:00:00.000Z');
    const endOfDay = new Date(date + 'T23:59:59.999Z');
    const bookings = await prisma.booking.findMany({
      where: { hostId: userId, startTime: { gte: startOfDay, lte: endOfDay } },
    });

    // 3. Generuj potencjalne sloty i odfiltruj zajęte
    const slotDuration = 30; // w minutach
    const availableSlots = [];

    const [startHour, startMinute] = availability.startTime.split(':').map(Number);
    const [endHour, endMinute] = availability.endTime.split(':').map(Number);

    let currentSlotTime = new Date(startOfDay);
    currentSlotTime.setUTCHours(startHour, startMinute, 0, 0);

    const endTime = new Date(startOfDay);
    endTime.setUTCHours(endHour, endMinute, 0, 0);

    while (currentSlotTime < endTime) {
      const slotEndTime = new Date(currentSlotTime.getTime() + slotDuration * 60000);

      // Sprawdź, czy slot nie koliduje z istniejącą rezerwacją
      const isBooked = bookings.some(
        (booking: { startTime: Date; endTime: Date }) =>
          (currentSlotTime >= booking.startTime && currentSlotTime < booking.endTime) ||
          (slotEndTime > booking.startTime && slotEndTime <= booking.endTime) ||
          (currentSlotTime < booking.startTime && slotEndTime > booking.endTime)
      );

      if (!isBooked) {
        availableSlots.push(new Date(currentSlotTime));
      }

      currentSlotTime = slotEndTime;
    }

    res.json(availableSlots);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching available slots' });
  }
};

export const createBooking = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { userId } = req.params;
  const { startTime, guestName, guestEmail } = req.body;
  const slotDuration = 30; // minuty

  try {
    const bookingStartTime = new Date(startTime);
    const bookingEndTime = new Date(bookingStartTime.getTime() + slotDuration * 60000);

    // WAŻNE: Sprawdź ponownie dostępność, aby uniknąć "race condition"
    const existingBooking = await prisma.booking.findFirst({
      where: {
        hostId: userId,
        OR: [
          { startTime: { lt: bookingEndTime, gte: bookingStartTime } },
          { endTime: { lte: bookingEndTime, gt: bookingStartTime } },
        ],
      },
    });

    if (existingBooking) {
      return res.status(409).json({ message: 'This time slot is no longer available.' });
    }

    const booking = await prisma.booking.create({
        data: {
          startTime: bookingStartTime,
          endTime: bookingEndTime,
          guestName,
          guestEmail,
          hostId: userId,
        },
        include: {
          host: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      });
    

    // Wyślij powiadomienie email (async)
    sendBookingConfirmationEmail(booking);

    res.status(201).json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating booking' });
  }
};