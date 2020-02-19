/* Load env variables */
require('dotenv').config();

const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const bodyParser = require('body-parser');
const handlebars = require('express-handlebars');

const { sendBook } = require('./mailer');

/* Price should be specified in cents */
const BOOK_PRICE = 1500;
const BOOK_DESCRIPTION = 'Secret Knowledge Ebook';
const CURRENCY = 'usd';

const SUCCEEDED_MESSAGE = 'Your ebook should be emailed to you.';
const FAILED_MESSAGE = 'Please give it another try.';

const app = express();

app.engine('handlebars', handlebars({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(`${__dirname}/public`));

app.get('/', (req, res) => res.render('index', {
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
}));

app.post('/charge', async (req, res) => {
    const customer = await stripe.customers.create({
        email: req.body.stripeEmail,
        source: req.body.stripeToken
    });

    const charge = await stripe.charges.create({
        amount: BOOK_PRICE,
        description: BOOK_DESCRIPTION,
        currency: CURRENCY,
        customer: customer.id
    });

    const status = charge.status[0].toUpperCase() + charge.status.slice(1) + '!';

    let message = FAILED_MESSAGE;

    if (charge.status === 'succeeded') {
        message = SUCCEEDED_MESSAGE;
        await sendBook('yaroslavkuts@gmail.com');
    }

    return res.render('result', { status, message });
})

const port = process.env.PORT || 5000;

app.listen(port, (e) => {
    if (e) console.error(e)
    console.log(`Server up and running on the port: ${port}`);
})

