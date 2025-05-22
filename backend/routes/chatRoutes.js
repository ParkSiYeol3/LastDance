const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middleware/authMiddleware'); // 미들웨어 임포트

// 채팅방 생성
router.post('/start', authMiddleware, chatController.startChat);

// 채팅방 목록 조회 (사용자 프로필 포함)
router.get('/rooms/with-profile', authMiddleware, chatController.getChatRoomsWithProfile);

// 사용자 채팅방 목록 조회
router.get('/rooms/:userId', authMiddleware, chatController.getUserChatRooms);

// 채팅 메시지 조회
router.get('/rooms/:roomId/messages', authMiddleware, chatController.getMessages);

// 메시지 전송
router.post('/rooms/:roomId/messages', authMiddleware, chatController.sendMessage);

// 메시지 읽음 처리
router.post('/rooms/:roomId/messages/:messageId/read', authMiddleware, chatController.markMessageAsRead);

// ✅ 자동 메시지 전송 라우트
router.post('/:roomId/auto-message', async (req, res) => {
	const { roomId } = req.params;
	const { text, senderId } = req.body;

	console.log('📥 자동 메시지 전송 대상 Room:', roomId);
	console.log('📨 메시지 내용:', text, senderId);
	console.log('📍 저장 위치 → chatRooms /', roomId, '/ messages');

	try {
		const messageRef = admin
			.firestore()
			.collection('chatRooms') // ✅ 반드시 chatRooms
			.doc(roomId)
			.collection('messages'); // ✅ 하위 컬렉션 messages

		const result = await messageRef.add({
			text,
			senderId,
			createdAt: admin.firestore.FieldValue.serverTimestamp(),
			system: true,
		});

		console.log('✅ 자동 메시지 Firestore 등록됨. ID:', result.id);
		res.status(200).json({ success: true });
	} catch (err) {
		console.error('❌ 자동 메시지 등록 실패:', err);
		res.status(500).json({ error: '자동 메시지 실패' });
	}
});

module.exports = router;
