// authMiddleware.js
const { admin } = require('../firebase/admin');

const authMiddleware = async (req, res, next) => {
	// Authorization 헤더에서 토큰 추출
	const authHeader = req.headers.authorization;
	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return res.status(401).json({ error: '인증 토큰이 없습니다.' });
	}

	const token = authHeader.split(' ')[1]; // "Bearer <token>"에서 토큰만 추출

	try {
		// Firebase에서 토큰 검증
		const decoded = await admin.auth().verifyIdToken(token);

		// 인증된 사용자의 정보를 req.user에 저장
		req.user = { uid: decoded.uid };
		next(); // 다음 미들웨어로 이동
	} catch (error) {
		console.error('❌ Firebase 인증 실패:', error);
		res.status(401).json({ error: '인증 실패' });
	}
};

module.exports = authMiddleware;
