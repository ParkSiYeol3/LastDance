const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// 💳 결제 Intent 생성 (Stripe + Firestore 저장)
router.post('/create-payment-intent', paymentController.createPaymentIntent);

// 💸 환불 처리
router.post('/refund', paymentController.confirmRefund);

// 🧾 사용자 결제 내역 조회
router.get('/user/:userId', paymentController.getUserPayments);

module.exports = router;
