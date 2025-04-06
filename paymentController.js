const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.createPaymentIntent = async (req, res) => {
  const { amount } = req.body;
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'krw',
      payment_method_types: ['card']
    });
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.confirmRefund = async (req, res) => {
  const { paymentIntentId } = req.body;
  try {
    const refund = await stripe.refunds.create({ payment_intent: paymentIntentId });
    res.json({ refund });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
