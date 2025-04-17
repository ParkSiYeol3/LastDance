const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const authenticate = require('../middleware/authMiddleware');

router.post('/start', chatController.startChat);        // 채팅방 생성
router.post('/send', chatController.sendMessage);       // 메시지 전송
router.get('/rooms/:userId', chatController.getUserChatRooms); // 사용자 채팅 기록
router.post('/rooms/:roomId/messages', authenticate, chatController.sendMessage); // 채팅 메시지 저장
// 채팅 메시지 조회
router.get('/rooms/:roomId/messages', authenticate, chatController.getMessages);
// 메시지 읽음 처리 기능
router.post(
    '/rooms/:roomId/messages/:messageId/read',
    authenticate,
    chatController.markMessageAsRead
  );   

module.exports = router;
