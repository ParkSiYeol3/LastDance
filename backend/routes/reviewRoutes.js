const express = require('express');
const router = express.Router();
const { addReview , getReceivedReviews,
  getWrittenReviews,
  getAverageRating,
  checkReviewExists } = require('../controllers/reviewController');

// POST /api/reviews
router.post('/', addReview);
router.get('/received/:userId', getReceivedReviews); // 내가 받은 리뷰
router.get('/written/:userId', getWrittenReviews);   // 내가 작성한 리뷰
router.get('/average/:userId', getAverageRating);
router.get('/check', checkReviewExists); // ✅ 추가된 라우트

module.exports = router;
