const admin = require('firebase-admin');
const db = admin.firestore();

exports.getSentimentSummary = async (req, res) => {
  try {
    const snapshot = await db.collection('reviews').get();
    const stats = {};

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const sellerId = data.sellerId;
      const sentiment = data.sentiment || 'neutral';
      if (!sellerId) continue;

      if (!stats[sellerId]) {
        stats[sellerId] = { positive: 0, negative: 0, neutral: 0, count: 0 };
      }
      stats[sellerId][sentiment] += 1;
      stats[sellerId].count += 1;
    }

    const results = await Promise.all(
      Object.entries(stats).map(async ([sellerId, counts]) => {
        const userDoc = await db.collection('users').doc(sellerId).get();
        const userData = userDoc.exists ? userDoc.data() : {};
        return {
          sellerId,
          nickname: userData.nickname || '알 수 없음',
          profileImage: userData.profileImage || null,
          ...counts,
        };
      })
    );

    res.json(results);
  } catch (err) {
    console.error('감정 통계 오류:', err);
    res.status(500).json({ error: '서버 오류' });
  }
};