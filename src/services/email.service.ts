import { Resend } from 'resend';

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

const resend = new Resend(process.env.RESEND_API_KEY);


const MY_VERIFIED_GMAIL_ADDRESS = "azebrowskipriority@gmail.com"; 

const MEETING_LINK = "https://meet.google.com/twoj-prywatny-link";



export const sendBookingConfirmationEmail = async (booking: BookingWithHost) => {
  const { guestName, guestEmail, host, startTime } = booking;
  
  const meetingTime = new Date(startTime).toLocaleString('pl-PL', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'Europe/Warsaw'
  });

  try {
    const emailToGuest = {
      from: MY_VERIFIED_GMAIL_ADDRESS, 
      to: [MY_VERIFIED_GMAIL_ADDRESS],  
      subject: `[TEST GOŚĆ] Potwierdzenie rezerwacji z ${host.name}`, 
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2>Cześć ${guestName},</h2>
          <p>Twoje spotkanie z <strong>${host.name}</strong> zostało pomyślnie zarezerwowane!</p>
          <p><em>(To jest mail testowy wysłany na adres ${MY_VERIFIED_GMAIL_ADDRESS} zamiast na ${guestEmail})</em></p>
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
        </div>
      `,
    };

    const emailToHost = {
      from: MY_VERIFIED_GMAIL_ADDRESS,
      to: [MY_VERIFIED_GMAIL_ADDRESS],
      subject: `[TEST HOST] Nowa rezerwacja od ${guestName}!`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2>Nowe spotkanie w Twoim kalendarzu!</h2>
          <p><strong>${guestName}</strong> (${guestEmail}) właśnie zarezerwował(a) z Tobą spotkanie.</p>
          <p><em>(To jest mail testowy wysłany na adres ${MY_VERIFIED_GMAIL_ADDRESS} zamiast na ${host.email})</em></p>
          <hr style="border: 0; border-top: 1px solid #eee;">
          <h3>Szczegóły spotkania:</h3>
          <ul>
            <li><strong>Kiedy:</strong> ${meetingTime}</li>
            <li><strong>Link do spotkania:</strong> <a href="${MEETING_LINK}">${MEETING_LINK}</a></li>
          </ul>
        </div>
      `,
    };

    await Promise.all([
        resend.emails.send(emailToGuest),
        resend.emails.send(emailToHost)
    ]);

    console.log(`Successfully sent TEST confirmation emails to ${MY_VERIFIED_GMAIL_ADDRESS}`);

  } catch (error) {
    console.error('Error sending TEST email via Resend:', error);
  }
};