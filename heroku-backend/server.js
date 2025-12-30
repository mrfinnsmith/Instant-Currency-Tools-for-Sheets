require('dotenv').config();
const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
const heroku_URL = process.env.HEROKU_URL;

app.use(cors({
  origin: [process.env.ORIGIN_URL],
}));

app.use(express.static('public'));

app.post('/create-checkout-session', async (req, res) => {
  console.log(`[${new Date().toISOString()}] Checkout request received from: ${req.headers.origin}`);
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_creation: 'always',
      line_items: [{
        price: process.env.STRIPE_PRICE_ID,
        quantity: 1,
      }],
      mode: 'payment',
      success_url: 'https://instantcurrency.tools/thank-you/',
      cancel_url: 'https://instantcurrency.tools/pricing/',
    });
    console.log(`[${new Date().toISOString()}] Checkout session created successfully: ${session.id}`);
    res.json({ url: session.url });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error creating checkout session: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

const port = process.env.PORT || 4242;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});