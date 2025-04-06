const express = require('express');
const router = express.Router();
const { createPaymentIntent, confirmRefund } = require('../controllers/paymentController');

router.post('/create-payment-intent', createPaymentIntent);
router.post('/refund', confirmRefund);

module.exports = router;
