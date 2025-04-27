// components/ChatService.js
import axios from 'axios';
import { API_URL } from '../api-config';
import { getAccessToken } from '../utils/auth'; // ✅ (토큰 가져오는 함수 만들 거야)

// ✅ 수정된 fetchMessages
export const fetchMessages = async (roomId) => {
  const token = await getAccessToken(); // 🔥
  
  const res = await axios.get(`${API_URL}/chat/rooms/${roomId}/messages`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data.messages;
};


// 나머지 sendMessage, markMessageAsRead는 그대로
export const sendMessage = async (roomId, senderId, text) => {
  const res = await axios.post(`${API_URL}/chat/messages`, {
    chatRoomId: roomId,
    senderId,
    text,
  });
  return res.data;
};

export const markMessageAsRead = async (roomId, messageId) => {
  await axios.patch(`${API_URL}/chat/messages/${messageId}/read`, { roomId });
};
