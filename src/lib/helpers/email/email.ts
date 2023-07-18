import type { SendMailOptions, SentMessageInfo } from 'nodemailer';
import nodemailer from 'nodemailer';
import { env } from '$env/dynamic/private';

const transporter = nodemailer.createTransport({
	service: 'gmail',
	host: 'smtp.gmail.com',
	port: 587,
	secure: true,
	auth: {
		user: env.FROM_EMAIL_ADDRESS,
		pass: env.FROM_EMAIL_PASSWORD
	}
});

export async function send_mail(mailDetails: SendMailOptions, callback: (x: SentMessageInfo) => void) {
	try {
		const info = await transporter.sendMail(mailDetails);
		callback(info);
	} catch (error) {
		console.error(error);
	}
}
