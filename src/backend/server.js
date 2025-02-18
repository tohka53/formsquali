// server.js
const express = require('express');
const nodemailer = require('nodemailer');
const multer = require('multer');
const cors = require('cors');

const app = express();
app.use(cors());

const upload = multer({ storage: multer.memoryStorage() });

// Configurar transporter de email
const transporter = nodemailer.createTransport({
  service: 'gmail', // o tu servicio de email
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

app.post('/send-pdf', upload.single('pdf'), async (req, res) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: req.body.to,
      subject: req.body.subject,
      text: 'Adjunto encontrará el formulario solicitado.',
      attachments: [{
        filename: req.file.originalname,
        content: req.file.buffer,
        contentType: 'application/pdf'
      }]
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});