// controllers/chatController.js
require('dotenv').config(); // ⬅️ .env 파일 불러오기
const { admin, db } = require('../firebase/admin');
const { v4: uuidv4 } = require('uuid');
const { doc, getDoc, addDoc, collection, serverTimestamp, query, where, onSnapshot, deleteDoc, updateDoc, orderBy, getDocs } = require('firebase-admin/firestore');
const axios = require('axios');

const API_URL = process.env.API_URL || 'http://172.30.1.11:3000';


//채팅방 생성
exports.startChat = async (req, res) => {
	const { userId1, userId2, rentalItemId } = req.body;
	if (!userId1 || !userId2 || !rentalItemId) {
		return res.status(400).json({ error: 'userId1, userId2, rentalItemId 모두 필요합니다.' });
	}

	try {
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
			if (!chatRoom.data().buyerId) {
				await chatRoom.ref.update({ buyerId: userId1 });
			}
			return res.json({ chatRoomId: chatRoom.id, message: '기존 채팅방 있음' });
		}

		const newRef = await db.collection('chatRooms').add({
			rentalItemId,
			participants: [userId1, userId2],
			sellerId: userId2,
			buyerId: userId1,
			lastMessage: '',
			createdAt: new Date(),
		});

		res.json({ chatRoomId: newRef.id, message: '새 채팅방 생성됨' });
	} catch (err) {
		console.error('❌ 채팅방 생성 오류:', err);
		res.status(500).json({ error: err.message });
	}
};

// 미들웨어 예시
const authenticate = async (req, res, next) => {
	const token = req.headers.authorization?.split(' ')[1];
	if (!token) return res.status(401).json({ error: '토큰 누락' });

	try {
		const decoded = await admin.auth().verifyIdToken(token);
		req.user = decoded;
		next();
	} catch (err) {
		return res.status(401).json({ error: '유효하지 않은 토큰' });
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
	const { text, senderId, type = 'text', amount = null } = req.body;
	const { roomId } = req.params;
	if (!text || !senderId || !roomId) {
		return res.status(400).json({ error: 'text, senderId, roomId 모두 필요합니다.' });
	}

	let roomData, receiverId;
	try {
		// 1. 메시지 저장
		const messageData = {
			senderId,
			text,
			type,
			sentAt: admin.firestore.FieldValue.serverTimestamp(),
			createdAt: admin.firestore.FieldValue.serverTimestamp(),
			isRead: false,
		};
		if (amount !== null) {
			messageData.amount = amount;
		}

		await db.collection('chatRooms').doc(roomId).collection('messages').add(messageData);
		await db.collection('chatRooms').doc(roomId).set({ lastMessage: text }, { merge: true });

		// 2. 채팅방 정보에서 receiverId 계산
		const roomDoc = await db.collection('chatRooms').doc(roomId).get();
		roomData = roomDoc.data();
		if (!roomData || !roomData.participants) throw new Error('채팅방 데이터가 없습니다.');

		receiverId = roomData.participants.find((uid) => String(uid).trim() !== String(senderId).trim());

		if (!receiverId) {
			console.warn('⚠️ 수신자를 찾을 수 없습니다.');
			return res.status(200).json({ message: '메시지 저장됨 (수신자 없음)' });
		}

		// 3. 수신자의 pushToken 가져오기
		const userDoc = await db.collection('users').doc(receiverId).get();
		const userData = userDoc.data();

		if (!userData?.pushToken) {
			console.warn('⚠️ pushToken이 없습니다. 알림 생략');
			return res.status(200).json({ message: '메시지 저장됨 (알림 없음)' });
		}

		// 4. 알림 전송
		await axios.post(`${API_URL}/api/notifications/send`, {
			userId: receiverId,
			title: '📬 새로운 메시지',
			message: text,
		});

		res.json({ message: '메시지 저장 및 알림 전송 완료' });
	} catch (err) {
		console.error('❌ 메시지 저장 또는 알림 오류:', err);
		res.status(500).json({ error: '메시지 저장 또는 알림 실패' });
	}

	console.log('📨 senderId:', senderId);
	console.log('👥 participants:', roomData?.participants);
	console.log('🎯 receiverId:', receiverId);
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
				type: d.type || 'text', // ✅ 추가
				amount: d.amount || null, // ✅ 추가
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

				// 상대방 프로필
				let opponentProfile = {
					uid: opponentId,
					nickname: '알 수 없음',
					profileImage: null,
				};
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

				// 내 프로필
				let meProfile = {
					uid: currentUserId,
					nickname: '알 수 없음',
					profileImage: null,
				};
				const meDoc = await db.collection('users').doc(currentUserId).get();
				if (meDoc.exists) {
					const meData = meDoc.data();
					meProfile = {
						uid: currentUserId,
						nickname: meData.nickname || '이름없음',
						profileImage: meData.profileImage || null,
					};
				}

				return {
					id: roomId,
					sellerId: roomData.sellerId || null,
					buyerId: roomData.buyerId || null,
					rentalItemId: roomData.rentalItemId || null,
					lastMessage: roomData.lastMessage || '',
					createdAt: roomData.createdAt || null,
					opponent: opponentProfile,
					me: meProfile, // ✅ 이 줄이 프론트에서 필요
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
