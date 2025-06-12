const axios = require('axios');
const admin = require('firebase-admin');
const db = admin.firestore();

const FLASK_URL = 'http://192.168.0.6:8083/predict'; // 또는 실제 서버 주소로 수정

// 리뷰 저장 (감정 분석 포함)
exports.addReview = async (req, res) => {
  const {
    reviewerId,
    targetUserId,
    role,
    rating,
    summary,
    content,
    tags,
    rentalItemId,
  } = req.body;

  if (!reviewerId || !targetUserId || !role || !rating || !content || !rentalItemId) {
    return res.status(400).json({ error: '필수 필드가 누락되었습니다.' });
  }

  try {
    // Flask 감정 분석 요청
    let sentiment = 'neutral';
    try {
      const flaskRes = await axios.post(FLASK_URL, { text: content });
      sentiment = flaskRes.data?.label || 'neutral';
    } catch (flaskErr) {
      console.error('⚠️ Flask 감정 분석 실패:', flaskErr.message);
    }

    const reviewData = {
      reviewerId,
      targetUserId,
      role,
      rating,
      summary: summary || '',
      content,
      tags: tags || [],
      rentalItemId,
      sentiment,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    if (role === 'buyer') {
      reviewData.buyerId = targetUserId;
      reviewData.sellerId = reviewerId;
    } else if (role === 'seller') {
      reviewData.buyerId = reviewerId;
      reviewData.sellerId = targetUserId;
    }

    const docRef = await db.collection('reviews').add(reviewData);

    // 평점 반영
    const itemRef = db.collection('items').doc(rentalItemId);
    const itemSnap = await itemRef.get();

    if (itemSnap.exists) {
      const itemData = itemSnap.data();
      const prevRating = itemData.rating || 0;
      const prevCount = itemData.ratingCount || 0;
      const newCount = prevCount + 1;
      const newAverage = ((prevRating * prevCount) + rating) / newCount;

      await itemRef.update({
        rating: parseFloat(newAverage.toFixed(2)),
        ratingCount: newCount,
      });
    }

    res.status(201).json({
      message: '리뷰 저장 및 감정 분석 완료',
      reviewId: docRef.id,
      sentiment,
    });
  } catch (err) {
    console.error('리뷰 저장 실패:', err);
    res.status(500).json({ error: '리뷰 저장 중 오류' });
  }
};

// 받은 리뷰 조회
exports.getReceivedReviews = async (req, res) => {
  const { userId } = req.params;

  try {
    const snapshot = await db.collection('reviews')
      .where('targetUserId', '==', userId)
      .get();

    const reviews = await Promise.all(snapshot.docs.map(async (doc) => {
      const review = doc.data();

      let reviewerProfile = { nickname: '알 수 없음', profileImage: null };
      const userDoc = await db.collection('users').doc(review.reviewerId).get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        reviewerProfile = {
          nickname: userData.nickname || '알 수 없음',
          profileImage: userData.profileImage || null,
        };
      }

      let rentalItemName = '';
      const itemDoc = await db.collection('items').doc(review.rentalItemId).get();
      if (itemDoc.exists) rentalItemName = itemDoc.data().name || '';

      return {
        id: doc.id,
        ...review,
        reviewerProfile,
        rentalItemName,
      };
    }));

    res.json({ reviews });
  } catch (err) {
    console.error('받은 리뷰 조회 실패:', err);
    res.status(500).json({ error: '리뷰 조회 오류' });
  }
};

// 작성한 리뷰 조회
exports.getWrittenReviews = async (req, res) => {
  const { userId } = req.params;

  try {
    const snapshot = await db.collection('reviews')
      .where('reviewerId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

    const reviews = await Promise.all(snapshot.docs.map(async (doc) => {
      const review = doc.data();
      let rentalItemName = '';
      const itemDoc = await db.collection('items').doc(review.rentalItemId).get();
      if (itemDoc.exists) rentalItemName = itemDoc.data().name || '';

      return {
        id: doc.id,
        ...review,
        rentalItemName,
      };
    }));

    res.json({ reviews });
  } catch (err) {
    console.error('작성한 리뷰 조회 실패:', err);
    res.status(500).json({ error: '작성 리뷰 조회 오류' });
  }
};

// 평균 별점 조회
exports.getAverageRating = async (req, res) => {
  const targetUserId = req.params.userId;

  try {
    const snapshot = await db
      .collection('reviews')
      .where('targetUserId', '==', targetUserId)
      .get();

    const ratings = snapshot.docs.map(doc => doc.data().rating).filter(Boolean);

    const average =
      ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
        : 0;

    res.json({ average: Math.round(average * 10) / 10, count: ratings.length });
  } catch (err) {
    console.error('평균 별점 계산 실패:', err);
    res.status(500).json({ error: '평균 별점 조회 오류' });
  }
};

// 중복 리뷰 확인
exports.checkReviewExists = async (req, res) => {
  const { reviewerId, rentalItemId } = req.query;

  if (!reviewerId || !rentalItemId) {
    return res.status(400).json({ error: 'reviewerId와 rentalItemId는 필수입니다.' });
  }

  try {
    const snapshot = await db.collection('reviews')
      .where('reviewerId', '==', reviewerId)
      .where('rentalItemId', '==', rentalItemId)
      .limit(1)
      .get();

    res.json({ exists: !snapshot.empty });
  } catch (err) {
    console.error('중복 확인 실패:', err);
    res.status(500).json({ error: '중복 리뷰 확인 오류' });
  }
};
