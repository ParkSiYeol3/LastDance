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
    rentalItemId, // ✅ 반드시 포함되어야 함!
  } = req.body;

  if (!reviewerId || !targetUserId || !role || !rating || !content || !rentalItemId) {
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
      rentalItemId,
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

    // ✅ 리뷰 저장
    const docRef = await db.collection('reviews').add(reviewData);

    // ✅ 리뷰 저장 후 평점 업데이트
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

    res.status(201).json({ message: '리뷰가 저장되었고 평점이 반영되었습니다.', reviewId: docRef.id });
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
      // .orderBy('createdAt', 'desc') ← 주석 처리하여 오류 방지
      .get();

    const reviews = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const review = doc.data();

        // 👤 작성자 정보 가져오기
        let reviewerProfile = {
          nickname: '알 수 없음',
          profileImage: null,
        };
        if (review.reviewerId) {
          const userDoc = await db.collection('users').doc(review.reviewerId).get();
          if (userDoc.exists) {
            const userData = userDoc.data();
            reviewerProfile = {
              nickname: userData.nickname || '알 수 없음',
              profileImage: userData.profileImage || null,
            };
          }
        }

        // 🧥 아이템 이름 가져오기
        let rentalItemName = '';
        if (review.rentalItemId) {
          const itemDoc = await db.collection('items').doc(review.rentalItemId).get();
          if (itemDoc.exists) {
            rentalItemName = itemDoc.data().name || '';
          }
        }

        return {
          id: doc.id,
          ...review,
          reviewerProfile,
          rentalItemName,
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

    const reviews = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const review = doc.data();

        // 🧥 대여 아이템 이름 가져오기
        let rentalItemName = '';
        if (review.rentalItemId) {
          const itemDoc = await db.collection('items').doc(review.rentalItemId).get();
          rentalItemName = itemDoc.exists ? itemDoc.data().name || '' : '';
        }

        return {
          id: doc.id,
          ...review,
          rentalItemName, // ✅ 추가된 필드
        };
      })
    );

    res.json({ reviews });
  } catch (err) {
    console.error('작성한 리뷰 조회 실패:', err);
    res.status(500).json({ error: '작성한 리뷰 조회 중 오류가 발생했습니다.' });
  }
};

// 평균 별점 계산
exports.getAverageRating = async (req, res) => {
  const targetUserId = req.params.userId;
  console.log('[평균 별점 요청]', targetUserId); //

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
    res.status(500).json({ error: '평균 별점 조회 실패' });
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