const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const { parse } = require('json2csv');

export default async function (req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { name, email, agency, years, affiliations, soldCuba, whoUsed, clientSpend, famInterest, interest } = req.body;

    // Configure the Nodemailer transporter
    const transporter = nodemailer.createTransport({
        host: 'mta.extendcp.co.uk',
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    // Create the email message
    const mailOptions = {
        from: '"Cuba Private Travel" <noreply@yourdomain.com>', // Use a controlled domain email
        to: process.env.EMAIL_RECEIVER,
        subject: 'New Form FAM Interest',
        text: `
        Name: ${name}
        Email: ${email}
        Agency: ${agency}
        Experience Years: ${years}
        Affiliations: ${affiliations}
        Sold Cuba?: ${soldCuba}
        Who use?: ${whoUsed}
        Daily spend per client: ${clientSpend}
        FAM: ${famInterest}
        Interest description: ${interest}
        `,
    };

    // Try sending the email
    try {
        await transporter.sendMail(mailOptions);

        // Save the response to a CSV file
        const csvFilePath = path.join(process.cwd(), 'responses.csv');
        const newEntry = {
            name,
            email,
            agency,
            years,
            affiliations,
            soldCuba,
            whoUsed,
            clientSpend,
            famInterest,
            interest
        };

        // If the CSV file exists, append the data, otherwise create a new file
        if (fs.existsSync(csvFilePath)) {
            const csv = parse([newEntry], { header: false });
            fs.appendFileSync(csvFilePath, `\n${csv}`, 'utf8');
        } else {
            const csv = parse([newEntry], { header: true });
            fs.writeFileSync(csvFilePath, csv, 'utf8');
        }

        return res.status(200).json({ message: 'Form submitted successfully.' });
    } catch (error) {
        console.error('Error sending email:', error);

        // Ensure the data is saved even if the email fails
        const csvFilePath = path.join(process.cwd(), 'responses.csv');
        const newEntry = {
            name,
            email,
            agency,
            years,
            affiliations,
            soldCuba,
            whoUsed,
            clientSpend,
            famInterest,
            interest
        };

        if (fs.existsSync(csvFilePath)) {
            const csv = parse([newEntry], { header: false });
            fs.appendFileSync(csvFilePath, `\n${csv}`, 'utf8');
        } else {
            const csv = parse([newEntry], { header: true });
            fs.writeFileSync(csvFilePath, csv, 'utf8');
        }

        return res.status(500).json({ message: 'There was an error submitting the form.' });
    }
}
