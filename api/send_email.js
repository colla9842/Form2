const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const { parse } = require('json2csv');

export default async function (req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { name, email, agency, years, affiliations, "sold-cuba": soldCuba, "who-used": whoUsed, "client-spend": clientSpend, "fam-interest": famInterest, interest } = req.body;

    // Save the form data to a CSV file
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

    try {
        // Check if the CSV file exists
        if (fs.existsSync(csvFilePath)) {
            const csv = parse([newEntry], { header: false });
            fs.appendFileSync(csvFilePath, `\n${csv}`, 'utf8');
        } else {
            const csv = parse([newEntry], { header: true });
            fs.writeFileSync(csvFilePath, csv, 'utf8');
        }
    } catch (error) {
        console.error('Error saving to CSV:', error);
        return res.status(500).json({ message: 'Error saving data' });
    }

    // Configure Nodemailer transporter
    const transporter = nodemailer.createTransport({
        host: 'mta.extendcp.co.uk', // SMTP host
        port: 587, // or 465 for SSL
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER, // Your email here
            pass: process.env.EMAIL_PASS, // Your password here
        },
    });

    // Create the email message
    const mailOptions = {
        from: email,
        to: process.env.EMAIL_RECEIVER, // The email where you want to receive messages
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

    // Send the email
    try {
        await transporter.sendMail(mailOptions);
        return res.status(200).json({ message: 'Form submitted successfully' });
    } catch (error) {
        console.error('Error sending email:', error);
        return res.status(500).json({ message: 'Error sending email' });
    }
}
