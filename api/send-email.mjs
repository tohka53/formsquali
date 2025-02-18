// api/send-email.mjs
import nodemailer from 'nodemailer';

export default async function handler(request, response) {
  // Verificar si estamos en el servidor
  const isServer = typeof window === 'undefined';
  
  if (!isServer) {
    return response.status(500).json({ 
      error: 'This endpoint should only be called from server side' 
    });
  }

  try {
    // Configurar CORS
    response.setHeader('Access-Control-Allow-Credentials', true);
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.setHeader(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    // Manejar OPTIONS request
    if (request.method === 'OPTIONS') {
      return response.status(200).end();
    }

    // Verificar método POST
    if (request.method !== 'POST') {
      return response.status(405).json({ error: 'Method not allowed' });
    }

    // Log para debugging
    console.log('Request body:', request.body);

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
      to: process.env.EMAIL_USER, // Enviar al mismo correo configurado
      subject: 'Nuevo Formulario',
      text: 'Adjunto encontrará el formulario solicitado.',
      attachments: [{
        filename: 'formulario.pdf',
        content: request.body.pdf,
        contentType: 'application/pdf'
      }]
    };

    // Log para debugging
    console.log('Mail options:', {
      ...mailOptions,
      attachments: 'PDF Content' // No logueamos el contenido del PDF
    });

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info);
    
    return response.status(200).json({ 
      message: 'Email sent successfully',
      messageId: info.messageId
    });

  } catch (error) {
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });

    return response.status(500).json({ 
      error: 'Error sending email',
      details: error.message,
      type: error.name
    });
  }
}