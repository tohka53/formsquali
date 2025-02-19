// api/send-email.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  try {
    // Configurar CORS
    response.setHeader('Access-Control-Allow-Credentials', true);
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'POST');

    if (request.method === 'OPTIONS') {
      return response.status(200).end();
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: 'Nuevo Formulario Business Intake',
      text: 'Adjunto encontrará el formulario solicitado.',
      attachments: [{
        filename: 'formulario.pdf',
        content: request.body.pdf,
        contentType: 'application/pdf'
      }]
    };

    await transporter.sendMail(mailOptions);
    
    return response.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error:', error);
    return response.status(500).json({ error: 'Error sending email' });
  }
}