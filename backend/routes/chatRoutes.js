const express = require('express');
const router = express.Router();
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

module.exports = router;
