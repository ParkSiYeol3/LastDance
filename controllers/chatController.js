const { db } = require('../firebase/admin');
const { v4: uuidv4 } = require('uuid');

// 채팅방 생성 또는 기존 채팅방 반환
exports.startChat = async (req, res) => {
  const { userId1, userId2, rentalItemId } = req.body;

  try {
    // 기존 채팅방 있는지 확인
    const snapshot = await db.collection('chatRooms')
      .where('participants', 'in', [[userId1, userId2], [userId2, userId1]])
      .where('rentalItemId', '==', rentalItemId)
      .limit(1)
      .get();

    if (!snapshot.empty) {
      const chatRoom = snapshot.docs[0];
      return res.json({ chatRoomId: chatRoom.id, message: '기존 채팅방 있음' });
    }

    // 새로운 채팅방 생성
    const newChatRef = await db.collection('chatRooms').add({
      participants: [userId1, userId2],
      rentalItemId,
      createdAt: new Date(),
      lastMessage: ''
    });

    res.json({ chatRoomId: newChatRef.id, message: '새 채팅방 생성됨' });
  } catch (err) {
    console.error('❌ 채팅방 생성 오류:', err);
    res.status(500).json({ error: err.message });
  }
};

// 메시지 전송
exports.sendMessage = async (req, res) => {
  const { chatRoomId, senderId, text } = req.body;

  if (!chatRoomId || !senderId || !text) {
    return res.status(400).json({ error: 'chatRoomId, senderId, text는 필수입니다.' });
  }

  try {
    const messageData = {
      senderId,
      text,
      sentAt: new Date()
    };

    // 메시지 저장
    await db.collection('messages').doc(chatRoomId).collection('chat').add(messageData);

    // 마지막 메시지 업데이트
    await db.collection('chatRooms').doc(chatRoomId).update({
      lastMessage: text,
    });

    res.json({ message: '메시지 전송 성공' });
  } catch (err) {
    console.error('❌ 메시지 전송 오류:', err);
    res.status(500).json({ error: err.message });
  }
};

// 나의 채팅방 목록 조회
exports.getUserChatRooms = async (req, res) => {
    const { userId } = req.params;
  
    if (!userId) {
      return res.status(400).json({ error: 'userId가 필요합니다.' });
    }
  
    try {
      const snapshot = await db.collection('chatRooms')
        .where('participants', 'array-contains', userId)
        .orderBy('createdAt', 'desc')
        .get();
  
      const rooms = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
  
      res.json({ rooms });
    } catch (err) {
      console.error('❌ 채팅방 목록 조회 오류:', err.message);
      res.status(500).json({ error: err.message });
    }
  };

// 채팅 메시지 저장 
exports.sendMessage = async (req, res) => {
    const { text } = req.body;
    const senderId = req.user?.uid;
    const { roomId } = req.params;
  
    if (!text || !senderId || !roomId) {
      return res.status(400).json({ error: 'text, senderId, roomId가 필요합니다.' });
    }
  
    try {
      await db.collection('chatRooms')
        .doc(roomId)
        .collection('messages')
        .add({
          senderId,
          text,
          timestamp: new Date(),
        });
  
      res.json({ message: '메시지 저장 성공' });
    } catch (err) {
      console.error('❌ 메시지 저장 오류:', err);
      res.status(500).json({ error: err.message });
    }
  };
  
  