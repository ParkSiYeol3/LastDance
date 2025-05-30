const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// 관리자 전용: 판매자별 감정 통계
router.get('/sentiment-summary', adminController.getSentimentSummary);

module.exports = router;