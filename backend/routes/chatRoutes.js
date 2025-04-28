// routes/chatRoutes.js
const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const authenticate = require('../middleware/authMiddleware');

// 채팅방 생성
router.post('/start', chatController.startChat);

// ✨ 프로필 포함 채팅방 목록 조회 (로그인 필요)
//    이 라우트를 /rooms/:userId 보다 위에 둬야 제대로 매칭됩니다.
router.get(
  '/rooms/with-profile',
  authenticate,
  chatController.getChatRoomsWithProfile
);

// 내 채팅방 목록 조회 (userId 경로 파라미터)
router.get('/rooms/:userId', chatController.getUserChatRooms);

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
