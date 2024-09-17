// api/send-email.js

const nodemailer = require('nodemailer');
const { MongoClient } = require('mongodb');
const { format } = require('date-fns');
require('dotenv').config();

export default async function (req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { name, email, agency, years, affiliations, "sold-cuba": soldCuba, "who-used": whoUsed, "client-spend": clientSpend, "fam-interest": famInterest, interest } = req.body;

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
        Affiliations: ${affiliations}
        Sold Cuba?: ${soldCuba}
        Who use?: ${whoUsed}
        Daily spent per client: ${clientSpend}
        FAM: ${famInterest}
        Interest description: ${interest}
        `,
    };

    // Crear una nueva entrada de datos
    const newEntry = {
        Name: name,
        Email: email,
        Agency: agency,
        ExperienceYears: years,
        Affiliations: affiliations,
        SoldCuba: soldCuba,
        WhoUsed: whoUsed,
        DailySpendPerClient: clientSpend,
        FAM: famInterest,
        InterestDescription: interest,
        Timestamp: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
    };

    // Crear el transporter de Nodemailer
    const transporter = nodemailer.createTransport({
        host: 'mta.extendcp.co.uk', // SMTP host
        port: 587, // or 465 for SSL
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER, // Coloca tu correo aquí
            pass: process.env.EMAIL_PASS, // Coloca tu contraseña aquí
        },
    });

    const sendEmail = async () => {
        try {
            await transporter.sendMail(mailOptions);
            console.log('Email sent successfully');
        } catch (error) {
            console.error('Error sending email:', error);
        }
    };

    const saveToDatabase = async () => {
        try {
            // Conectar a MongoDB
            const client = new MongoClient(process.env.MONGODB_URI);
            await client.connect();
            const db = client.db('formResponses');
            const collection = db.collection('submissions');

            // Insertar datos en la colección
            await collection.insertOne(newEntry);

            // Cerrar la conexión a la base de datos
            await client.close();

            console.log('Data saved to database successfully');
        } catch (error) {
            console.error('Error saving to MongoDB:', error);
        }
    };

    try {
        // Ejecutar ambas operaciones en paralelo
        await Promise.all([sendEmail(), saveToDatabase()]);

        return res.status(200).json({ message: 'Form submitted successfully' });
    } catch (error) {
        console.error('Error processing form submission:', error);
        return res.status(500).json({ message: 'Error processing form submission' });
    }
}
