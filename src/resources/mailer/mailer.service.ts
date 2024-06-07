const nodemailer = require('nodemailer');
import SendMail from '@/resources/mailer/mailer.interface';

class MailerService {
    public async sendMail(
        status: boolean = true,
        coworkingName: string,
        email: string,
        name: string,
        phoneNumber: string,
        date: string,
        startTime: string,
        endTime: string,
        numberSeats: number,
        price: number,
        reservationNumber?: number,
    ): Promise<SendMail | Error> {
        try {
            const transporter = nodemailer.createTransport({
                host: process.env.MAILER_SMPT_HOST,
                port: process.env.MAILER_SMPT_PORT,
                secure: process.env.MAILER_SMPT_SECURE,
                auth: {
                    user: process.env.MAILER_SMPT_USER,
                    pass: process.env.MAILER_SMPT_PASSWORD,
                },
            });
            const sendMail = (await transporter.sendMail({
                from: process.env.MAILER_SMPT_USER,
                to: email,
                subject: 'Coworking voucher',
                html: status
                    ? `
                <html lang='en'>
                    <body>
                        <div class="container">
                            <h1>Coworking voucher</h1>
                            <p>Thank you, your reservation for ${coworkingName} was successful!</p>
                            <br/>
                            <p>Data:</p>
                            <p>${name}</p>
                            <p>${phoneNumber}</p>
                            <br/>
                            <p>Booking information:</p>
                            <p>${date}</p>
                            <p>${startTime} - ${endTime}</p>
                            <p>${numberSeats}</p>
                            <p>${price}₴</p>
                            <br/>
                            ${reservationNumber}
                        </div>
                    </body>
                </html>
            `
                    : `
            <html lang='en'>
                <body>
                    <div class="container">
                        <h1>Coworking voucher</h1>
                        <p>Oops, your reservation for ${coworkingName} has been canceled!</p>
                        <br/>
                        <p>Data:</p>
                        <p>${name}</p>
                        <p>${phoneNumber}</p>
                        <br/>
                        <p>Booking information:</p>
                        <p>${date}</p>
                        <p>${startTime} - ${endTime}</p>
                        <p>${numberSeats}</p>
                        <p>${price}₴</p>
                    </div>
                </body>
            </html>
        `,
            })) as SendMail;

            return sendMail;
        } catch (error: any) {
            throw new Error(error.message);
        }
    }
}

export default MailerService;
