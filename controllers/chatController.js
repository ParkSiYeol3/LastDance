const { admin, db } = require('../firebase/admin');
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

// 💬 메시지 전송 (roomId or chatRoomId 모두 허용)
exports.sendMessage = async (req, res) => {
  const { text, senderId, chatRoomId, roomId } = req.body;
  const resolvedRoomId = chatRoomId || roomId;

  if (!text || !senderId || !resolvedRoomId) {
    return res.status(400).json({ error: 'text, senderId, roomId(chatRoomId) 가 필요합니다.' });
  }

  try {
    const messageData = {
      senderId,
      text,
      sentAt: new Date(),
    };

    // ✅ 메시지 저장
    await db.collection('chatRooms')
      .doc(resolvedRoomId)
      .collection('messages')
      .add(messageData);

    // ✅ 마지막 메시지 갱신 or 생성 (문서가 없어도 에러 없음)
    await db.collection('chatRooms')
      .doc(resolvedRoomId)
      .set(
        { lastMessage: text },
        { merge: true } // 🔥 없으면 생성, 있으면 필드만 갱신
      );

    res.json({ message: '메시지 저장 성공' });
  } catch (err) {
    console.error('❌ 메시지 저장 오류:', err);
    res.status(500).json({ error: '메시지 저장 실패' });
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
  
  // 📄 채팅 메시지 조회
exports.getMessages = async (req, res) => {
    const { roomId } = req.params;
  
    if (!roomId) {
      return res.status(400).json({ error: 'roomId가 필요합니다.' });
    }
  
    try {
      const messagesSnapshot = await db
        .collection('chatRooms')
        .doc(roomId)
        .collection('messages')
        .orderBy('createdAt', 'asc')
        .get();
  
      const messages = messagesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
  
      res.json({ messages });
    } catch (err) {
      console.error('❌ 메시지 조회 오류:', err.message);
      res.status(500).json({ error: '메시지를 가져오지 못했습니다.' });
    }
  };

// 메시지 읽음 처리
  exports.markMessageAsRead = async (req, res) => {
    const { roomId, messageId } = req.body;
  
    try {
      await db.collection('chatRooms')           // ✅ 수정 포인트
        .doc(roomId)
        .collection('messages')
        .doc(messageId)
        .update({
          isRead: true
        });
  
      res.json({ message: '읽음 처리 완료' });
    } catch (err) {
      console.error('❌ 읽음 처리 실패:', err);
      res.status(500).json({ error: '읽음 처리 실패' });
    }
  };

  // GET /api/chat/rooms/:userId
exports.getChatRoomsWithSummary = async (req, res) => {
  const { userId } = req.params;

  try {
    const snapshot = await db.collection('chatRooms')
      .where('participants', 'array-contains', userId)
      .get();

    const rooms = [];

    for (const doc of snapshot.docs) {
      const roomData = doc.data();
      const chatRoomId = doc.id;

      // 🔎 읽지 않은 메시지 수 계산
      const unreadSnapshot = await db.collection('messages')
        .doc(chatRoomId)
        .collection('chat')
        .where('senderId', '!=', userId)
        .where('isRead', '==', false)
        .get();

      rooms.push({
        chatRoomId,
        lastMessage: roomData.lastMessage || '',
        lastMessageTime: roomData.createdAt?.toDate() || null,
        unreadCount: unreadSnapshot.size,
        participants: roomData.participants
      });
    }

    res.json({ rooms });
  } catch (err) {
    console.error('❌ 채팅방 목록 조회 실패:', err);
    res.status(500).json({ error: '채팅방 목록 조회 실패' });
  }
};

// 💬 상대방 프로필 포함한 채팅방 목록 조회
exports.getChatRoomsWithProfile = async (req, res) => {
  const currentUserId = req.user.uid;
  console.log('🔑 현재 로그인한 사용자 UID:', currentUserId);

  try {
    const snapshot = await db
      .collection('chatRooms')
      .where('participants', 'array-contains', currentUserId)
      .get();

    console.log('📦 찾은 채팅방 수:', snapshot.size);

    if (snapshot.empty) {
      return res.json({ rooms: [] });
    }

    const rooms = await Promise.all(snapshot.docs.map(async doc => {
      const roomData = doc.data();
      const roomId = doc.id;

      const opponentId = roomData.participants.find(uid => uid !== currentUserId);
      console.log(`🧍 상대방 UID for room ${roomId}:`, opponentId);

      let opponentProfile = { uid: opponentId, nickname: '알 수 없음', profileImage: null };

      if (opponentId) {
        const userDoc = await db.collection('users').doc(opponentId).get();
        if (userDoc.exists) {
          const userData = userDoc.data();
          opponentProfile = {
            uid: opponentId,
            nickname: userData.nickname || '이름없음',
            profileImage: userData.profileImage || null,
          };
        } else {
          console.warn(`⚠️ 상대방 정보 없음: ${opponentId}`);
        }
      }

      return {
        id: roomId,
        rentalItemId: roomData.rentalItemId || null,
        lastMessage: roomData.lastMessage || '',
        createdAt: roomData.createdAt || null,
        opponent: opponentProfile,
      };
    }));

    res.json({ rooms });
  } catch (err) {
    console.error('❌ 채팅방 조회 오류:', err);
    res.status(500).json({ error: '채팅방 목록 조회 실패' });
  }
};


// participants 필드 추가/갱신용
exports.addParticipants = async (req, res) => {
  const { roomId, participants } = req.body;

  if (!roomId || !participants || !Array.isArray(participants)) {
    return res.status(400).json({ error: 'roomId와 participants(Array)가 필요합니다.' });
  }

  try {
    await db.collection('chatRooms').doc(roomId).set(
      { participants },
      { merge: true } // 필드만 병합 (문서가 있어도 덮어쓰지 않음)
    );

    res.json({ message: 'participants 필드 추가 완료' });
  } catch (err) {
    console.error('❌ participants 필드 추가 오류:', err.message);
    res.status(500).json({ error: '추가 실패' });
  }
};

