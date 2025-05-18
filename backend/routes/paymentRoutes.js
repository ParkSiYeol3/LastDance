// ✅ routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// ✅ 보증금 결제 관련 라우트
router.post('/create-intent', paymentController.createPaymentIntent);     // 결제 생성
router.post('/confirm-payment', paymentController.confirmRefund);        // 결제 수동 완료 상태 갱신
router.post('/auto-refund', paymentController.autoRefundByItem);          // 자동 환불
router.get('/user-payments/:userId', paymentController.getUserPayments);  // 결제 내역 조회
router.get('/status', paymentController.getPaymentStatus);                // 결제 상태 조회

module.exports = router;
