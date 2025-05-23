// components/ChatService.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../firebase-config'; // e.g. "http://192.168.0.6:3000"
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../firebase-config';

// AsyncStorage에서 토큰 꺼내오기
async function getAccessToken() {
	const token = await AsyncStorage.getItem('accessToken');
	if (!token) throw new Error('No access token');
	return token;
}

/** 방 안의 모든 메시지 조회 */
export const fetchMessages = async (roomId) => {
	const q = query(collection(db, 'chatRooms', roomId, 'messages'), orderBy('createdAt', 'asc'));
	const snapshot = await getDocs(q);
	console.log('📦 메시지 수:', snapshot.size);

	return snapshot.docs.map((doc) => {
		const data = doc.data();
		const sentAtRaw = data.sentAt || data.createdAt || null;

		return {
			id: doc.id,
			...data,
			sentAt: sentAtRaw && typeof sentAtRaw.toDate === 'function' ? sentAtRaw.toDate() : null, // ✅ Invalid Date 방지
		};
	});
};

/** 메시지 전송 */
export async function sendMessage(roomId, senderId, text, type = 'text', amount = null) {
	const token = await getAccessToken();
	const payload = { text, senderId, type };

	if (amount !== null) {
		payload.amount = amount; // 🔥 보증금 금액 포함
	}

	const res = await axios.post(`${API_URL}/api/chat/rooms/${roomId}/messages`, payload, { headers: { Authorization: `Bearer ${token}` } });
	return res.data;
}

/** 메시지 읽음 처리 */
export async function markMessageAsRead(roomId, messageId) {
	const token = await getAccessToken();
	await axios.post(
		`${API_URL}/api/chat/rooms/${roomId}/messages/${messageId}/read`,
		{}, // req.body는 필요 없어요
		{ headers: { Authorization: `Bearer ${token}` } }
	);
}

export const getMessages = async (roomId, callback) => {
	const messagesRef = collection(db, 'chatRooms', roomId, 'messages');
	const q = query(messagesRef, orderBy('createdAt', 'asc'));

	return onSnapshot(q, (snapshot) => {
		const messages = snapshot.docs.map((doc) => {
			const data = doc.data();
			const sentAtRaw = data.sentAt || data.createdAt || null;

			return {
				id: doc.id,
				...data,
				sentAt: sentAtRaw && typeof sentAtRaw.toDate === 'function' ? sentAtRaw.toDate() : null,
			};
		});

		callback(messages);
	});
};
