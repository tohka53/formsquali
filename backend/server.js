const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Configuración del transporte de correo (nodemailer)
const transporter = nodemailer.createTransport({
  // Configura los detalles de tu servicio de correo electrónico
  // Por ejemplo, para Gmail:
  service: 'gmail',
  auth: {
    user: 'mecg1994@gmail.com',
    pass: 'jwtjbaymtwhdyptl'
  }
});

// Ruta para manejar las solicitudes POST en el endpoint /send-email
app.post('/send-email', (req, res) => {
  const { to, subject, text } = req.body;

  const mailOptions = {
    from: 'mecg1994@gmail.com',
    to: to,
    subject: subject,
    text: text
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      res.status(500).send('Error al enviar el correo electrónico');
    } else {
      console.log('Correo electrónico enviado: ' + info.response);
      res.status(200).send('Correo electrónico enviado correctamente');
    }
  });
});

// Inicia el servidor
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor backend en ejecución en el puerto ${port}`);
});