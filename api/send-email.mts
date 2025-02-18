// api/send-email.mjs
import nodemailer from 'nodemailer';

export default async function handler(request, response) {
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

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
      }
    });

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

    await transporter.sendMail(mailOptions);
    
    return response.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    return response.status(500).json({ 
      error: 'Error sending email',
      details: error.message 
    });
  }
}