const admin = require('firebase-admin');
const db = admin.firestore();

exports.addReview = async (req, res) => {
  const {
    reviewerId,
    targetUserId,
    role,         // 'renter' or 'seller'
    rating,
    summary,
    content,
    tags,
  } = req.body;

  if (!reviewerId || !targetUserId || !role || !rating || !content) {
    return res.status(400).json({ error: '필수 필드가 누락되었습니다.' });
  }

  try {
    const reviewData = {
      reviewerId,
      targetUserId,
      role,
      rating,
      summary: summary || '',
      content,
      tags: tags || [],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };
     
    // ✅ role 기반으로 buyerId / sellerId 필드 설정
    if (role === 'buyer') {
    reviewData.buyerId = targetUserId;
    reviewData.sellerId = reviewerId;
    } else if (role === 'seller') {
    reviewData.buyerId = reviewerId;
    reviewData.sellerId = targetUserId;
    }


    const docRef = await db.collection('reviews').add(reviewData);

    res.status(201).json({ message: '리뷰가 저장되었습니다.', reviewId: docRef.id });
  } catch (err) {
    console.error('리뷰 저장 실패:', err);
    res.status(500).json({ error: '리뷰 저장 중 오류가 발생했습니다.' });
  }
};

// 내가 받은 리뷰 조회 
exports.getReceivedReviews = async (req, res) => {
  const { userId } = req.params;

  try {
    const snapshot = await db.collection('reviews')
      .where('targetUserId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

    const reviews = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const review = doc.data();
        const userDoc = await db.collection('users').doc(review.reviewerId).get();
        const userData = userDoc.exists ? userDoc.data() : {};
        return {
          id: doc.id,
          ...review,
          reviewerProfile: {
            nickname: userData.nickname || '알 수 없음',
            profileImage: userData.profileImage || null,
          },
        };
      })
    );

    res.json({ reviews });
  } catch (err) {
    console.error('받은 리뷰 조회 실패:', err);
    res.status(500).json({ error: '리뷰 조회 중 오류 발생' });
  }
};

// 내가 작성한 리뷰 조회 
exports.getWrittenReviews = async (req, res) => {
  const { userId } = req.params;

  try {
    const snapshot = await db.collection('reviews')
      .where('reviewerId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

    const reviews = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ reviews });
  } catch (err) {
    console.error('작성한 리뷰 조회 실패:', err);
    res.status(500).json({ error: '작성한 리뷰 조회 중 오류가 발생했습니다.' });
  }
};

// 평균 별점 계산
exports.getAverageRating = async (req, res) => {
  const { userId } = req.params;

  try {
    const snapshot = await db.collection('reviews')
      .where('targetUserId', '==', userId)
      .get();

    const reviews = snapshot.docs.map(doc => doc.data());
    if (reviews.length === 0) {
      return res.json({ average: 0, count: 0 });
    }

    const total = reviews.reduce((sum, r) => sum + (r.rating || 0), 0);
    const average = total / reviews.length;

    res.json({ average: parseFloat(average.toFixed(2)), count: reviews.length });
  } catch (err) {
    console.error('평균 별점 조회 실패:', err);
    res.status(500).json({ error: '평균 별점 계산 오류' });
  }
};

//리뷰 중복 작성 방지 
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

    const exists = !snapshot.empty;
    res.json({ exists });
  } catch (err) {
    console.error('리뷰 존재 확인 실패:', err);
    res.status(500).json({ error: '리뷰 존재 확인 중 오류 발생' });
  }
};