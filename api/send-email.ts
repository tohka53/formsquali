import { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  // Log para debugging
  console.log('Request body:', request.body);

  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Configurar transporter con más detalles
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
      },
      debug: true // Habilitar logs
    });

    // Verificar la conexión
    await transporter.verify();
    console.log('Conexión SMTP verificada');

    // Log para debugging
    console.log('Email config:', {
      from: process.env.EMAIL_USER,
      to: request.body.to
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: request.body.to || process.env.EMAIL_USER, // Usar email configurado como fallback
      subject: request.body.subject || 'Nuevo Formulario',
      text: 'Adjunto encontrará el formulario solicitado.',
      attachments: [{
        filename: 'formulario.pdf',
        content: request.body.pdf,
        contentType: 'application/pdf'
      }]
    };

    // Intentar enviar el email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email enviado:', info);
    
    return response.status(200).json({ 
      message: 'Email sent successfully',
      info: info
    });
  } catch (error) {
    console.error('Error detallado:', error);
    const err = error as Error;
    return response.status(500).json({ 
      error: 'Error sending email', 
      details: err.message,
      stack: err.stack
    });
  }
}