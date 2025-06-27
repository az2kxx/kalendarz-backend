import { Prisma } from '@prisma/client';

export type BookingWithHost = {
  id: string;
  startTime: Date;
  endTime: Date;
  guestName: string;
  guestEmail: string;
  hostId: string;
  host: {
    name: string;
    email: string;
  };
  createdAt: Date;
  updatedAt: Date;
};

export const sendBookingConfirmationEmail = async (booking: BookingWithHost) => {
  console.log('--- MOCK EMAIL SENDER ---');
  console.log(`Sending confirmation for booking with ${booking.host.name} to: ${booking.guestEmail}`);
  console.log(`Guest: ${booking.guestName}`);
  console.log(`Time: ${booking.startTime.toLocaleString('pl-PL')}`);
  console.log(`An email was also sent to the host: ${booking.host.email}`);
  console.log('-------------------------');

  return Promise.resolve();
};