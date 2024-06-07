"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer = require('nodemailer');
class MailerService {
    sendMail(status = true, coworkingName, email, name, phoneNumber, date, startTime, endTime, numberSeats, price, reservationNumber) {
        return __awaiter(this, void 0, void 0, function* () {
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
                const sendMail = (yield transporter.sendMail({
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
                }));
                return sendMail;
            }
            catch (error) {
                throw new Error(error.message);
            }
        });
    }
}
exports.default = MailerService;
