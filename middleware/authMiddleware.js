const admin = require('../firebase/admin');

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: '인증 토큰이 없습니다.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = await admin.auth().verifyIdToken(token); // Firebase UID 검증
    console.log('🔥 인증된 UID:', decoded.uid); // ← 여기 추가
    req.user = { uid: decoded.uid };
    next();
  } catch (error) {
    console.error('❌ Firebase 인증 실패:', error);
    res.status(401).json({ error: '인증 실패' });
  }
};

module.exports = authMiddleware;
