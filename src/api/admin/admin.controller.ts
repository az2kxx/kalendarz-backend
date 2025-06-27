import { Response } from 'express';
import { prisma } from '../../app';
import { AuthRequest } from '../../middleware/auth.middleware';

export const getMyBookings = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;

  try {
    const bookings = await prisma.booking.findMany({
      where: { hostId: userId },
      orderBy: {
        startTime: 'desc', 
      },
    });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Błąd podczas pobierania rezerwacji', error });
  }
};


export const updateBooking = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { bookingId } = req.params;
  const { guestName, guestEmail, notes } = req.body; 

  try {
    
    const bookingToUpdate = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        hostId: userId,
      },
    });

    if (!bookingToUpdate) {
      return res.status(404).json({ message: 'Nie znaleziono rezerwacji lub brak uprawnień.' });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        guestName,
        guestEmail,
        notes,
      },
    });

    res.json(updatedBooking);
  } catch (error) {
    res.status(500).json({ message: 'Błąd podczas aktualizacji rezerwacji', error });
  }
};

export const cancelBooking = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { bookingId } = req.params;

  try {
    const deleteResult = await prisma.booking.deleteMany({
      where: {
        id: bookingId,
        hostId: userId,
      },
    });

    if (deleteResult.count === 0) {
      return res.status(404).json({ message: 'Nie znaleziono rezerwacji lub brak uprawnień.' });
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Błąd podczas anulowania rezerwacji', error });
  }
};