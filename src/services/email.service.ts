import nodemailer from 'nodemailer';

export type BookingWithHost = {
  id: string;
  startTime: Date;
  endTime: Date;
  guestName: string;
  guestEmail: string;
  host: {
    name: string;
    email: string;
  };
};


const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, 
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD, 
  },
});

const MEETING_LINK = "https://meet.google.com/twoj-prywatny-link";


export const sendBookingConfirmationEmail = async (booking: BookingWithHost) => {
  const { guestName, guestEmail, host, startTime } = booking;
  
  const meetingTime = new Date(startTime).toLocaleString('pl-PL', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'Europe/Warsaw'
  });

  try {
    const mailToGuestOptions = {
      from: `CalX <${process.env.GMAIL_USER}>`, 
      to: guestEmail, 
      subject: `Potwierdzenie rezerwacji spotkania z ${host.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2>Cześć ${guestName},</h2>
          <p>Twoje spotkanie z <strong>${host.name}</strong> zostało pomyślnie zarezerwowane!</p>
          <hr style="border: 0; border-top: 1px solid #eee;">
          <h3>Szczegóły spotkania:</h3>
          <ul>
            <li><strong>Z kim:</strong> ${host.name}</li>
            <li><strong>Kiedy:</strong> ${meetingTime}</li>
          </ul>
          <h3>Link do spotkania online:</h3>
          <p style="text-align: center; margin: 20px 0;">
            <a 
              href="${MEETING_LINK}" 
              style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;"
            >
              Dołącz do spotkania
            </a>
          </p>
          <p>Pozdrawiamy,<br>Zespół CalX</p>
        </div>
      `,
    };

    const mailToHostOptions = {
      from: `CalX Notyfikacje <${process.env.GMAIL_USER}>`,
      to: host.email, 
      subject: `Nowa rezerwacja od ${guestName}!`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2>Nowe spotkanie w Twoim kalendarzu!</h2>
          <p><strong>${guestName}</strong> (${guestEmail}) właśnie zarezerwował(a) z Tobą spotkanie.</p>
          <hr style="border: 0; border-top: 1px solid #eee;">
          <h3>Szczegóły spotkania:</h3>
          <ul>
            <li><strong>Kiedy:</strong> ${meetingTime}</li>
            <li><strong>Link do spotkania:</strong> <a href="${MEETING_LINK}">${MEETING_LINK}</a></li>
          </ul>
          <p>Szczegóły rezerwacji znajdziesz w swoim panelu CalX.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailToGuestOptions);
    await transporter.sendMail(mailToHostOptions);

    console.log(`Successfully sent confirmation emails for booking ${booking.id} to ${guestEmail} and ${host.email}`);

  } catch (error) {
    console.error('Error sending email via GMail SMTP:', error);
  }
};