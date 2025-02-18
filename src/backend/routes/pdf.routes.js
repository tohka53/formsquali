// routes/pdf.routes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { transporter, emailDefaults } = require('../config/email.config');

// Configuración de multer para manejar archivos
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // Límite de 5MB
    }
});

// Ruta para enviar un solo PDF
router.post('/send-pdf', upload.single('pdf'), async (req, res) => {
    try {
        const { subject = 'Nuevo formulario', formName = 'Form' } = req.body;
        
        if (!req.file) {
            throw new Error('No se proporcionó ningún archivo PDF');
        }

        const mailOptions = {
            ...emailDefaults,
            to: emailDefaults.targetEmail,
            subject: subject,
            text: `Se ha recibido un nuevo formulario: ${formName}`,
            attachments: [{
                filename: `${formName}_${Date.now()}.pdf`,
                content: req.file.buffer,
                contentType: 'application/pdf'
            }]
        };

        await transporter.sendMail(mailOptions);

        res.json({
            success: true,
            message: 'PDF enviado correctamente',
            timestamp: new Date()
        });

    } catch (error) {
        console.error('Error al enviar PDF:', error);
        res.status(500).json({
            success: false,
            message: 'Error al enviar el PDF',
            error: error.message
        });
    }
});

// Ruta para enviar múltiples PDFs
router.post('/send-multiple-pdfs', upload.array('pdfs', 5), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            throw new Error('No se proporcionaron archivos PDF');
        }

        const attachments = req.files.map(file => ({
            filename: `${file.originalname}_${Date.now()}.pdf`,
            content: file.buffer,
            contentType: 'application/pdf'
        }));

        const mailOptions = {
            ...emailDefaults,
            to: emailDefaults.targetEmail,
            subject: 'Múltiples formularios recibidos',
            text: `Se han recibido ${req.files.length} formularios`,
            attachments
        };

        await transporter.sendMail(mailOptions);

        res.json({
            success: true,
            message: 'PDFs enviados correctamente',
            count: req.files.length,
            timestamp: new Date()
        });

    } catch (error) {
        console.error('Error al enviar PDFs:', error);
        res.status(500).json({
            success: false,
            message: 'Error al enviar los PDFs',
            error: error.message
        });
    }
});

// Ruta para verificar el estado del servicio
router.get('/status', async (req, res) => {
    try {
        await transporter.verify();
        res.json({
            status: 'ok',
            message: 'Servicio de PDF funcionando correctamente'
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Servicio de PDF no disponible',
            error: error.message
        });
    }
});

module.exports = router;