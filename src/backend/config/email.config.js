// config/email.config.js
const nodemailer = require('nodemailer');
require('dotenv').config();

// Configuración del transporter de email
const transporter = nodemailer.createTransport({
    service: 'gmail', // Puedes cambiarlo por tu servicio de email
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    },
    // Configuraciones adicionales
    tls: {
        rejectUnauthorized: false // Útil en desarrollo
    },
    // Límites y timeouts
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    rateDelta: 1000,
    rateLimit: 5
});

// Configuración por defecto para los emails
const emailDefaults = {
    from: `"Qualitech Forms" <${process.env.EMAIL_USER}>`,
    replyTo: process.env.EMAIL_USER,
    targetEmail: process.env.TARGET_EMAIL
};

module.exports = {
    transporter,
    emailDefaults,
    // Función para verificar la conexión
    async verifyConnection() {
        try {
            await transporter.verify();
            return { status: 'success', message: 'Email service is ready' };
        } catch (error) {
            return { status: 'error', message: error.message };
        }
    }
};