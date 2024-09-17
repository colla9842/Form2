// api/send-email.js

const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const { format } = require('date-fns');
const { writeToPath } = require('@fast-csv/format');

export default async function (req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { name, email, agency, years, affiliations, "sold-cuba": soldCuba, "who-used": whoUsed, "client-spend": clientSpend, "fam-interest": famInterest, interest } = req.body;

    // Configurar el transportador de Nodemailer
    const transporter = nodemailer.createTransport({
        host: 'mta.extendcp.co.uk', // SMTP host
        port: 587, // or 465 for SSL
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER, // Coloca tu correo aquí
            pass: process.env.EMAIL_PASS, // Coloca tu contraseña aquí
        },
    });

    // Crear el mensaje de correo
    const mailOptions = {
        from: email,
        to: process.env.EMAIL_RECEIVER, // El correo donde quieres recibir los mensajes
        subject: 'New Form fam interest',
        text: `
        Name: ${name}
        Email: ${email}
        Agency: ${agency}
        Experience Years: ${years}
        Afiliations: ${affiliations}
        Sold Cuba?: ${soldCuba}
        Who use?: ${whoUsed}
        Daily spent per client: ${clientSpend}
        FAM: ${famInterest}
        interest description: ${interest}
        `,
    };

    // Ruta del archivo CSV
    const csvFilePath = path.resolve('data/form-submissions.csv');

    // Crear una nueva entrada de CSV
    const newEntry = {
        Name: name,
        Email: email,
        Agency: agency,
        'Experience Years': years,
        Affiliations: affiliations,
        'Sold Cuba?': soldCuba,
        'Who use?': whoUsed,
        'Daily spent per client': clientSpend,
        FAM: famInterest,
        'Interest description': interest,
        Timestamp: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
    };

    try {
        // Verifica si el archivo CSV ya existe
        const csvExists = fs.existsSync(csvFilePath);

        // Crear el archivo CSV si no existe
        if (!csvExists) {
            const csvStream = writeToPath(csvFilePath, [newEntry], { headers: true });
            await new Promise((resolve, reject) => {
                csvStream.on('finish', resolve);
                csvStream.on('error', reject);
            });
        } else {
            // Si el archivo CSV existe, append new data
            const csvStream = writeToPath(csvFilePath, [newEntry], { headers: false });
            await new Promise((resolve, reject) => {
                csvStream.on('finish', resolve);
                csvStream.on('error', reject);
            });
        }

        // Enviar el correo
        await transporter.sendMail(mailOptions);
        return res.status(200).json({ message: 'Form submitted successfully' });
    } catch (error) {
        console.error('Error sending email or saving CSV:', error);
        return res.status(500).json({ message: 'Error sending email or saving CSV' });
    }
}
