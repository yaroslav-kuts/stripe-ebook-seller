const fs = require("fs");

const pathToBook = `${__dirname}/files/secret-book.pdf`;
const attachment = fs.readFileSync(pathToBook).toString("base64");

const sendgrid = require('@sendgrid/mail');

sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

const FROM_EMAIL = 'pseudo-science@media.com';
const SUBJECT = 'Secret Knowledge Ebook';
const TEXT = 'Your ebook attached to this email.';
const FILENAME = 'secret-book.pdf';

const sendBook = async (to) => {
    const mail = {
        to,
        from: FROM_EMAIL,
        subject: SUBJECT,
        text: TEXT,
        attachments: [
            {
                content: attachment,
                filename: FILENAME,
                type: 'application/pdf',
                disposition: 'attachment',
            }
        ],
    };

    try {
        await sendgrid.send(mail);
        return { status: 'ok' };
    } catch(e) {
        console.error(e);
        return { status: 'failed' };
    }
}

module.exports = { sendBook };
