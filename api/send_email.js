// api/send-email.js

const nodemailer = require('nodemailer');
const { MongoClient } = require('mongodb');
const { format } = require('date-fns');
require('dotenv').config();

const sendEmail = async (mailOptions) => {
    try {
        const transporter = nodemailer.createTransport({
            host: 'mta.extendcp.co.uk',
            port: 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
        throw error; // Re-throw to handle in the main function
    }
};

const saveToDatabase = async (newEntry) => {
    try {
        const client = new MongoClient(process.env.MONGODB_URI);
        await client.connect();
        const db = client.db('formResponses');
        const collection = db.collection('submissions');

        await collection.insertOne(newEntry);

        await client.close();

        console.log('Data saved to database successfully');
    } catch (error) {
        console.error('Error saving to MongoDB:', error);
        throw error; // Re-throw to handle in the main function
    }
};

export default async function (req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { name, email, agency, years, affiliations, "sold-cuba": soldCuba, "who-used": whoUsed, "client-spend": clientSpend, "fam-interest": famInterest, interest } = req.body;

    const mailOptions = {
        from: 'yo@ctu.com',
        to: "sales@cubaprivatetravel.com",
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

    try {
        // Ejecutar enviar correo y guardar en la base de datos en paralelo
        await Promise.all([
            sendEmail(mailOptions),
            saveToDatabase(newEntry)
        ]);

        return res.status(200).json({ message: 'Form submitted successfully' });
    } catch (error) {
        console.error('Error processing form submission:', error);
        return res.status(500).json({ message: 'Error processing form submission' });
    }
}
