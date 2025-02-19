// api/send-email.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';

export default async function handler(request: VercelRequest, response: VercelResponse) {
  try {
    // Log para debugging
    console.log('Request received:', request.body);

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
      },
      debug: true
    });

    // Verificar conexión
    await transporter.verify();
    console.log('SMTP connection verified');

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: 'Nuevo Formulario Business Intake',
      text: 'Adjunto encontrará el formulario solicitado.',
      attachments: [{
        filename: 'formulario.pdf',
        content: Buffer.from(request.body.pdf),
        contentType: 'application/pdf'
      }]
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info);
    
    return response.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Server error:', error);
    return response.status(500).json({ 
      error: 'Error sending email',
      details: error.message,
      stack: error.stack
    });
  }
}