// routes/chatRoutes.js
const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const authenticate = require('../middleware/authMiddleware');

// 채팅방 생성
router.post('/start', chatController.startChat);

// 내 채팅방 목록 조회
router.get('/rooms/:userId', chatController.getUserChatRooms);

// 상대방 프로필 포함된 채팅방 목록 조회 (로그인 필요)
router.get('/rooms/with-profile', authenticate, chatController.getChatRoomsWithProfile);

// 메시지 전송 (로그인 필요)
router.post(
  '/rooms/:roomId/messages',
  authenticate,
  chatController.sendMessage
);

// 메시지 조회 (로그인 필요)
router.get(
  '/rooms/:roomId/messages',
  authenticate,
  chatController.getMessages
);

// 메시지 읽음 처리 (로그인 필요)
router.post(
  '/rooms/:roomId/messages/:messageId/read',
  authenticate,
  chatController.markMessageAsRead
);

// participants 필드 추가/갱신용
router.post('/rooms/add-participants', chatController.addParticipants);

module.exports = router;
