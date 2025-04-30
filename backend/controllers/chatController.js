// controllers/chatController.js
const { admin, db } = require('../firebase/admin');
const { v4: uuidv4 } = require('uuid');
const { doc, getDoc, addDoc, collection, serverTimestamp, query, where, onSnapshot, deleteDoc, updateDoc, orderBy, getDocs } = require('firebase-admin/firestore');

/**
 * 채팅방 생성 또는 기존 채팅방 반환
 */
// controllers/chatController.js
exports.startChat = async (req, res) => {
	const { userId1, userId2, rentalItemId } = req.body;
	if (!userId1 || !userId2 || !rentalItemId) {
		return res.status(400).json({ error: 'userId1, userId2, rentalItemId 모두 필요합니다.' });
	}

	try {
		// 기존 채팅방 확인
		const snapshot = await db
			.collection('chatRooms')
			.where('participants', 'in', [
				[userId1, userId2],
				[userId2, userId1],
			])
			.where('rentalItemId', '==', rentalItemId)
			.limit(1)
			.get();

		if (!snapshot.empty) {
			const chatRoom = snapshot.docs[0];
			return res.json({ chatRoomId: chatRoom.id, message: '기존 채팅방 있음' });
		}

		// 새 채팅방 생성 (Firestore 자동 생성 방식)
		const newRef = await db.collection('chatRooms').add({
			rentalItemId,
			participants: [userId1, userId2],
			messages: [],
			createdAt: new Date(),
		});

		// 생성된 채팅방 ID 반환
		res.json({ chatRoomId: newRef.id, message: '새 채팅방 생성됨' });
	} catch (err) {
		console.error('❌ 채팅방 생성 오류:', err);
		res.status(500).json({ error: err.message });
	}
};

/**
 * 나의 채팅방 목록 조회
 */
exports.getUserChatRooms = async (req, res) => {
	const { userId } = req.params;
	if (!userId) {
		return res.status(400).json({ error: 'userId가 필요합니다.' });
	}

	try {
		const snapshot = await db.collection('chatRooms').where('participants', 'array-contains', userId).orderBy('createdAt', 'desc').get();

		const rooms = snapshot.docs.map((doc) => ({
			id: doc.id,
			...doc.data(),
		}));

		res.json({ rooms });
	} catch (err) {
		console.error('❌ 채팅방 목록 조회 오류:', err);
		res.status(500).json({ error: err.message });
	}
};

/**
 * 메시지 전송
 */
exports.sendMessage = async (req, res) => {
	const { text, senderId } = req.body;
	const { roomId } = req.params;
	if (!text || !senderId || !roomId) {
		return res.status(400).json({ error: 'text, senderId, roomId 모두 필요합니다.' });
	}

	try {
		const messageData = {
			senderId,
			text,
			sentAt: new Date(),
			isRead: false,
		};

		// messages 서브컬렉션에 추가
		await db.collection('chatRooms').doc(roomId).collection('messages').add(messageData);

		// 마지막 메시지 업데이트
		await db.collection('chatRooms').doc(roomId).set({ lastMessage: text }, { merge: true });

		res.json({ message: '메시지 저장 성공' });
	} catch (err) {
		console.error('❌ 메시지 저장 오류:', err);
		res.status(500).json({ error: '메시지 저장 실패' });
	}
};

/**
 * 채팅 메시지 조회
 */
exports.getMessages = async (req, res) => {
	const { roomId } = req.params;
	if (!roomId) {
		return res.status(400).json({ error: 'roomId가 필요합니다.' });
	}

	try {
		const snap = await db.collection('chatRooms').doc(roomId).collection('messages').orderBy('sentAt', 'asc').get();

		const messages = snap.docs.map((doc) => {
			const d = doc.data();
			return {
				id: doc.id,
				senderId: d.senderId,
				text: d.text,
				sentAt: d.sentAt.toDate().toISOString(),
				isRead: d.isRead || false,
			};
		});

		res.json({ messages });
	} catch (err) {
		console.error('❌ 메시지 조회 오류:', err);
		res.status(500).json({ error: '메시지를 가져오지 못했습니다.' });
	}
};

/**
 * 메시지 읽음 처리
 */
exports.markMessageAsRead = async (req, res) => {
	const { roomId, messageId } = req.params;
	if (!roomId || !messageId) {
		return res.status(400).json({ error: 'roomId와 messageId가 필요합니다.' });
	}

	try {
		await db.collection('chatRooms').doc(roomId).collection('messages').doc(messageId).update({ isRead: true });

		res.json({ message: '읽음 처리 완료' });
	} catch (err) {
		console.error('❌ 읽음 처리 실패:', err);
		res.status(500).json({ error: '읽음 처리 실패' });
	}
};

/**
 * 상대방 프로필 포함 채팅방 목록 조회
 */
exports.getChatRoomsWithProfile = async (req, res) => {
	const currentUserId = req.user.uid;

	try {
		const snapshot = await db.collection('chatRooms').where('participants', 'array-contains', currentUserId).get();

		const rooms = await Promise.all(
			snapshot.docs.map(async (doc) => {
				const roomData = doc.data();
				const roomId = doc.id;
				const opponentId = roomData.participants.find((uid) => uid !== currentUserId);

				let opponentProfile = { uid: opponentId, nickname: '알 수 없음', profileImage: null };
				if (opponentId) {
					const userDoc = await db.collection('users').doc(opponentId).get();
					if (userDoc.exists) {
						const u = userDoc.data();
						opponentProfile = {
							uid: opponentId,
							nickname: u.nickname || '이름없음',
							profileImage: u.profileImage || null,
						};
					}
				}

				return {
					id: roomId,
					rentalItemId: roomData.rentalItemId || null,
					lastMessage: roomData.lastMessage || '',
					createdAt: roomData.createdAt || null,
					opponent: opponentProfile,
				};
			})
		);

		res.json({ rooms });
	} catch (err) {
		console.error('❌ 상대방 프로필 포함 조회 실패:', err);
		res.status(500).json({ error: '채팅방 목록 조회 실패' });
	}
};

/**
 * participants 필드 추가/갱신용
 */
exports.addParticipants = async (req, res) => {
	const { roomId, participants } = req.body;
	if (!roomId || !Array.isArray(participants)) {
		return res.status(400).json({ error: 'roomId와 participants(Array)가 필요합니다.' });
	}

	try {
		await db.collection('chatRooms').doc(roomId).set({ participants }, { merge: true });

		res.json({ message: 'participants 필드 추가 완료' });
	} catch (err) {
		console.error('❌ participants 추가 실패:', err);
		res.status(500).json({ error: 'participants 추가 실패' });
	}
};
// 상품 상세 조회
exports.getItemDetail = async (req, res) => {
	const { itemId } = req.params;
	try {
		const docRef = doc(db, 'items', itemId);
		const docSnap = await getDoc(docRef);
		if (!docSnap.exists()) {
			return res.status(404).json({ error: '아이템을 찾을 수 없습니다.' });
		}
		res.json({ item: docSnap.data() });
	} catch (error) {
		console.error('아이템 로딩 오류:', error);
		res.status(500).json({ error: '서버 오류' });
	}
};

// 상품 수정
exports.updateItem = async (req, res) => {
	const { itemId } = req.params;
	const { name, description, imageURL } = req.body;
	try {
		await updateDoc(doc(db, 'items', itemId), { name, description, imageURL: imageURL || null });
		res.json({ message: '상품 수정 완료' });
	} catch (error) {
		console.error('상품 수정 오류:', error);
		res.status(500).json({ error: '서버 오류' });
	}
};

// 상품 삭제
exports.deleteItem = async (req, res) => {
	const { itemId } = req.params;
	try {
		await deleteDoc(doc(db, 'items', itemId));
		res.json({ message: '상품 삭제 완료' });
	} catch (error) {
		console.error('상품 삭제 오류:', error);
		res.status(500).json({ error: '서버 오류' });
	}
};

// 대여 요청
exports.requestRental = async (req, res) => {
	const { itemId } = req.params;
	const { requesterId, ownerId } = req.body;
	try {
		await addDoc(collection(db, 'rentals'), {
			itemId,
			requesterId,
			ownerId,
			status: 'pending',
			timestamp: serverTimestamp(),
		});
		res.json({ message: '대여 요청 완료' });
	} catch (error) {
		console.error('대여 요청 오류:', error);
		res.status(500).json({ error: '서버 오류' });
	}
};

// 대여 확정
exports.confirmRental = async (req, res) => {
	const { rentalId } = req.params;
	try {
		await updateDoc(doc(db, 'rentals', rentalId), { status: 'confirmed' });
		res.json({ message: '대여 확정 완료' });
	} catch (error) {
		console.error('대여 확정 오류:', error);
		res.status(500).json({ error: '서버 오류' });
	}
};

// 댓글 조회
exports.getComments = async (req, res) => {
	const { itemId } = req.params;
	try {
		const q = query(collection(db, 'comments'), where('itemId', '==', itemId), orderBy('timestamp', 'asc'));
		const snap = await getDocs(q);
		const comments = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
		res.json({ comments });
	} catch (error) {
		console.error('댓글 조회 오류:', error);
		res.status(500).json({ error: '서버 오류' });
	}
};

// 댓글 작성
exports.addComment = async (req, res) => {
	const { itemId } = req.params;
	const { userId, text } = req.body;
	try {
		await addDoc(collection(db, 'comments'), {
			itemId,
			userId,
			text,
			timestamp: serverTimestamp(),
		});
		res.json({ message: '댓글 작성 완료' });
	} catch (error) {
		console.error('댓글 작성 오류:', error);
		res.status(500).json({ error: '서버 오류' });
	}
};

// 대여 이력 조회
exports.getRentalHistory = async (req, res) => {
	const { itemId } = req.params;
	try {
		const q = query(collection(db, 'rentals'), where('itemId', '==', itemId), orderBy('timestamp', 'desc'));
		const snap = await getDocs(q);
		const rentals = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
		res.json({ rentals });
	} catch (error) {
		console.error('대여 기록 조회 오류:', error);
		res.status(500).json({ error: '서버 오류' });
	}
};
