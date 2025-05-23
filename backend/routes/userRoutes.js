const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const db = admin.firestore();

router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const doc = await db.collection('users').doc(userId).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }
    const user = doc.data();
    res.json({
      nickname: user.nickname || '사용자',
      profileImage: user.profileImage || null,
    });
  } catch (err) {
    console.error('사용자 조회 실패:', err);
    res.status(500).json({ error: '서버 오류' });
  }
});

module.exports = router;
