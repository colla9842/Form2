// api/send-email.js

const nodemailer = require('nodemailer');

export default async function (req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { name, email, agency, years, affiliations, soldCuba, whoUsed, clientSpend, famInterest, interest } = req.body;

    // Configurar el transportador de Nodemailer
    const transporter = nodemailer.createTransport({
        service: 'Gmail', // O usa cualquier otro servicio de correo como SendGrid, Mailgun, etc.
        auth: {
            user: process.env.EMAIL_USER, // Coloca tu correo aquí
            pass: process.env.EMAIL_PASS, // Coloca tu contraseña aquí
        },
    });

    // Crear el mensaje de correo
    const mailOptions = {
        from: email,
        to: process.env.EMAIL_RECEIVER, // El correo donde quieres recibir los mensajes
        subject: 'Nuevo Formulario de Interés FAM',
        text: `
        Nombre: ${name}
        Email: ${email}
        Agencia: ${agency}
        Años de Experiencia: ${years}
        Afiliaciones: ${affiliations}
        ¿Ha vendido Cuba antes?: ${soldCuba}
        ¿A quién usó?: ${whoUsed}
        Gasto Diario por Cliente: ${clientSpend}
        Interés en FAM: ${famInterest}
        Razón de Interés: ${interest}
        `,
    };

    // Enviar el correo
    try {
        await transporter.sendMail(mailOptions);
        return res.status(200).json({ message: 'Formulario enviado correctamente.' });
    } catch (error) {
        console.error('Error al enviar el correo:', error);
        return res.status(500).json({ message: 'Hubo un error al enviar el formulario.' });
    }
}
